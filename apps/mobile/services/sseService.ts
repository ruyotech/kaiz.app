/**
 * sseService — SSE streaming client for Command Center AI using react-native-sse.
 *
 * Why react-native-sse?
 *  - ReadableStream is NOT supported on Hermes (React Native's JS engine).
 *  - react-native-sse provides a native EventSource with POST support.
 *  - It works with Expo (no native module link needed — pure JS).
 *
 * The library's EventSource is generic: `EventSource<CustomEvents>` lets us
 * type-safely listen for named SSE events (text, draft, action, done).
 *
 * Usage:
 *   const handle = createSSEStream(body, { onText, onDraft, onDone, onError });
 *   // later…
 *   handle.close();
 */

import EventSource, {
  type CustomEvent,
  type ErrorEvent,
  type ExceptionEvent,
  type TimeoutEvent,
} from 'react-native-sse';
import { logger } from '../utils/logger';
import { getAccessToken } from './apiClient';
import type { DraftPreview } from '../types/commandCenter';

const TAG = 'SSEService';

// ── Custom event names the backend sends ────────────────────────────────────

type SSECustomEvents = 'text' | 'draft' | 'action' | 'done';

// ── Public types ────────────────────────────────────────────────────────────

export interface SSECallbacks {
  /** Incremental text token. */
  onText: (token: string) => void;
  /** A structured draft parsed by the backend. */
  onDraft: (draft: DraftPreview) => void;
  /** An action payload (e.g. ceremony entry). */
  onAction?: (payload: Record<string, unknown>) => void;
  /** Stream finished successfully. */
  onDone: (sessionId?: string) => void;
  /** Unrecoverable error. */
  onError: (error: string) => void;
}

export interface SSEHandle {
  /** Close the SSE connection. */
  close: () => void;
}

// ── API base ────────────────────────────────────────────────────────────────

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  return envUrl || 'https://kaiz-api-213334506754.us-central1.run.app';
};

// ── Stream factory ──────────────────────────────────────────────────────────

/**
 * Open a POST-based SSE connection to the Command Center streaming endpoint.
 *
 * react-native-sse supports `method: 'POST'` and `body` in its options,
 * which lets us send the full request payload while receiving SSE events.
 *
 * The backend sends named events:
 *   - `text`   → { token: string }            (incremental text)
 *   - `draft`  → DraftPreview JSON             (structured draft)
 *   - `action` → { action: string, payload: object }
 *   - `done`   → { sessionId?: string }        (stream end)
 *   - `error`  → built-in SSE error event      (failure)
 */
export async function createSSEStream(
  requestBody: {
    text?: string;
    attachments?: Array<{ type: string; uri: string; mimeType: string; name: string }>;
    sessionId?: string;
    mode?: string;
    ceremonyContext?: Record<string, unknown>;
  },
  callbacks: SSECallbacks,
): Promise<SSEHandle> {
  const url = `${getBaseUrl()}/api/v1/command-center/stream`;
  const token = await getAccessToken();

  if (!token) {
    callbacks.onError('Not authenticated');
    return { close: () => {} };
  }

  logger.info(TAG, `Opening SSE POST stream to ${url}`);

  const es = new EventSource<SSECustomEvents>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(requestBody),
  });

  // ── Named event listeners ─────────────────────────────────────────────

  es.addEventListener('text', (event: CustomEvent<'text'>) => {
    if (!event.data) return;
    try {
      const parsed: { token: string } = JSON.parse(event.data);
      callbacks.onText(parsed.token);
    } catch {
      // If not JSON, treat the raw data as the text token
      callbacks.onText(event.data);
    }
  });

  es.addEventListener('draft', (event: CustomEvent<'draft'>) => {
    if (!event.data) return;
    try {
      const draft = JSON.parse(event.data) as DraftPreview;
      callbacks.onDraft(draft);
    } catch (err: unknown) {
      logger.warn(TAG, 'Failed to parse draft event', err);
    }
  });

  es.addEventListener('action', (event: CustomEvent<'action'>) => {
    if (!event.data || !callbacks.onAction) return;
    try {
      const payload = JSON.parse(event.data) as Record<string, unknown>;
      callbacks.onAction(payload);
    } catch (err: unknown) {
      logger.warn(TAG, 'Failed to parse action event', err);
    }
  });

  es.addEventListener('done', (event: CustomEvent<'done'>) => {
    let sessionId: string | undefined;
    if (event.data) {
      try {
        const parsed: { sessionId?: string } = JSON.parse(event.data);
        sessionId = parsed.sessionId;
      } catch {
        // no session id in done event
      }
    }
    callbacks.onDone(sessionId);
    es.close();
  });

  // ── Fallback: unnamed `message` events ────────────────────────────────
  // Some backends emit data without named events. Parse the JSON `type` field.

  es.addEventListener('message', (event) => {
    if (!event.data) return;
    try {
      const parsed = JSON.parse(event.data) as {
        type?: string;
        token?: string;
        draft?: DraftPreview;
        action?: string;
        payload?: Record<string, unknown>;
        sessionId?: string;
        message?: string;
      };

      switch (parsed.type) {
        case 'text':
          if (parsed.token) callbacks.onText(parsed.token);
          break;
        case 'draft':
          if (parsed.draft) callbacks.onDraft(parsed.draft);
          break;
        case 'action':
          if (parsed.payload) callbacks.onAction?.(parsed.payload);
          break;
        case 'done':
          callbacks.onDone(parsed.sessionId);
          es.close();
          break;
        case 'error':
          callbacks.onError(parsed.message || 'Unknown error');
          es.close();
          break;
        default:
          // Plain text token
          if (parsed.token) {
            callbacks.onText(parsed.token);
          }
      }
    } catch {
      // Not JSON — treat as plain text
      callbacks.onText(event.data);
    }
  });

  // ── Error handling ────────────────────────────────────────────────────

  es.addEventListener('error', (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
    if (event.type === 'error') {
      const err = event as ErrorEvent;
      logger.error(TAG, `SSE error: ${err.message} (xhr: ${err.xhrStatus})`);
      callbacks.onError(err.message || `SSE error: ${err.xhrStatus}`);
    } else if (event.type === 'timeout') {
      logger.error(TAG, 'SSE connection timed out');
      callbacks.onError('Connection timed out');
    } else if (event.type === 'exception') {
      const exc = event as ExceptionEvent;
      logger.error(TAG, `SSE exception: ${exc.message}`, exc.error);
      callbacks.onError(exc.message);
    }
    es.close();
  });

  return {
    close: () => {
      es.close();
      logger.info(TAG, 'SSE stream closed by client');
    },
  };
}
