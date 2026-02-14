/**
 * Command Center Types — Donyor AI Scrum Master
 *
 * Single source of truth for the AI chat interface, drafts, ceremonies,
 * SSE streaming, admin settings, and all command center interactions.
 *
 * ⚠️ This file consolidates the former commandCenter.ts and commandCenter.types.ts.
 *    Import everything from 'types/commandCenter'.
 */

// ============================================================================
// Chat Mode & Ceremony Types (NEW — Scrum Master)
// ============================================================================

/** The active mode of the Scrum Master chat */
export type ChatMode =
  | 'CAPTURE'
  | 'PLANNING'
  | 'STANDUP'
  | 'RETRO'
  | 'FREEFORM'
  | 'IMAGE_EXTRACT'
  | 'VOICE_CAPTURE';

/** Ceremony context attached to a chat session */
export interface CeremonyContext {
  mode: 'PLANNING' | 'STANDUP' | 'RETRO';
  ceremonyId?: string;
  sprintId: string;
  sprintDayNumber?: number;
  phase?: string;
}

/** Active ceremony response from GET /command-center/active-ceremony */
export interface ActiveCeremonyResponse {
  mode: 'PLANNING' | 'STANDUP' | 'RETRO' | null;
  ceremonyId: string | null;
  sprintId: string;
}

// ============================================================================
// SSE Streaming Types (NEW)
// ============================================================================

/** Discriminated union for SSE event chunks */
export type SSEChunk =
  | { type: 'text'; content: string; done: false }
  | { type: 'draft'; draft: DraftPreview; done: false }
  | { type: 'action'; action: string; payload: Record<string, unknown>; done: false }
  | { type: 'done'; conversationId: string; mode: ChatMode; done: true }
  | { type: 'error'; message: string; done: true };

/** Request body for the unified chat endpoint */
export interface ChatRequest {
  text?: string | null;
  conversationId?: string | null;
  ceremonyContext?: 'PLANNING' | 'STANDUP' | 'RETRO' | null;
  sprintId?: string | null;
  modeOverride?: ChatMode | null;
}

// ============================================================================
// Chat Message Types (used by UI)
// ============================================================================

export type MessageRole = 'user' | 'coach' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'pdf' | 'document';
  mimeType: string;
  uri?: string;
  size?: number;
  testAttachmentId?: string;
  extractedText?: string;
}

/** Primary chat message type for the Scrum Master conversation */
export interface CoachChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  /** Drafts proposed in this coach message */
  drafts?: DraftPreview[];
  /** For inline clarification questions */
  clarification?: ClarificationRequest;
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
  /** For system/action messages — raw action payload */
  actionPayload?: Record<string, unknown>;
}

/**
 * @deprecated Use CoachChatMessage instead. Kept for backward compatibility
 * with existing components importing ChatMessage from this file.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  draft?: DraftPreview;
  clarification?: ClarificationRequest;
  isThinking?: boolean;
}

// ============================================================================
// Admin Settings Types (from web admin)
// ============================================================================

export interface LlmProvider {
  id: string;
  providerName: string;
  displayName: string;
  providerType: 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'AZURE_OPENAI' | 'CUSTOM';
  apiBaseUrl?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface SystemPrompt {
  id: string;
  promptKey: string;
  promptName: string;
  promptCategory:
    | 'COMMAND_CENTER'
    | 'COACH_CHAT'
    | 'SMART_INPUT'
    | 'IMAGE_ANALYSIS'
    | 'VOICE_TRANSCRIPTION'
    | 'DRAFT_GENERATION'
    | 'CLARIFICATION'
    | 'TASK_SUGGESTION'
    | 'CHALLENGE_SUGGESTION'
    | 'CUSTOM';
  promptContent: string;
  description?: string;
  version?: number;
  variables?: string[];
  isActive: boolean;
}

export interface TestAttachment {
  id: string;
  attachmentName: string;
  attachmentType: 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  fileUrl?: string;
  hasFileData: boolean;
  mimeType: string;
  fileSizeBytes?: number;
  description?: string;
  useCase?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CommandCenterSettings {
  providers: LlmProvider[];
  prompts: SystemPrompt[];
  testAttachments: TestAttachment[];
  featureFlags: Record<string, boolean>;
}

// ============================================================================
// Draft Types — UPPERCASE only
// ============================================================================

export type DraftType =
  | 'TASK'
  | 'EPIC'
  | 'CHALLENGE'
  | 'EVENT'
  | 'BILL'
  | 'NOTE'
  | 'CLARIFICATION_NEEDED';

export type DraftStatus =
  | 'PENDING_APPROVAL'
  | 'NEEDS_CLARIFICATION'
  | 'APPROVED'
  | 'MODIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface DraftPreview {
  id: string;
  draftType: DraftType;
  status: DraftStatus;
  confidence: number;
  title: string;
  description?: string;
  draft: Draft;
  reasoning?: string;
  suggestions?: string[];
  expiresAt?: string;
  createdAt: string;
}

// ── Draft content schemas (match backend sealed Draft interface) ────────────

export interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  endDate?: string | null;
}

export interface TaskDraft {
  type: 'TASK';
  title: string;
  description?: string;
  storyPoints?: number;
  eisenhowerQuadrant?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  lifeWheelArea?: string;
  tags?: string[];
  sprintId?: string | null;
  epicId?: string | null;
  dueDate?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
}

export interface EpicDraft {
  type: 'EPIC';
  title: string;
  description?: string;
  lifeWheelArea?: string;
  color?: string | null;
  icon?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ChallengeDraft {
  type: 'CHALLENGE';
  name: string;
  title?: string;
  description?: string;
  lifeWheelArea?: string;
  metricType?: 'COUNT' | 'YESNO' | 'STREAK' | 'TIME' | 'COMPLETION';
  targetValue?: number | null;
  unit?: string | null;
  durationDays?: number | null;
  recurrence?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  whyStatement?: string | null;
}

export interface EventDraft {
  type: 'EVENT';
  title: string;
  description?: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  isAllDay?: boolean;
  alertBefore?: string;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  lifeWheelArea?: string;
  eisenhowerQuadrant?: string;
  storyPoints?: number;
}

export interface BillDraft {
  type: 'BILL';
  title: string;
  amount?: number | null;
  dueDate?: string | null;
  category?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  reminder?: string | null;
  payee?: string | null;
}

export interface NoteDraft {
  type: 'NOTE';
  title: string;
  content?: string;
  tags?: string[];
}

/** Union of all draft content types */
export type Draft = TaskDraft | EpicDraft | ChallengeDraft | EventDraft | BillDraft | NoteDraft;

// ============================================================================
// Clarification Types
// ============================================================================

export interface ClarificationQuestion {
  id: string;
  question: string;
  fieldKey: string;
  inputType: 'text' | 'select' | 'date' | 'time' | 'number' | 'multiselect';
  options?: ClarificationOption[];
  placeholder?: string;
  required?: boolean;
}

export interface ClarificationOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ClarificationRequest {
  sessionId: string;
  questions: ClarificationQuestion[];
  currentDraft?: Partial<Draft>;
  questionCount: number;
  maxQuestions: number;
}

export interface ClarificationAnswer {
  questionId: string;
  fieldKey: string;
  value: string | string[] | number | Date;
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface ConversationSession {
  id: string;
  userId: string;
  chatMode: ChatMode;
  ceremonyId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
  startedAt: string;
  lastMessageAt: string;
  endedAt?: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationSessionId: string;
  role: 'USER' | 'COACH';
  contentText: string;
  contentType: 'TEXT' | 'DRAFT' | 'ACTION' | 'IMAGE_DESCRIPTION';
  sequenceNumber: number;
  promptVersionUsed?: string;
  createdAt: string;
}

/**
 * @deprecated Use ConversationSession. Kept for backward compat.
 */
export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;
  pendingDrafts: DraftPreview[];
}

// ============================================================================
// API Request / Response Types (Legacy smart-input — kept for compat)
// ============================================================================

export interface SmartInputRequest {
  text?: string;
  attachments?: SmartInputAttachment[];
  voiceTranscription?: string;
  sessionId?: string;
}

export interface SmartInputAttachment {
  type: 'image' | 'audio' | 'pdf' | 'document';
  uri?: string;
  data?: string;
  mimeType: string;
  name: string;
  extractedText?: string;
  testAttachmentId?: string;
}

export type SmartInputStatus =
  | 'READY'
  | 'NEEDS_CLARIFICATION'
  | 'ALTERNATIVE_SUGGESTED'
  | 'ERROR';

export interface SmartInputResponse {
  sessionId: string;
  status: SmartInputStatus;
  intentDetected?: DraftType;
  confidence?: number;
  draft?: DraftPreview;
  message: string;
  clarification?: ClarificationRequest;
  alternativeSuggestion?: {
    suggestedType: DraftType;
    reason: string;
  };
  error?: string;
}

export interface DraftActionRequest {
  draftId: string;
  action: 'APPROVE' | 'REJECT' | 'MODIFY';
  modifiedDraft?: Partial<Draft>;
}

export interface DraftActionResponse {
  success: boolean;
  action: string;
  createdEntityId?: string;
  createdEntityType?: DraftType;
  message: string;
}

// ============================================================================
// AI Response Types (from backend CommandCenterAIResponse)
// ============================================================================

export interface AttachmentSummary {
  name: string;
  type: string;
  mimeType: string;
  size: number;
  extractedText?: string | null;
}

export interface OriginalInput {
  text: string | null;
  attachments: AttachmentSummary[];
  voiceTranscription: string | null;
}

export interface CommandCenterAIResponse {
  id: string;
  status: DraftStatus;
  intentDetected: DraftType;
  confidenceScore: number;
  draft: Draft;
  reasoning: string;
  suggestions: string[];
  clarifyingQuestions: string[];
  originalInput: OriginalInput;
  timestamp: string;
  expiresAt: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getDraftTypeDisplayName(type: DraftType | string | null | undefined): string {
  if (!type) return 'Item';
  const normalized = type.toUpperCase();
  const names: Record<string, string> = {
    TASK: 'Task',
    EPIC: 'Epic',
    CHALLENGE: 'Challenge',
    EVENT: 'Event',
    BILL: 'Bill',
    NOTE: 'Note',
    CLARIFICATION_NEEDED: 'Needs Clarification',
  };
  return names[normalized] || String(type) || 'Item';
}

export function getDraftTypeIcon(type: DraftType | string | null | undefined): string {
  if (!type) return 'file-document-outline';
  const normalized = type.toUpperCase();
  const icons: Record<string, string> = {
    TASK: 'checkbox-marked-circle-outline',
    EPIC: 'rocket-launch-outline',
    CHALLENGE: 'trophy-outline',
    EVENT: 'calendar-star',
    BILL: 'receipt',
    NOTE: 'note-text-outline',
    CLARIFICATION_NEEDED: 'help-circle-outline',
  };
  return icons[normalized] || 'file-document-outline';
}

export function getDraftTypeColor(type: DraftType | string | null | undefined): string {
  if (!type) return '#6B7280';
  const normalized = type.toUpperCase();
  const colors: Record<string, string> = {
    TASK: '#3B82F6',
    EPIC: '#8B5CF6',
    CHALLENGE: '#F59E0B',
    EVENT: '#06B6D4',
    BILL: '#10B981',
    NOTE: '#6B7280',
    CLARIFICATION_NEEDED: '#EF4444',
  };
  return colors[normalized] || '#6B7280';
}

export function getDraftTitle(draft: Draft | DraftPreview['draft'] | null | undefined): string {
  if (!draft || typeof draft !== 'object') return 'Untitled';
  if ('title' in draft && draft.title) return draft.title;
  if ('name' in draft && (draft as ChallengeDraft).name) return (draft as ChallengeDraft).name ?? 'Untitled';
  return 'Untitled';
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getConfidenceLevel(score: number): { text: string; color: string } {
  if (score >= 0.9) return { text: 'Very High', color: '#10B981' };
  if (score >= 0.75) return { text: 'High', color: '#3B82F6' };
  if (score >= 0.5) return { text: 'Medium', color: '#F59E0B' };
  return { text: 'Low', color: '#EF4444' };
}

/**
 * Normalize draft type to uppercase for consistent handling.
 * Handles both legacy lowercase and new UPPERCASE formats.
 */
export function normalizeDraftType(type: string): DraftType {
  return type.toUpperCase() as DraftType;
}
