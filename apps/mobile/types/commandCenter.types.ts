/**
 * Command Center Types - matching backend Draft DTOs
 * 
 * These types mirror the backend CommandCenterAIResponse and Draft types
 * for the AI-powered smart input feature.
 */

// ============================================================================
// Draft Types - Matching backend sealed interface
// ============================================================================

export type DraftType = 'task' | 'epic' | 'challenge' | 'event' | 'bill' | 'note' | 'clarification_needed';

export type DraftStatus = 'pending_approval' | 'approved' | 'rejected' | 'expired' | 'edited';

/**
 * Recurrence pattern for recurring tasks
 */
export interface RecurrencePattern {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string | null;
}

/**
 * Task draft - single actionable item for sprints
 */
export interface TaskDraft {
    type: 'task';
    title: string;
    description: string;
    lifeWheelAreaId: string;
    eisenhowerQuadrantId: string;
    storyPoints: number;
    suggestedEpicId?: string | null;
    suggestedSprintId?: string | null;
    dueDate?: string | null;
    isRecurring: boolean;
    recurrencePattern?: RecurrencePattern | null;
}

/**
 * Epic draft - larger goal containing multiple tasks
 */
export interface EpicDraft {
    type: 'epic';
    title: string;
    description: string;
    lifeWheelAreaId: string;
    suggestedTasks: TaskDraft[];
    color: string;
    icon?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Challenge draft - habit-building tracker
 */
export interface ChallengeDraft {
    type: 'challenge';
    name: string;
    description: string;
    lifeWheelAreaId: string;
    metricType: 'yesno' | 'count' | 'duration' | 'percentage';
    targetValue?: number | null;
    unit?: string | null;
    duration: number;
    recurrence: 'daily' | 'weekly' | 'custom';
    whyStatement?: string | null;
    rewardDescription?: string | null;
    graceDays: number;
    reminderTime?: string | null;
}

/**
 * Event draft - calendar-blocked time commitment
 */
export interface EventDraft {
    type: 'event';
    title: string;
    description: string;
    lifeWheelAreaId: string;
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    location?: string | null;
    isAllDay: boolean;
    recurrence?: string | null;
    attendees: string[];
}

/**
 * Bill draft - financial item to track
 */
export interface BillDraft {
    type: 'bill';
    vendorName: string;
    amount: number;
    currency: string;
    dueDate?: string | null;
    category?: string | null;
    lifeWheelAreaId: string;
    isRecurring: boolean;
    recurrence?: string | null;
    notes?: string | null;
}

/**
 * Note draft - quick capture when intent is unclear
 */
export interface NoteDraft {
    type: 'note';
    title: string;
    content: string;
    lifeWheelAreaId: string;
    tags: string[];
    clarifyingQuestions: string[];
}

/**
 * Union type of all draft types
 */
export type Draft = TaskDraft | EpicDraft | ChallengeDraft | EventDraft | BillDraft | NoteDraft;

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Attachment summary in AI response
 */
export interface AttachmentSummary {
    name: string;
    type: string;
    mimeType: string;
    size: number;
    extractedText?: string | null;
}

/**
 * Original input preserved for reference
 */
export interface OriginalInput {
    text: string | null;
    attachments: AttachmentSummary[];
    voiceTranscription: string | null;
}

/**
 * AI Response from Command Center - main response DTO
 */
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
// Chat Message Types for UI
// ============================================================================

export type ChatMessageType = 'user' | 'ai' | 'system' | 'draft';

export interface ChatMessage {
    id: string;
    type: ChatMessageType;
    content: string;
    timestamp: Date;
    attachments?: AttachmentSummary[];
    draft?: CommandCenterAIResponse;
    isLoading?: boolean;
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Get display name for draft type
 */
export function getDraftTypeDisplayName(type: DraftType): string {
    const names: Record<DraftType, string> = {
        task: 'Task',
        epic: 'Epic',
        challenge: 'Challenge',
        event: 'Event',
        bill: 'Bill',
        note: 'Note',
        clarification_needed: 'Needs Clarification',
    };
    return names[type] || type;
}

/**
 * Get draft type icon name (MaterialCommunityIcons)
 */
export function getDraftTypeIcon(type: DraftType): string {
    const icons: Record<DraftType, string> = {
        task: 'checkbox-marked-circle-outline',
        epic: 'flag-variant-outline',
        challenge: 'trophy-outline',
        event: 'calendar-star',
        bill: 'currency-usd',
        note: 'note-text-outline',
        clarification_needed: 'help-circle-outline',
    };
    return icons[type] || 'help-circle-outline';
}

/**
 * Get draft type color
 */
export function getDraftTypeColor(type: DraftType): string {
    const colors: Record<DraftType, string> = {
        task: '#3B82F6',      // Blue
        epic: '#8B5CF6',      // Purple
        challenge: '#F59E0B', // Amber
        event: '#06B6D4',     // Cyan
        bill: '#10B981',      // Green
        note: '#6B7280',      // Gray
        clarification_needed: '#EF4444', // Red
    };
    return colors[type] || '#6B7280';
}

/**
 * Get the title from any draft type
 */
export function getDraftTitle(draft: Draft): string {
    switch (draft.type) {
        case 'task':
        case 'epic':
        case 'event':
        case 'note':
            return draft.title;
        case 'challenge':
            return draft.name;
        case 'bill':
            return draft.vendorName;
        default:
            return 'Untitled';
    }
}

/**
 * Get confidence level text
 */
export function getConfidenceLevel(score: number): { text: string; color: string } {
    if (score >= 0.9) return { text: 'Very High', color: '#10B981' };
    if (score >= 0.75) return { text: 'High', color: '#3B82F6' };
    if (score >= 0.5) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Low', color: '#EF4444' };
}
