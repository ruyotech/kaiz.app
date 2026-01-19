// Fibonacci sequence for story points
export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21] as const;

// Task status colors
export const TASK_STATUS_COLORS = {
    draft: '#9CA3AF',
    todo: '#3B82F6',
    in_progress: '#F59E0B',
    done: '#10B981',
} as const;

// Payment status colors
export const PAYMENT_STATUS_COLORS = {
    unpaid: '#F59E0B',
    paid: '#10B981',
    overdue: '#EF4444',
} as const;

// AI confidence thresholds
export const AI_CONFIDENCE_THRESHOLDS = {
    LOW: 0.7,
    MEDIUM: 0.85,
    HIGH: 0.95,
} as const;

// Reaction emojis
export const REACTION_TYPES = {
    thumbsup: '👍',
    fire: '🔥',
    muscle: '💪',
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;

// Max input lengths
export const MAX_INPUT_LENGTHS = {
    TASK_TITLE: 200,
    TASK_DESCRIPTION: 2000,
    COMMENT: 500,
    CHALLENGE_GOAL: 200,
} as const;
