/**
 * Command Center Store — Zustand state for the AI Scrum Master chat.
 *
 * Manages: messages, active session, ceremony mode, streaming state,
 * pending drafts queue, and error state.
 *
 * Rules:
 * - Server state (drafts list, conversation history) → TanStack Query.
 * - UI / ephemeral state (current messages, streaming flag) → here.
 */

import { create } from 'zustand';
import { logger } from '../utils/logger';
import type {
  ChatMode,
  CoachChatMessage,
  SSEChunk,
  DraftPreview,
  CeremonyContext,
} from '../types/commandCenter';

const TAG = 'CommandCenterStore';

// ─── State ──────────────────────────────────────────────────────────────────

interface CommandCenterState {
  /** All messages in the current conversation */
  messages: CoachChatMessage[];

  /** Active conversation session UUID (from backend) */
  activeSessionId: string | null;

  /** Current chat mode (server-authoritative, client may pre-set) */
  currentMode: ChatMode;

  /** Active ceremony context (sprint planning, standup, retro) */
  ceremonyContext: CeremonyContext | null;

  /** Whether we are currently receiving SSE tokens */
  isStreaming: boolean;

  /** Accumulated streaming text for the in-progress coach message */
  streamingText: string;

  /** Queue of draft approval cards awaiting user action */
  draftQueue: DraftPreview[];

  /** Last error message (cleared on next send) */
  error: string | null;

  /** Whether the chat input is disabled (during send / streaming) */
  inputDisabled: boolean;
}

// ─── Actions ────────────────────────────────────────────────────────────────

interface CommandCenterActions {
  /** Add a user message to the conversation */
  addUserMessage: (text: string, attachments?: CoachChatMessage['attachments']) => void;

  /** Start streaming: add a placeholder coach message */
  startStreaming: () => void;

  /** Append a text token to the streaming coach message */
  appendToken: (token: string) => void;

  /** Handle a draft chunk from SSE — enqueue for approval */
  enqueueDraft: (draft: DraftPreview) => void;

  /** Handle an action chunk from SSE */
  handleAction: (action: SSEChunk & { type: 'action' }) => void;

  /** Finalize streaming: convert placeholder to final message */
  finishStreaming: (conversationId?: string, mode?: ChatMode) => void;

  /** Handle SSE error */
  handleStreamError: (message: string) => void;

  /** Remove a draft from the queue after user action */
  removeDraft: (draftId: string) => void;

  /** Set the active ceremony context */
  setCeremonyContext: (ctx: CeremonyContext | null) => void;

  /** Set the chat mode */
  setMode: (mode: ChatMode) => void;

  /** Set the active session ID */
  setSessionId: (id: string | null) => void;

  /** Clear the error */
  clearError: () => void;

  /** Reset the entire conversation (e.g., on screen unmount or new session) */
  resetConversation: () => void;

  /** Load previous messages (e.g., from conversation history endpoint) */
  loadMessages: (messages: CoachChatMessage[]) => void;
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: CommandCenterState = {
  messages: [],
  activeSessionId: null,
  currentMode: 'FREEFORM',
  ceremonyContext: null,
  isStreaming: false,
  streamingText: '',
  draftQueue: [],
  error: null,
  inputDisabled: false,
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useCommandCenterStore = create<CommandCenterState & CommandCenterActions>()(
  (set, get) => ({
    ...initialState,

    addUserMessage: (text, attachments) => {
      const msg: CoachChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
        status: 'sending',
        attachments,
      };
      set((s) => ({
        messages: [...s.messages, msg],
        error: null,
        inputDisabled: true,
      }));
      logger.info(TAG, `User message added: ${text.slice(0, 50)}…`);
    },

    startStreaming: () => {
      const placeholder: CoachChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'coach',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      set((s) => ({
        messages: [...s.messages, placeholder],
        isStreaming: true,
        streamingText: '',
      }));
    },

    appendToken: (token) => {
      set((s) => {
        const updated = [...s.messages];
        const last = updated[updated.length - 1];
        if (last && last.role === 'coach' && last.isStreaming) {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + token,
          };
        }
        return { messages: updated, streamingText: s.streamingText + token };
      });
    },

    enqueueDraft: (draft) => {
      set((s) => ({
        draftQueue: [...s.draftQueue, draft],
      }));

      // Also attach draft to the current streaming coach message
      set((s) => {
        const updated = [...s.messages];
        const last = updated[updated.length - 1];
        if (last && last.role === 'coach') {
          updated[updated.length - 1] = {
            ...last,
            drafts: [...(last.drafts ?? []), draft],
          };
        }
        return { messages: updated };
      });
      logger.info(TAG, `Draft enqueued: ${draft.draftType} — ${draft.title}`);
    },

    handleAction: (action) => {
      const systemMsg: CoachChatMessage = {
        id: `action-${Date.now()}`,
        role: 'system',
        content: `Action: ${action.action}`,
        timestamp: new Date(),
        actionPayload: action.payload,
      };
      set((s) => ({ messages: [...s.messages, systemMsg] }));
      logger.info(TAG, `Action received: ${action.action}`);
    },

    finishStreaming: (conversationId, mode) => {
      set((s) => {
        const updated = [...s.messages];
        // Mark the last user message as "sent"
        const userIdx = updated.findLastIndex((m) => m.role === 'user' && m.status === 'sending');
        if (userIdx >= 0) {
          updated[userIdx] = { ...updated[userIdx], status: 'sent' };
        }
        // Finalize the coach message
        const coachIdx = updated.findLastIndex((m) => m.role === 'coach' && m.isStreaming);
        if (coachIdx >= 0) {
          updated[coachIdx] = { ...updated[coachIdx], isStreaming: false };
        }
        return {
          messages: updated,
          isStreaming: false,
          streamingText: '',
          inputDisabled: false,
          ...(conversationId ? { activeSessionId: conversationId } : {}),
          ...(mode ? { currentMode: mode } : {}),
        };
      });
    },

    handleStreamError: (message) => {
      set((s) => {
        const updated = [...s.messages];
        // Remove the placeholder streaming message if empty
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'coach' && updated[lastIdx].isStreaming) {
          if (!updated[lastIdx].content) {
            updated.pop();
          } else {
            updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
          }
        }
        // Mark last user message as error
        const userIdx = updated.findLastIndex((m) => m.role === 'user' && m.status === 'sending');
        if (userIdx >= 0) {
          updated[userIdx] = { ...updated[userIdx], status: 'error' };
        }
        return {
          messages: updated,
          isStreaming: false,
          streamingText: '',
          error: message,
          inputDisabled: false,
        };
      });
      logger.error(TAG, `Stream error: ${message}`);
    },

    removeDraft: (draftId) => {
      set((s) => ({
        draftQueue: s.draftQueue.filter((d) => d.id !== draftId),
      }));
    },

    setCeremonyContext: (ctx) => set({ ceremonyContext: ctx }),
    setMode: (mode) => set({ currentMode: mode }),
    setSessionId: (id) => set({ activeSessionId: id }),
    clearError: () => set({ error: null }),

    resetConversation: () => {
      set(initialState);
      logger.info(TAG, 'Conversation reset');
    },

    loadMessages: (messages) => {
      set({ messages });
      logger.info(TAG, `Loaded ${messages.length} messages from history`);
    },
  }),
);
