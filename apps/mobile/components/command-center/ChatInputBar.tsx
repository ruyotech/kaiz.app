/**
 * ChatInputBar — Thin wrapper around ChatInput that connects to the command center store.
 *
 * This adapter bridges the existing ChatInput component (which handles camera, gallery,
 * documents, voice recording) with the Zustand store and SSE streaming architecture.
 *
 * Phase 2 note: The underlying ChatInput can be decomposed into VoiceRecordButton,
 * ImagePickerButton, etc. in a future refactor. For now it works as-is.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatInput, type Attachment } from '../chat/ChatInput';
import { useTheme } from '../../hooks/useTheme';

// ── Props ───────────────────────────────────────────────────────────────────

interface ChatInputBarProps {
  /** Called when user submits a message (text + optional attachments). */
  onSend: (message: string, attachments: Attachment[]) => void;
  /** Whether input is disabled (e.g. while streaming). */
  disabled?: boolean;
  /** Custom placeholder text. */
  placeholder?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export const ChatInputBar = React.memo(function ChatInputBar({
  onSend,
  disabled = false,
  placeholder = 'Ask your Scrum Master...',
}: ChatInputBarProps) {
  const { colors, isDark } = useTheme();

  const handleSend = useCallback(
    (message: string, attachments: Attachment[]) => {
      if (!message.trim() && attachments.length === 0) return;
      onSend(message, attachments);
    },
    [onSend],
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#fff', borderTopColor: colors.border }]}>
      <ChatInput
        onSend={handleSend}
        disabled={disabled}
        placeholder={placeholder}
        maxAttachments={5}
      />
    </View>
  );
});

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default ChatInputBar;
