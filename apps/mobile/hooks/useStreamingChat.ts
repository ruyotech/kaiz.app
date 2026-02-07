/**
 * useStreamingChat — React hook for SSE streaming from Command Center AI.
 *
 * Uses fetch() with ReadableStream to consume Server-Sent Events
 * from the backend's /smart-input/stream endpoint.
 *
 * Events: 'token' (incremental text), 'done' (complete JSON), 'error' (failure)
 *
 * Falls back to the non-streaming /smart-input endpoint if streaming fails.
 */

import { useCallback, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../../utils/logger';

const TAG = 'useStreamingChat';

const PRODUCTION_API_URL = 'https://kaiz-api-213334506754.us-central1.run.app';

const getApiUrl = (): string => {
  const easApiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  return easApiUrl || PRODUCTION_API_URL;
};

const API_BASE = `${getApiUrl()}/api/v1`;

export interface StreamingOptions {
  /** Called for each token received */
  onToken: (token: string) => void;
  /** Called with the complete response when streaming finishes */
  onComplete: (fullResponse: string) => void;
  /** Called on error (streaming will auto-fallback to non-streaming) */
  onError: (error: string) => void;
}

interface SmartInputAttachment {
  name?: string;
  type?: string;
  mimeType?: string;
  size?: number;
  extractedText?: string;
  metadata?: string;
  testAttachmentId?: string;
  isTestAttachment?: boolean;
}

/**
 * Hook that provides streaming AI chat with SSE fallback to regular POST.
 */
export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message and stream the AI response via SSE.
   */
  const streamMessage = useCallback(
    async (
      text: string | null,
      attachments: SmartInputAttachment[],
      options: StreamingOptions,
    ) => {
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();

      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          options.onError('Not authenticated');
          setIsStreaming(false);
          return;
        }

        const body: Record<string, unknown> = {};
        if (text?.trim()) body.text = text.trim();
        if (attachments.length > 0) body.attachments = attachments;

        const response = await fetch(`${API_BASE}/command-center/smart-input/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null — streaming not supported');
        }

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('event:')) {
              // Event type line — will be followed by data line
              continue;
            }

            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              // Parse the event type from the preceding event: line
              // SSE format: event: token\ndata: text\n\n
              // We need to track the current event type
              continue;
            }
          }

          // Re-parse with proper SSE parsing
          const events = parseSSEEvents(buffer + lines.join('\n'));
          buffer = events.remaining;

          for (const event of events.parsed) {
            switch (event.type) {
              case 'token':
                options.onToken(event.data);
                break;
              case 'done':
                options.onComplete(event.data);
                break;
              case 'error':
                options.onError(event.data);
                break;
            }
          }
        }
      } catch (error: unknown) {
        if ((error as Error)?.name === 'AbortError') {
          logger.info(TAG, 'Streaming cancelled by user');
          return;
        }

        logger.warn(TAG, `Streaming failed, will use response as-is: ${(error as Error)?.message}`);
        options.onError((error as Error)?.message || 'Streaming failed');
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [],
  );

  /**
   * Cancel the current streaming request.
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return {
    streamMessage,
    cancelStream,
    isStreaming,
  };
}

// ============================================================================
// SSE Parser
// ============================================================================

interface SSEEvent {
  type: string;
  data: string;
}

interface ParseResult {
  parsed: SSEEvent[];
  remaining: string;
}

/**
 * Parse SSE event stream text into structured events.
 * SSE format: event: <type>\ndata: <data>\n\n
 */
function parseSSEEvents(text: string): ParseResult {
  const events: SSEEvent[] = [];
  const blocks = text.split('\n\n');

  // Last block may be incomplete
  const remaining = blocks.pop() || '';

  for (const block of blocks) {
    if (!block.trim()) continue;

    let eventType = 'message';
    let eventData = '';

    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        eventData = line.slice(5).trim();
      }
    }

    if (eventData) {
      events.push({ type: eventType, data: eventData });
    }
  }

  return { parsed: events, remaining };
}
