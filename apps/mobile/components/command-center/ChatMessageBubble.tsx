/**
 * ChatMessageBubble — Renders a single chat message (user, coach, or system).
 *
 * Pure presentation component — all business logic is handled via callbacks.
 * Uses CoachChatMessage from the unified type system.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StreamingTextRenderer } from './StreamingTextRenderer';
import type {
  CoachChatMessage,
  DraftPreview,
  ClarificationRequest,
} from '../../types/commandCenter';
import {
  getDraftTypeDisplayName,
  getDraftTypeIcon,
  getDraftTypeColor,
} from '../../types/commandCenter';

// ── Props ───────────────────────────────────────────────────────────────────

export interface ChatMessageBubbleProps {
  message: CoachChatMessage;
  /** Called when user presses "Confirm" on a draft. */
  onDraftConfirm?: (draft: DraftPreview) => void;
  /** Called when user presses "Reject" on a draft. */
  onDraftReject?: (draft: DraftPreview) => void;
  /** Called when user presses "Edit / Create" on a draft to open form. */
  onDraftEdit?: (draft: DraftPreview) => void;
  /** Whether a draft action is in progress (disables buttons). */
  isProcessing?: boolean;
}

// ── Main Component ──────────────────────────────────────────────────────────

export const ChatMessageBubble = React.memo(function ChatMessageBubble({
  message,
  onDraftConfirm,
  onDraftReject,
  onDraftEdit,
  isProcessing,
}: ChatMessageBubbleProps) {
  switch (message.role) {
    case 'user':
      return <UserBubble message={message} />;
    case 'system':
      return <SystemBubble message={message} />;
    case 'coach':
    default:
      return (
        <CoachBubble
          message={message}
          onDraftConfirm={onDraftConfirm}
          onDraftReject={onDraftReject}
          onDraftEdit={onDraftEdit}
          isProcessing={isProcessing}
        />
      );
  }
});

// ── User Bubble ─────────────────────────────────────────────────────────────

const UserBubble = React.memo(function UserBubble({ message }: { message: CoachChatMessage }) {
  const { colors } = useTheme();

  return (
    <View style={styles.userRow}>
      <View style={styles.userBubbleWrap}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentRow}>
            {message.attachments.map((att, i) => (
              <View key={i} style={styles.attachmentChip}>
                <MaterialCommunityIcons
                  name={getAttachmentIcon(att.type)}
                  size={14}
                  color="#fff"
                />
                <Text style={styles.attachmentText} numberOfLines={1}>
                  {att.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Message bubble */}
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={styles.userText}>{message.content}</Text>
          <Text style={styles.userTimestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
});

// ── Coach Bubble ────────────────────────────────────────────────────────────

interface CoachBubbleProps {
  message: CoachChatMessage;
  onDraftConfirm?: (draft: DraftPreview) => void;
  onDraftReject?: (draft: DraftPreview) => void;
  onDraftEdit?: (draft: DraftPreview) => void;
  isProcessing?: boolean;
}

const CoachBubble = React.memo(function CoachBubble({
  message,
  onDraftConfirm,
  onDraftReject,
  onDraftEdit,
  isProcessing,
}: CoachBubbleProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.coachRow}>
      {/* Avatar */}
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#312E81' : '#EDE9FE' }]}>
          <MaterialCommunityIcons name="robot" size={18} color="#8B5CF6" />
        </View>
        <Text style={[styles.coachLabel, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
          Scrum Master
        </Text>
        {message.isStreaming && (
          <ActivityIndicator size="small" color="#8B5CF6" style={{ marginLeft: 6 }} />
        )}
      </View>

      {/* Content */}
      <View style={styles.coachContent}>
        {message.isStreaming && !message.content ? (
          <ThinkingIndicator isDark={isDark} />
        ) : message.drafts && message.drafts.length > 0 ? (
          <View>
            {/* Text content before drafts */}
            {message.content ? (
              <View style={[styles.coachBubble, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                <StreamingTextRenderer
                  text={message.content}
                  isStreaming={message.isStreaming}
                  textColor={colors.text}
                />
              </View>
            ) : null}
            {/* Draft cards */}
            {message.drafts.map((draft, i) => (
              <InlineDraftCard
                key={draft.id ?? `draft-${i}`}
                draft={draft}
                onConfirm={onDraftConfirm}
                onReject={onDraftReject}
                onEdit={onDraftEdit}
                isProcessing={isProcessing}
              />
            ))}
          </View>
        ) : message.clarification ? (
          <ClarificationCard clarification={message.clarification} isDark={isDark} colors={colors} />
        ) : (
          <View style={[styles.coachBubble, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <StreamingTextRenderer
              text={message.content}
              isStreaming={message.isStreaming}
              textColor={colors.text}
            />
            {!message.isStreaming && (
              <Text style={[styles.coachTimestamp, { color: colors.textTertiary }]}>
                {formatTime(message.timestamp)}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

// ── Thinking Indicator ──────────────────────────────────────────────────────

const ThinkingIndicator = React.memo(function ThinkingIndicator({ isDark }: { isDark: boolean }) {
  return (
    <View style={[styles.coachBubble, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
      <View style={styles.thinkingRow}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: '#A78BFA' }]}
            />
          ))}
        </View>
        <Text style={{ color: '#9CA3AF', marginLeft: 8, fontSize: 13 }}>Thinking...</Text>
      </View>
    </View>
  );
});

// ── Inline Draft Card ───────────────────────────────────────────────────────

interface InlineDraftCardProps {
  draft: DraftPreview;
  onConfirm?: (draft: DraftPreview) => void;
  onReject?: (draft: DraftPreview) => void;
  onEdit?: (draft: DraftPreview) => void;
  isProcessing?: boolean;
}

const InlineDraftCard = React.memo(function InlineDraftCard({
  draft,
  onConfirm,
  onReject,
  onEdit,
  isProcessing,
}: InlineDraftCardProps) {
  const { isDark } = useTheme();
  const typeColor = getDraftTypeColor(draft.draftType);
  const typeIcon = getDraftTypeIcon(draft.draftType);
  const typeName = getDraftTypeDisplayName(draft.draftType);

  return (
    <View style={[styles.draftCard, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
      {/* Header */}
      <View style={[styles.draftHeader, { backgroundColor: typeColor + '15' }]}>
        <View style={[styles.draftIconWrap, { backgroundColor: typeColor + '25' }]}>
          <MaterialCommunityIcons name={typeIcon as never} size={20} color={typeColor} />
        </View>
        <View style={styles.draftHeaderText}>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{typeName}</Text>
          <Text
            style={{ fontSize: 15, fontWeight: '600', color: isDark ? '#F3F4F6' : '#111827' }}
            numberOfLines={1}
          >
            {draft.title}
          </Text>
        </View>
        {draft.confidence != null && (
          <View style={[styles.confidenceBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: typeColor }}>
              {Math.round(draft.confidence * 100)}%
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {draft.description ? (
        <View style={styles.draftBody}>
          <Text
            style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#4B5563' }}
            numberOfLines={3}
          >
            {draft.description}
          </Text>
        </View>
      ) : null}

      {/* AI Reasoning */}
      {draft.reasoning ? (
        <View style={styles.draftReasoning}>
          <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#8B5CF6" />
          <Text
            style={{ fontSize: 11, color: '#8B5CF6', marginLeft: 4, flex: 1 }}
            numberOfLines={2}
          >
            {draft.reasoning}
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={[styles.draftActions, { borderTopColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <TouchableOpacity
          onPress={() => onReject?.(draft)}
          disabled={isProcessing}
          style={[styles.draftBtn, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
        >
          <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontWeight: '500' }}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onConfirm?.(draft)}
          disabled={isProcessing}
          style={[styles.draftBtn, { backgroundColor: typeColor }]}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
              <Text style={styles.draftBtnText}>Confirm</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEdit?.(draft)}
          disabled={isProcessing}
          style={[styles.draftBtn, { backgroundColor: '#16A34A' }]}
        >
          <MaterialCommunityIcons name="plus-circle" size={16} color="#fff" />
          <Text style={styles.draftBtnText}>
            {draft.draftType === 'EVENT' ? 'Create Event' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ── Clarification Card ──────────────────────────────────────────────────────

interface ClarificationCardProps {
  clarification: ClarificationRequest;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

const ClarificationCard = React.memo(function ClarificationCard({
  clarification,
  isDark,
  colors,
}: ClarificationCardProps) {
  return (
    <View
      style={[
        styles.clarificationCard,
        { backgroundColor: isDark ? '#451A03' : '#FFFBEB', borderColor: isDark ? '#78350F' : '#FDE68A' },
      ]}
    >
      <View style={styles.clarificationHeader}>
        <MaterialCommunityIcons name="help-circle-outline" size={20} color="#F59E0B" />
        <Text style={[styles.clarificationTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>
          Need a bit more info
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: isDark ? '#FCD34D' : '#B45309', marginBottom: 8 }}>
        Question {clarification.questionCount} of {clarification.maxQuestions}
      </Text>
      {clarification.questions.map((q) => (
        <View key={q.id} style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>{q.question}</Text>
        </View>
      ))}
    </View>
  );
});

// ── System Bubble ───────────────────────────────────────────────────────────

const SystemBubble = React.memo(function SystemBubble({ message }: { message: CoachChatMessage }) {
  const isSuccess =
    message.content.includes('successfully') ||
    message.content.includes('created') ||
    message.content.includes('saved to pending');
  const isError =
    message.content.includes('rejected') ||
    message.content.includes('error') ||
    message.content.includes('failed');

  const bg = isSuccess ? '#DCFCE7' : isError ? '#FEE2E2' : '#F3F4F6';
  const fg = isSuccess ? '#166534' : isError ? '#991B1B' : '#4B5563';

  return (
    <View style={styles.systemRow}>
      <View style={[styles.systemPill, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 13, color: fg }}>{message.content}</Text>
      </View>
    </View>
  );
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAttachmentIcon(type: string): 'image' | 'microphone' | 'file-pdf-box' | 'file-document' | 'file' {
  switch (type) {
    case 'image': return 'image';
    case 'audio': return 'microphone';
    case 'pdf': return 'file-pdf-box';
    case 'document': return 'file-document';
    default: return 'file';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // User
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16, paddingHorizontal: 16 },
  userBubbleWrap: { maxWidth: '85%' },
  userBubble: { borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  userTimestamp: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 6, textAlign: 'right' },
  attachmentRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, marginBottom: 6 },
  attachmentChip: { backgroundColor: '#3B82F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  attachmentText: { color: '#fff', fontSize: 12, marginLeft: 6, maxWidth: 120 },

  // Coach
  coachRow: { marginBottom: 16, paddingHorizontal: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  coachLabel: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  coachContent: { marginLeft: 40 },
  coachBubble: { borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, alignSelf: 'flex-start', maxWidth: '95%' },
  coachTimestamp: { fontSize: 11, marginTop: 6 },

  // Thinking
  thinkingRow: { flexDirection: 'row', alignItems: 'center' },
  dotsRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Draft card
  draftCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginTop: 8 },
  draftHeader: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  draftIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  draftHeaderText: { flex: 1, marginLeft: 12 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  draftBody: { paddingHorizontal: 16, paddingVertical: 10 },
  draftReasoning: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 10 },
  draftActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  draftBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  draftBtnText: { color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 13 },

  // Clarification
  clarificationCard: { borderRadius: 16, borderTopLeftRadius: 4, padding: 16, borderWidth: 1 },
  clarificationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  clarificationTitle: { fontWeight: '600', marginLeft: 8, fontSize: 15 },

  // System
  systemRow: { alignItems: 'center', marginVertical: 12, paddingHorizontal: 16 },
  systemPill: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
});

export default ChatMessageBubble;
