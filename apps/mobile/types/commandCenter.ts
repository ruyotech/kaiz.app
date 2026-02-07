/**
 * Command Center Types
 * Types for AI chat, conversations, drafts, and admin settings
 */

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
    | 'SENSAI_CHAT'
    | 'IMAGE_ANALYSIS'
    | 'VOICE_TRANSCRIPTION'
    | 'DRAFT_GENERATION'
    | 'CLARIFICATION'
    | 'TASK_SUGGESTION'
    | 'CHALLENGE_SUGGESTION';
  promptContent: string;
  description?: string;
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
// Chat Message Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'pdf' | 'document';
  mimeType: string;
  uri?: string;
  size?: number;
  // For test attachments
  testAttachmentId?: string;
  // For OCR/transcription results
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  // For assistant messages with drafts
  draft?: DraftPreview;
  // For clarification questions
  clarification?: ClarificationRequest;
  // For thinking/loading state
  isThinking?: boolean;
}

// ============================================================================
// Draft Types
// ============================================================================

export type DraftType = 
  | 'TASK'
  | 'CHALLENGE'
  | 'EVENT'
  | 'BILL'
  | 'NOTE'
  | 'EPIC'
  | 'GOAL';

export type DraftStatus = 
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'MODIFIED'
  | 'EXPIRED';

export interface DraftPreview {
  id: string;
  draftType: DraftType;
  status: DraftStatus;
  confidence: number;
  title: string;
  description?: string;
  // Parsed draft content
  draft: TaskDraft | ChallengeDraft | EventDraft | BillDraft | NoteDraft;
  // AI reasoning
  reasoning?: string;
  suggestions?: string[];
  // Expiration
  expiresAt?: string;
  createdAt: string;
}

export interface TaskDraft {
  type: 'TASK';
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  estimatedMinutes?: number;
  tags?: string[];
  // Eisenhower matrix
  eisenhowerQuadrant?: 'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';
  // Life wheel area
  lifeWheelArea?: string;
}

export interface ChallengeDraft {
  type: 'CHALLENGE';
  title: string;
  name?: string;
  description?: string;
  challengeType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  targetDays?: number;
  frequency?: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
  specificDays?: string[];
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface EventDraft {
  type: 'EVENT';
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  reminder?: number; // minutes before
  recurrence?: string;
}

export interface BillDraft {
  type: 'BILL';
  title: string;
  amount: number;
  currency?: string;
  dueDate: string;
  category?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface NoteDraft {
  type: 'NOTE';
  title: string;
  content: string;
  tags?: string[];
  category?: string;
}

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
  currentDraft?: Partial<DraftPreview['draft']>;
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

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  // Session for multi-turn clarification
  sessionId?: string;
  // Pending drafts in this conversation
  pendingDrafts: DraftPreview[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SmartInputRequest {
  text?: string;
  attachments?: SmartInputAttachment[];
  voiceTranscription?: string;
  sessionId?: string; // For continuing conversation
}

export interface SmartInputAttachment {
  type: 'image' | 'audio' | 'pdf' | 'document';
  uri?: string;
  data?: string; // base64
  mimeType: string;
  name: string;
  extractedText?: string;
  // For test attachments
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
  modifiedDraft?: Partial<DraftPreview['draft']>;
}

export interface DraftActionResponse {
  success: boolean;
  action: string;
  createdEntityId?: string;
  createdEntityType?: DraftType;
  message: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getDraftTypeDisplayName(type: DraftType | null | undefined): string {
  if (!type) return 'Item';
  const names: Record<DraftType, string> = {
    TASK: 'Task',
    CHALLENGE: 'Challenge',
    EVENT: 'Event',
    BILL: 'Bill',
    NOTE: 'Note',
    EPIC: 'Epic',
    GOAL: 'Goal',
  };
  return names[type] || String(type) || 'Item';
}

export function getDraftTypeIcon(type: DraftType | null | undefined): string {
  if (!type) return 'file-document-outline';
  const icons: Record<DraftType, string> = {
    TASK: 'checkbox-marked-circle-outline',
    CHALLENGE: 'trophy-outline',
    EVENT: 'calendar-star',
    BILL: 'receipt',
    NOTE: 'note-text-outline',
    EPIC: 'rocket-launch-outline',
    GOAL: 'flag-checkered',
  };
  return icons[type] || 'file-document-outline';
}

export function getDraftTypeColor(type: DraftType | null | undefined): string {
  if (!type) return '#6B7280';
  const colors: Record<DraftType, string> = {
    TASK: '#3B82F6', // blue
    CHALLENGE: '#F59E0B', // amber
    EVENT: '#06B6D4', // cyan
    BILL: '#EF4444', // red
    NOTE: '#8B5CF6', // purple
    EPIC: '#10B981', // emerald
    GOAL: '#F97316', // orange
  };
  return colors[type] || '#6B7280';
}

export function getDraftTitle(draft: DraftPreview['draft'] | null | undefined): string {
  if (!draft || typeof draft !== 'object') return 'Untitled';
  if ('title' in draft && draft.title) return draft.title;
  if ('name' in draft && (draft as ChallengeDraft).name) return (draft as ChallengeDraft).name ?? 'Untitled';
  return 'Untitled';
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
