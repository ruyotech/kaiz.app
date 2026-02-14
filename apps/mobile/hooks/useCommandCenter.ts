/**
 * useCommandCenter — React hook bridging the SSE service, REST API, and Zustand store.
 *
 * Responsibilities:
 *   1. Orchestrate message send → SSE stream → store updates.
 *   2. Provide draft action handlers (approve / reject / edit).
 *   3. Manage conversation session lifecycle.
 *   4. Fallback to REST when SSE endpoint is unavailable (Phase 3 bridge).
 *
 * Usage in CommandCenterScreen:
 *   const { sendMessage, approveDraft, rejectDraft, editDraft } = useCommandCenter();
 *
 * Rules:
 *   - This is the ONLY place that calls SSE / REST API for chat.
 *   - Screen components remain pure presentation.
 *   - Store mutations go through this hook, not direct store calls from screen.
 */

import { useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { logger } from '../utils/logger';
import { useCommandCenterStore } from '../store/commandCenterStore';
import { commandCenterApi } from '../services/api';
import { createSSEStream, type SSEHandle } from '../services/sseService';
import type {
  DraftPreview,
  SmartInputAttachment,
} from '../types/commandCenter';
import type { Attachment } from '../components/chat/ChatInput';

const TAG = 'useCommandCenter';

// Whether to attempt SSE streaming. Set to `true` once the backend endpoint exists.
const SSE_ENABLED = false;

// ─── Return type ────────────────────────────────────────────────────────────

export interface UseCommandCenterReturn {
  /** Send a user message (text + optional attachments). Handles SSE or REST fallback. */
  sendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  /** Approve a draft preview → creates the real entity. */
  approveDraft: (draft: DraftPreview) => Promise<void>;
  /** Reject a draft preview → discards it. */
  rejectDraft: (draft: DraftPreview) => Promise<void>;
  /** Navigate to draft detail screen for editing. */
  editDraft: (draft: DraftPreview) => void;
  /** Whether we're currently processing a response (REST or SSE). */
  isProcessing: boolean;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCommandCenter(): UseCommandCenterReturn {
  const router = useRouter();
  const sseRef = useRef<SSEHandle | null>(null);

  // Store selectors (stable — Zustand uses strict equality by default)
  const isStreaming = useCommandCenterStore((s) => s.isStreaming);
  const inputDisabled = useCommandCenterStore((s) => s.inputDisabled);

  // ── helpers ─────────────────────────────────────────────────────────────

  /** Map a ChatInput Attachment to the shape expected by the SSE service / REST API. */
  const mapAttachments = useCallback(
    (attachments: Attachment[]): SmartInputAttachment[] =>
      attachments.map((a) => ({
        type: a.type === 'file' ? ('document' as const) : (a.type as 'image' | 'audio' | 'document'),
        uri: a.uri,
        mimeType: a.mimeType,
        name: a.name,
      })),
    [],
  );

  /** Map ChatInput attachments to the store-friendly format (with generated IDs). */
  const mapStoreAttachments = useCallback(
    (attachments: Attachment[]) =>
      attachments.map((a) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: a.name,
        type: a.type === 'file' ? ('document' as const) : a.type,
        mimeType: a.mimeType,
        uri: a.uri,
        size: a.size,
      })),
    [],
  );

  // ── SSE send ────────────────────────────────────────────────────────────

  const sendViaSSE = useCallback(
    async (text: string, attachments: Attachment[]) => {
      const store = useCommandCenterStore.getState();

      store.startStreaming();

      const mapped = mapAttachments(attachments);

      sseRef.current = await createSSEStream(
        {
          text: text.trim() || undefined,
          attachments: mapped.length > 0
            ? mapped.map((a) => ({
                type: a.type,
                uri: a.uri ?? '',
                mimeType: a.mimeType,
                name: a.name,
              }))
            : undefined,
          sessionId: store.activeSessionId ?? undefined,
          mode: store.currentMode,
          ceremonyContext: store.ceremonyContext
            ? (store.ceremonyContext as unknown as Record<string, unknown>)
            : undefined,
        },
        {
          onText: (token: string) => {
            useCommandCenterStore.getState().appendToken(token);
          },
          onDraft: (draft: DraftPreview) => {
            useCommandCenterStore.getState().enqueueDraft(draft);
          },
          onAction: (payload: Record<string, unknown>) => {
            useCommandCenterStore.getState().handleAction({
              type: 'action',
              action: (payload.action as string) ?? 'unknown',
              payload,
              done: false,
            });
          },
          onDone: (sessionId?: string) => {
            useCommandCenterStore.getState().finishStreaming(sessionId ?? undefined);
            sseRef.current = null;
          },
          onError: (msg: string) => {
            useCommandCenterStore.getState().handleStreamError(msg);
            sseRef.current = null;
          },
        },
      );
    },
    [mapAttachments],
  );

  // ── REST fallback send ──────────────────────────────────────────────────

  const sendViaREST = useCallback(
    async (text: string, attachments: Attachment[]) => {
      try {
        const store = useCommandCenterStore.getState();
        const hasFiles = attachments.some((a) => a.uri);

        let response;

        if (hasFiles && attachments.length > 0) {
          // Use multipart endpoint for real file uploads (OCR, transcription)
          response = await commandCenterApi.sendMessageWithFiles(
            text.trim() || null,
            attachments.map((a) => ({
              uri: a.uri,
              name: a.name,
              mimeType: a.mimeType,
            })),
            store.activeSessionId ?? undefined,
          );
        } else {
          // Use JSON endpoint for text + metadata-only attachments
          const mapped = mapAttachments(attachments);
          response = await commandCenterApi.sendMessage(
            text.trim() || null,
            mapped,
            store.activeSessionId ?? undefined,
          );
        }

        if (!response.success || !response.data) {
          const errMsg =
            typeof response.error === 'string'
              ? response.error
              : response.error?.message ?? 'Failed to get a response';
          throw new Error(errMsg);
        }

        const aiResponse = response.data;

        // Build coach message from REST response
        const coachMsg = {
          id: `coach-${Date.now()}`,
          role: 'coach' as const,
          content:
            aiResponse.reasoning ||
            aiResponse.suggestions?.join('\n') ||
            'I processed your input.',
          timestamp: new Date(),
          drafts: aiResponse.draft ? [aiResponse.draft as unknown as DraftPreview] : undefined,
          clarification: aiResponse.clarifyingQuestions?.length
            ? {
                sessionId: aiResponse.id ?? '',
                questions: aiResponse.clarifyingQuestions.map((q: string, i: number) => ({
                  id: `q-${i}`,
                  question: q,
                  fieldKey: `field-${i}`,
                  inputType: 'text' as const,
                })),
                questionCount: aiResponse.clarifyingQuestions.length,
                maxQuestions: aiResponse.clarifyingQuestions.length,
              }
            : undefined,
        };

        useCommandCenterStore.getState().loadMessages([
          ...useCommandCenterStore.getState().messages,
          coachMsg,
        ]);

        // Update session if provided
        if (aiResponse.id) {
          useCommandCenterStore.getState().setSessionId(aiResponse.id);
        }

        // Mark user message as sent and re-enable input
        useCommandCenterStore.getState().finishStreaming();
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to get a response. Please try again.';
        logger.error(TAG, 'REST send failed', err);
        useCommandCenterStore.getState().handleStreamError(msg);
      }
    },
    [mapAttachments],
  );

  // ── Public: sendMessage ─────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string, attachments: Attachment[]) => {
      if (!text.trim() && attachments.length === 0) return;

      // 1. Add user message to store
      useCommandCenterStore
        .getState()
        .addUserMessage(text, mapStoreAttachments(attachments));

      // 2. Send via SSE or REST
      if (SSE_ENABLED) {
        await sendViaSSE(text, attachments);
      } else {
        await sendViaREST(text, attachments);
      }
    },
    [mapStoreAttachments, sendViaSSE, sendViaREST],
  );

  // ── Public: draft actions ───────────────────────────────────────────────

  const approveDraft = useCallback(async (draft: DraftPreview) => {
    try {
      const result = await commandCenterApi.approveDraft(draft.id);
      if (result.success) {
        useCommandCenterStore.getState().removeDraft(draft.id);
        Alert.alert('Approved', `${draft.title} has been created!`);
      } else {
        const errMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to approve draft';
        throw new Error(errMsg);
      }
    } catch (err: unknown) {
      logger.error(TAG, 'Draft approve failed', err);
      Alert.alert('Error', 'Failed to approve draft. Please try again.');
    }
  }, []);

  const rejectDraft = useCallback(async (draft: DraftPreview) => {
    try {
      const result = await commandCenterApi.rejectDraft(draft.id);
      if (result.success) {
        useCommandCenterStore.getState().removeDraft(draft.id);
        Alert.alert('Rejected', 'Draft has been discarded.');
      } else {
        const errMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to reject draft';
        throw new Error(errMsg);
      }
    } catch (err: unknown) {
      logger.error(TAG, 'Draft reject failed', err);
      Alert.alert('Error', 'Failed to reject draft. Please try again.');
    }
  }, []);

  const editDraft = useCallback(
    (draft: DraftPreview) => {
      router.push({
        pathname: '/(tabs)/command-center/draft-detail',
        params: { draftId: draft.id },
      });
    },
    [router],
  );

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    sendMessage,
    approveDraft,
    rejectDraft,
    editDraft,
    isProcessing: isStreaming || inputDisabled,
  };
}
