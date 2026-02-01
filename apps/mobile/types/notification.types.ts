/**
 * Enhanced Notification Types for Kaiz 
 * 
 * Comprehensive notification system supporting all app features:
 * - Tasks & Sprints
 * - Challenges
 * - Community & Social
 * - Essentia Learning
 * - Birthdays & Events
 * - System & AI
 */

// ==========================================
// Notification Categories & Types
// ==========================================

export type NotificationCategory = 
    | 'tasks'       // Task-related notifications
    | 'challenges'  // Challenge progress, reminders, completions
    | 'community'   // Social interactions, partners, groups
    | 'essentia'    // Learning achievements, streaks
    | 'events'      // Birthdays, calendar events, reminders
    | 'system'      // App updates, tips, announcements
    | 'ai';         // AI Scrum Master insights, recommendations

export type NotificationType =
    // Task notifications
    | 'task_assigned'
    | 'task_completed'
    | 'task_overdue'
    | 'task_reminder'
    | 'task_status_changed'
    | 'task_comment'
    | 'task_shared'
    | 'sprint_started'
    | 'sprint_ending'
    | 'sprint_completed'
    | 'epic_milestone'
    // Challenge notifications
    | 'challenge_reminder'
    | 'challenge_streak'
    | 'challenge_completed'
    | 'challenge_milestone'
    | 'challenge_invitation'
    | 'challenge_cheered'
    | 'challenge_partner_update'
    // Community notifications
    | 'partner_request'
    | 'partner_accepted'
    | 'kudos_received'
    | 'compliment_received'
    | 'group_invitation'
    | 'group_activity'
    | 'question_answered'
    | 'story_liked'
    | 'story_comment'
    | 'leaderboard_rank_up'
    | 'badge_earned'
    // Essentia notifications
    | 'learning_reminder'
    | 'streak_at_risk'
    | 'streak_milestone'
    | 'book_completed'
    | 'challenge_progress'
    | 'flashcard_review'
    // Event notifications  
    | 'birthday_reminder'
    | 'event_reminder'
    | 'bill_due'
    | 'anniversary'
    // System notifications
    | 'feature_announcement'
    | 'app_update'
    | 'tip_of_day'
    | 'weekly_summary'
    | 'achievement_unlocked'
    // AI notifications
    | 'ai_insight'
    | 'ai_recommendation'
    | 'ai_daily_brief'
    | 'ai_weekly_review';

// ==========================================
// Notification Priority & Urgency
// ==========================================

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// ==========================================
// Notification Actions
// ==========================================

export interface NotificationAction {
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'dismiss';
    action: string; // Route or action identifier
    params?: Record<string, any>;
}

// ==========================================
// Enhanced Notification Model
// ==========================================

export interface EnhancedNotification {
    id: string;
    userId: string;
    
    // Content
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    body: string;
    shortBody?: string; // For collapsed view
    
    // Visual
    icon?: string; // MaterialCommunityIcons name
    iconColor?: string;
    imageUrl?: string; // Avatar or content image
    emoji?: string; // Alternative to icon
    
    // Priority & Status
    priority: NotificationPriority;
    isRead: boolean;
    isArchived: boolean;
    isPinned?: boolean;
    
    // Actions
    actions?: NotificationAction[];
    deepLink?: string; // Primary navigation target
    
    // Metadata
    metadata?: {
        relatedId?: string; // Task ID, Challenge ID, etc.
        relatedType?: string;
        senderUserId?: string;
        senderName?: string;
        senderAvatar?: string;
        count?: number; // For grouped notifications
        progress?: number; // For progress-related notifications
        dueDate?: string;
        [key: string]: any;
    };
    
    // Grouping
    groupKey?: string; // For grouping similar notifications
    groupCount?: number;
    
    // Timestamps
    createdAt: string;
    readAt?: string;
    expiresAt?: string;
}

// ==========================================
// Notification Group
// ==========================================

export interface NotificationGroup {
    key: string;
    category: NotificationCategory;
    title: string;
    notifications: EnhancedNotification[];
    unreadCount: number;
    latestAt: string;
}

// ==========================================
// Notification Preferences
// ==========================================

export interface NotificationPreferences {
    // Global
    enabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:mm
    quietHoursEnd: string;
    
    // Push notification settings
    pushEnabled: boolean;
    pushSound: boolean;
    pushVibrate: boolean;
    
    // Category preferences
    categories: {
        [key in NotificationCategory]: {
            enabled: boolean;
            push: boolean;
            inApp: boolean;
            email: boolean;
        };
    };
    
    // Specific type preferences
    types: {
        [key in NotificationType]?: {
            enabled: boolean;
            push: boolean;
        };
    };
    
    // Smart features
    smartGrouping: boolean;
    dailyDigest: boolean;
    dailyDigestTime: string; // HH:mm
    weeklyRecap: boolean;
}

// ==========================================
// Filter & Sort Options
// ==========================================

export type NotificationSortBy = 'date' | 'priority' | 'category';
export type NotificationFilterBy = 'all' | 'unread' | 'pinned' | NotificationCategory;

export interface NotificationFilters {
    category?: NotificationCategory;
    isRead?: boolean;
    isPinned?: boolean;
    priority?: NotificationPriority[];
    dateRange?: {
        start: string;
        end: string;
    };
    search?: string;
}

// ==========================================
// Category Configuration
// ==========================================

export interface CategoryConfig {
    id: NotificationCategory;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
}

export const NOTIFICATION_CATEGORIES: CategoryConfig[] = [
    { id: 'tasks', name: 'Tasks', icon: 'checkbox-marked-circle-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
    { id: 'challenges', name: 'Challenges', icon: 'trophy-outline', color: '#F59E0B', bgColor: '#FEF3C7' },
    { id: 'community', name: 'Community', icon: 'account-group-outline', color: '#8B5CF6', bgColor: '#EDE9FE' },
    { id: 'essentia', name: 'Learning', icon: 'book-open-page-variant', color: '#10B981', bgColor: '#D1FAE5' },
    { id: 'events', name: 'Events', icon: 'calendar-star', color: '#EC4899', bgColor: '#FCE7F3' },
    { id: 'system', name: 'System', icon: 'cog-outline', color: '#6B7280', bgColor: '#F3F4F6' },
    { id: 'ai', name: 'AI Insights', icon: 'robot-outline', color: '#06B6D4', bgColor: '#CFFAFE' },
];

// ==========================================
// Type Configuration with Icons & Colors
// ==========================================

export interface NotificationTypeConfig {
    type: NotificationType;
    category: NotificationCategory;
    icon: string;
    color: string;
    defaultTitle: string;
}

export const NOTIFICATION_TYPE_CONFIGS: NotificationTypeConfig[] = [
    // Tasks
    { type: 'task_assigned', category: 'tasks', icon: 'clipboard-plus-outline', color: '#3B82F6', defaultTitle: 'New Task Assigned' },
    { type: 'task_completed', category: 'tasks', icon: 'check-circle', color: '#10B981', defaultTitle: 'Task Completed' },
    { type: 'task_overdue', category: 'tasks', icon: 'clock-alert-outline', color: '#EF4444', defaultTitle: 'Task Overdue' },
    { type: 'task_reminder', category: 'tasks', icon: 'bell-ring-outline', color: '#F59E0B', defaultTitle: 'Task Reminder' },
    { type: 'task_status_changed', category: 'tasks', icon: 'swap-horizontal', color: '#6366F1', defaultTitle: 'Task Status Updated' },
    { type: 'task_comment', category: 'tasks', icon: 'comment-outline', color: '#8B5CF6', defaultTitle: 'New Comment' },
    { type: 'task_shared', category: 'tasks', icon: 'share-variant-outline', color: '#0EA5E9', defaultTitle: 'Task Shared with You' },
    { type: 'sprint_started', category: 'tasks', icon: 'rocket-launch', color: '#10B981', defaultTitle: 'Sprint Started' },
    { type: 'sprint_ending', category: 'tasks', icon: 'timer-sand', color: '#F59E0B', defaultTitle: 'Sprint Ending Soon' },
    { type: 'sprint_completed', category: 'tasks', icon: 'flag-checkered', color: '#8B5CF6', defaultTitle: 'Sprint Completed!' },
    { type: 'epic_milestone', category: 'tasks', icon: 'star-circle-outline', color: '#EC4899', defaultTitle: 'Epic Milestone Reached' },
    
    // Challenges
    { type: 'challenge_reminder', category: 'challenges', icon: 'bell-ring', color: '#F59E0B', defaultTitle: 'Challenge Reminder' },
    { type: 'challenge_streak', category: 'challenges', icon: 'fire', color: '#EF4444', defaultTitle: 'Streak Update' },
    { type: 'challenge_completed', category: 'challenges', icon: 'trophy', color: '#F59E0B', defaultTitle: 'Challenge Completed!' },
    { type: 'challenge_milestone', category: 'challenges', icon: 'medal', color: '#8B5CF6', defaultTitle: 'Milestone Achieved' },
    { type: 'challenge_invitation', category: 'challenges', icon: 'account-plus', color: '#10B981', defaultTitle: 'Challenge Invitation' },
    { type: 'challenge_cheered', category: 'challenges', icon: 'hand-clap', color: '#EC4899', defaultTitle: 'Someone Cheered You!' },
    { type: 'challenge_partner_update', category: 'challenges', icon: 'account-check', color: '#06B6D4', defaultTitle: 'Partner Progress' },
    
    // Community
    { type: 'partner_request', category: 'community', icon: 'account-plus-outline', color: '#8B5CF6', defaultTitle: 'New Partner Request' },
    { type: 'partner_accepted', category: 'community', icon: 'account-check-outline', color: '#10B981', defaultTitle: 'Partner Request Accepted' },
    { type: 'kudos_received', category: 'community', icon: 'heart-outline', color: '#EC4899', defaultTitle: 'You Received Kudos!' },
    { type: 'compliment_received', category: 'community', icon: 'gift-outline', color: '#F59E0B', defaultTitle: 'Secret Compliment' },
    { type: 'group_invitation', category: 'community', icon: 'account-group-outline', color: '#6366F1', defaultTitle: 'Group Invitation' },
    { type: 'group_activity', category: 'community', icon: 'account-group', color: '#8B5CF6', defaultTitle: 'Group Activity' },
    { type: 'question_answered', category: 'community', icon: 'comment-check-outline', color: '#10B981', defaultTitle: 'Your Question Answered' },
    { type: 'story_liked', category: 'community', icon: 'thumb-up-outline', color: '#3B82F6', defaultTitle: 'Someone Liked Your Story' },
    { type: 'story_comment', category: 'community', icon: 'message-outline', color: '#0EA5E9', defaultTitle: 'New Comment on Story' },
    { type: 'leaderboard_rank_up', category: 'community', icon: 'trending-up', color: '#10B981', defaultTitle: 'Rank Up!' },
    { type: 'badge_earned', category: 'community', icon: 'shield-star', color: '#F59E0B', defaultTitle: 'Badge Earned!' },
    
    // Essentia
    { type: 'learning_reminder', category: 'essentia', icon: 'book-open-variant', color: '#10B981', defaultTitle: 'Time to Learn' },
    { type: 'streak_at_risk', category: 'essentia', icon: 'fire-alert', color: '#EF4444', defaultTitle: 'Streak at Risk!' },
    { type: 'streak_milestone', category: 'essentia', icon: 'fire', color: '#F59E0B', defaultTitle: 'Streak Milestone!' },
    { type: 'book_completed', category: 'essentia', icon: 'book-check', color: '#8B5CF6', defaultTitle: 'Book Completed' },
    { type: 'challenge_progress', category: 'essentia', icon: 'progress-check', color: '#06B6D4', defaultTitle: 'Learning Progress' },
    { type: 'flashcard_review', category: 'essentia', icon: 'cards-outline', color: '#6366F1', defaultTitle: 'Flashcards Ready' },
    
    // Events
    { type: 'birthday_reminder', category: 'events', icon: 'cake-variant', color: '#EC4899', defaultTitle: 'Birthday Reminder' },
    { type: 'event_reminder', category: 'events', icon: 'calendar-alert', color: '#F59E0B', defaultTitle: 'Event Reminder' },
    { type: 'bill_due', category: 'events', icon: 'receipt', color: '#EF4444', defaultTitle: 'Bill Due Soon' },
    { type: 'anniversary', category: 'events', icon: 'heart', color: '#EC4899', defaultTitle: 'Anniversary Reminder' },
    
    // System
    { type: 'feature_announcement', category: 'system', icon: 'bullhorn-outline', color: '#6366F1', defaultTitle: 'New Feature' },
    { type: 'app_update', category: 'system', icon: 'cellphone-arrow-down', color: '#10B981', defaultTitle: 'App Update' },
    { type: 'tip_of_day', category: 'system', icon: 'lightbulb-outline', color: '#F59E0B', defaultTitle: 'Tip of the Day' },
    { type: 'weekly_summary', category: 'system', icon: 'chart-bar', color: '#8B5CF6', defaultTitle: 'Weekly Summary' },
    { type: 'achievement_unlocked', category: 'system', icon: 'trophy-award', color: '#F59E0B', defaultTitle: 'Achievement Unlocked!' },
    
    // AI
    { type: 'ai_insight', category: 'ai', icon: 'robot-happy-outline', color: '#06B6D4', defaultTitle: 'AI Insight' },
    { type: 'ai_recommendation', category: 'ai', icon: 'lightbulb-on-outline', color: '#10B981', defaultTitle: 'Smart Recommendation' },
    { type: 'ai_daily_brief', category: 'ai', icon: 'weather-sunny', color: '#F59E0B', defaultTitle: 'Daily Brief' },
    { type: 'ai_weekly_review', category: 'ai', icon: 'chart-timeline-variant', color: '#8B5CF6', defaultTitle: 'Weekly Review' },
];

// Helper to get type config
export const getNotificationTypeConfig = (type: NotificationType): NotificationTypeConfig | undefined => {
    return NOTIFICATION_TYPE_CONFIGS.find(c => c.type === type);
};

// Helper to get category config
export const getCategoryConfig = (category: NotificationCategory): CategoryConfig | undefined => {
    return NOTIFICATION_CATEGORIES.find(c => c.id === category);
};
