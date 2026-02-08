// User Management
export interface User {
    id: string;
    email: string;
    fullName: string;
    accountType: 'individual' | 'family_adult' | 'family_child' | 'corporate';
    subscriptionTier: 'free' | 'pro' | 'pro_monthly' | 'pro_annual' | 'family' | 'corporate' | 'enterprise';
    timezone: string;
    avatarUrl: string | null;
    createdAt: string;
    // Subscription & enrollment
    enrollmentDate?: string; // ISO date when user enrolled
    subscriptionStartDate?: string | null; // ISO date
    subscriptionEndDate?: string | null; // ISO date
    subscriptionAutoRenew?: boolean;
}

export interface Family {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
}

// Life Wheel
export interface LifeWheelArea {
    id: string;
    name: string;
    icon: string;
    color: string;
}

// Eisenhower Matrix
export interface EisenhowerQuadrant {
    id: string;
    name: string;
    label: string;
    color: string;
}

// Sprints (52 weeks)
export interface Sprint {
    id: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    status: 'planned' | 'active' | 'completed';
    totalPoints: number;
    completedPoints: number;
}

// Epics
export interface Epic {
    id: string;
    title: string;
    description: string;
    userId: string;
    lifeWheelAreaId: string;
    targetSprintId: string;
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    totalPoints: number;
    completedPoints: number;
    color: string;
    icon: string;
    startDate: string;
    endDate: string;
    taskIds: string[];
    createdAt: string;
    // Family Plan fields
    familyId?: string | null;
    visibility?: 'private' | 'shared';
}

// Tasks
export interface Task {
    id: string;
    title: string;
    description: string;
    userId: string;
    epicId: string | null;
    lifeWheelAreaId: string;
    eisenhowerQuadrantId: string;
    sprintId: string | null;
    storyPoints: number;
    status: 'draft' | 'todo' | 'in_progress' | 'done' | 'blocked' | 'pending_approval';
    isDraft: boolean;
    aiConfidence: number | null;
    createdFromTemplateId: string | null;
    createdAt: string;
    completedAt: string | null;
    deletedAt: string | null;
    // Alias for eisenhowerQuadrantId (used in some screens)
    quadrant?: string;
    // Recurring task support
    isRecurring?: boolean;
    recurrence?: {
        id: string;
        frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
        intervalValue: number;
        startDate: string;
        endDate?: string | null;
        dayOfWeek?: number | null;
        dayOfMonth?: number | null;
        yearlyDate?: string | null;
        scheduledTime?: string | null;
        scheduledEndTime?: string | null;
        isActive: boolean;
    } | null;
    // Legacy support
    recurrencePattern?: {
        frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
        interval: number; // e.g., every 2 weeks
        endDate?: string | null; // when to stop recurring
    };
    // Family Plan fields
    familyId?: string | null;
    visibility?: 'private' | 'shared' | 'assigned';
    assignedToUserId?: string | null;
    requiresApproval?: boolean;
    approvedByUserId?: string | null;
    approvedAt?: string | null;
}

export interface TaskHistory {
    id: string;
    taskId: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
    changedByUserId: string;
    changedByUserName?: string;
    createdAt: string;
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string | null;
    commentText: string;
    isAiGenerated: boolean;
    timestamp: string;
}

export interface TaskTemplate {
    id: string;
    name: string;
    description: string;
    type: 'task' | 'event' | 'birthday';
    creatorType: 'system' | 'user';
    userId: string | null; // null for system templates
    
    // Task defaults
    defaultStoryPoints: number;
    defaultLifeWheelAreaId: string;
    defaultEisenhowerQuadrantId: string;
    
    // Event defaults
    defaultDuration: number | null; // minutes
    defaultLocation: string | null;
    isAllDay: boolean;
    defaultAttendees: string[];
    
    // Recurrence
    isRecurring: boolean;
    recurrencePattern: RecurrencePattern | null;
    suggestedSprint: 'current' | 'next' | 'backlog';
    
    // Community metrics
    rating: number; // 0-5
    ratingCount: number;
    usageCount: number;
    
    // Display
    icon: string;
    color: string;
    tags: string[]; // Template's own tags
    
    // User-specific (populated per request)
    isFavorite: boolean;
    userRating: number | null; // null if user hasn't rated
    userTags: string[]; // User's personal tags for this template
    
    createdAt: string;
    updatedAt: string;
}

export interface RecurrencePattern {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    interval: number;
    endDate: string | null;
}

export interface TemplateFilterOptions {
    type?: 'task' | 'event';
    lifeWheelAreaId?: string;
    search?: string;
    favoritesOnly?: boolean;
    sortBy?: 'rating' | 'usage' | 'name' | 'createdAt';
}

export interface CreateTemplateRequest {
    name: string;
    description?: string;
    type?: 'task' | 'event';
    defaultStoryPoints?: number;
    defaultLifeWheelAreaId?: string;
    defaultEisenhowerQuadrantId?: string;
    defaultDuration?: number;
    defaultLocation?: string;
    isAllDay?: boolean;
    defaultAttendees?: string[];
    isRecurring?: boolean;
    recurrencePattern?: RecurrencePattern;
    suggestedSprint?: 'current' | 'next' | 'backlog';
    icon?: string;
    color?: string;
    tags?: string[];
}

export interface UseTemplateRequest {
    title?: string; // Override template title
    description?: string; // Override template description
    sprintId?: string | null; // null for backlog
    epicId?: string; // optional epic association
    startDate?: string; // for recurring or scheduled tasks
    isRecurring?: boolean;
    recurrencePattern?: RecurrencePattern;
}

// Bills
export interface BillCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Bill {
    id: string;
    userId: string;
    categoryId: string;
    vendorName: string;
    amount: number;
    dueDate: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    paymentStatus: 'unpaid' | 'paid' | 'overdue';
    isDraft: boolean;
    aiConfidence: number | null;
    rawOcrData: any;
    fileUrl: string;
    createdAt: string;
}

// Motivation - Mindset Content (Kaiz Contextual System)
export type LifeWheelDimensionTag = 
    | 'lw-1' // Health & Fitness
    | 'lw-2' // Career & Work
    | 'lw-3' // Finance & Money
    | 'lw-4' // Personal Growth
    | 'lw-5' // Relationships & Family
    | 'lw-6' // Social Life
    | 'lw-7' // Fun & Recreation
    | 'lw-8' // Environment & Home
    | 'generic' // Universal/No specific dimension
    | 'q2_growth'; // Eisenhower Q2 specific

export type MindsetThemePreset = 
    | 'dark'
    | 'nature'
    | 'cyberpunk'
    | 'minimalist'
    | 'gradient-blue'
    | 'gradient-purple'
    | 'gradient-sunset';

export type EmotionalTone = 'MOTIVATIONAL' | 'REFLECTIVE' | 'ACTIONABLE' | 'CALMING' | 'INSPIRATIONAL' | 'EMPOWERING' | 'CHALLENGING' | 'HUMOROUS';

export interface MindsetContent {
    id: string;
    body: string;
    author: string | null;
    dimensionTag: string;
    secondaryTags: string[];
    themePreset: string;
    interventionWeight: number;
    emotionalTone: EmotionalTone;
    backgroundImageUrl: string | null;
    lifeWheelAreaId: string | null;
    lifeWheelAreaName: string | null;
    lifeWheelAreaColor: string | null;
    isFavorite: boolean;
    favoriteCount: number;
    createdAt: string;
}

export interface MindsetTheme {
    id: string;
    name: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    gradientColors: string[];
    defaultAsset: string | null;
}

export interface ToggleFavoriteResponse {
    isFavorite: boolean;
    favoriteCount: number;
}

// Note: Legacy Quote/MindsetSession/MindsetFavorite interfaces removed — favorites are now per-user on server

// Books (Legacy - replaced by Essentia)
export interface BookSummary {
    id: string;
    title: string;
    author: string;
    lifeWheelAreaId: string;
    coverUrl: string | null;
    content: string;
    keyTakeaways: string[];
    createdAt: string;
}

// Essentia - Micro-Learning Module
export type EssentiaCardType = 'intro' | 'concept' | 'quote' | 'quiz' | 'summary';
export type EssentiaDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type EssentiaBadgeType = 'early_bird' | 'night_owl' | 'speed_reader' | 'consistent' | 
    'scholar' | 'category_master' | '7_day_streak' | '30_day_streak' | '100_day_streak' | 
    '365_day_streak' | 'first_book' | '100_books';

export interface EssentiaCard {
    id: string;
    type: EssentiaCardType;
    order: number;
    title: string;
    text: string;
    imageUrl?: string;
    audioUrl?: string;
    audioDuration?: number; // seconds
    audioStartTime?: number; // seconds from beginning of full audio track
    // Quiz-specific fields
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectIndex?: number;
    quizExplanation?: string;
}

export interface EssentiaBook {
    id: string;
    title: string;
    author: string;
    coverImageUrl?: string;
    lifeWheelAreaId: LifeWheelDimensionTag;
    category: string; // Display name like "Personal Growth"
    duration: number; // minutes
    cardCount: number;
    difficulty: EssentiaDifficulty;
    tags: string[];
    description: string;
    keyTakeaways: string[];
    cards: EssentiaCard[];
    publicationYear?: number;
    rating?: number; // 0-5
    completionCount?: number; // popularity metric
    createdAt: string;
    updatedAt: string;
}

export interface EssentiaProgress {
    bookId: string;
    userId: string;
    currentCardId: string;
    currentCardIndex: number;
    percentComplete: number;
    startedAt: string;
    lastReadAt: string;
    completedAt?: string;
    timeSpent: number; // seconds
}

export interface EssentiaHighlight {
    id: string;
    userId: string;
    bookId: string;
    cardId: string;
    text: string;
    createdAt: string;
    note?: string;
}

export interface EssentiaFlashcard {
    id: string;
    userId: string;
    highlightId: string;
    bookId: string;
    question: string;
    answer: string;
    nextReviewDate: string;
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
    easeFactor: number; // for spaced repetition algorithm
    interval: number; // days until next review
    createdAt: string;
    lastReviewedAt?: string;
}

export interface EssentiaStreak {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    streakFreezes: number; // available "skip days"
    streakHistory: Array<{
        date: string; // YYYY-MM-DD
        booksCompleted: number;
        minutesRead: number;
    }>;
}

export interface EssentiaUserStats {
    userId: string;
    totalXP: number;
    level: number;
    levelName: string; // "Beginner", "Scholar", "Expert", "Master"
    nextLevelXP: number;
    booksCompleted: number;
    totalMinutesRead: number;
    highlightsCreated: number;
    flashcardsReviewed: number;
    badges: EssentiaBadgeType[];
    dailyGoalMinutes: number;
    preferredReadingTime?: 'morning' | 'afternoon' | 'evening' | 'anytime';
    joinedAt: string;
    lastActiveAt: string;
}

export interface EssentiaChallenge {
    id: string;
    name: string;
    description: string;
    lifeWheelAreaId: LifeWheelDimensionTag;
    coverImageUrl?: string;
    duration: number; // days (typically 28)
    difficulty: EssentiaDifficulty;
    bookIds: Array<{
        day: number;
        bookId: string;
    }>;
    rewards: {
        xp: number;
        badge?: EssentiaBadgeType;
    };
    enrollmentCount?: number;
    completionRate?: number;
    createdAt: string;
}

export interface EssentiaUserChallenge {
    id: string;
    userId: string;
    challengeId: string;
    startDate: string;
    currentDay: number;
    completedBookIds: string[];
    status: 'active' | 'completed' | 'abandoned';
    completedAt?: string;
}

export interface EssentiaBadge {
    type: EssentiaBadgeType;
    name: string;
    description: string;
    iconUrl?: string;
    unlockedAt?: string;
}

export interface EssentiaSession {
    id: string;
    userId: string;
    bookId: string;
    startedAt: string;
    endedAt?: string;
    cardsViewed: number;
    audioPlayed: boolean;
    highlightsCreated: number;
    completed: boolean;
}

// Challenges
export type ChallengeMetricType = 'count' | 'yesno' | 'streak' | 'time' | 'completion';
export type ChallengeRecurrence = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type ChallengeVisibility = 'private' | 'shared' | 'community';
export type ChallengeStatus = 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface Challenge {
    id: string;
    name: string;
    description?: string;
    lifeWheelAreaId: string;
    metricType: ChallengeMetricType;
    targetValue?: number; // for count, time types
    unit?: string; // steps, minutes, pages, etc.
    duration: number; // in days
    recurrence: ChallengeRecurrence;
    customRecurrencePattern?: {
        daysOfWeek?: number[]; // 0-6, Sunday = 0
        timesPerWeek?: number;
    };
    
    // Status & Dates
    status: ChallengeStatus;
    startDate: string;
    endDate: string;
    
    // Motivation & Rewards
    whyStatement?: string;
    rewardDescription?: string;
    
    // Flexibility
    graceDays: number; // missed days allowed
    
    // Sprint Integration
    sprintIntegration: boolean;
    pointValue?: number; // story points per completion
    linkedTaskIds?: string[]; // auto-generated sprint tasks
    
    // Social
    challengeType: 'solo' | 'group';
    visibility: ChallengeVisibility;
    createdByUserId: string;
    accountabilityPartnerIds?: string[];
    
    // Notifications
    reminderEnabled: boolean;
    reminderTime?: string; // HH:mm format
    
    // Progress Tracking
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    totalMissed: number;
    
    // Metadata
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface ChallengeTemplate {
    id: string;
    name: string;
    description: string;
    lifeWheelAreaId: string;
    metricType: ChallengeMetricType;
    targetValue?: number;
    unit?: string;
    suggestedDuration: number; // in days
    recurrence: ChallengeRecurrence;
    icon: string;
    tags: string[];
    popularityScore: number;
    difficulty: 'easy' | 'moderate' | 'hard';
}

export interface ChallengeParticipant {
    id: string;
    challengeId: string;
    userId: string;
    joinedAt?: string;
    currentProgress: number;
    lastUpdated: string;
    streakDays: number;
    isAccountabilityPartner?: boolean; // can view only, not log
}

export interface ChallengeEntry {
    id: string;
    challengeId: string;
    userId: string;
    date?: string; // YYYY-MM-DD
    entryDate?: string; // Alternative date field
    value?: number | boolean; // depends on metric type
    entryValue?: number | boolean; // Alternative value field
    note?: string;
    timestamp: string;
    synced?: boolean; // offline support
    reactions: Array<{
        userId: string;
        type: 'thumbsup' | 'fire' | 'muscle' | 'celebrate' | string;
    }>;
}

export interface ChallengeAnalytics {
    challengeId: string;
    completionRate: number; // percentage
    averageValue?: number; // for count/time types
    bestDay?: string;
    worstDay?: string;
    totalImpact: number; // contribution to life wheel
    consistencyScore: number; // 0-100
}

// Notifications
export interface Notification {
    id: string;
    userId: string;
    type: 'ai_scrum_master' | 'system' | 'challenge' | 'family';
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

// ==========================================
// Community Module
// ==========================================

// User Reputation & Gamification
export type CommunityBadgeType = 
    | 'sprint_starter' // Completed first sprint
    | 'sprint_mentor' // Helped 10+ users
    | 'velocity_master' // Achieved consistent velocity
    | 'community_champion' // Top contributor
    | 'knowledge_keeper' // Answered 50+ questions
    | 'template_creator' // Created popular templates
    | 'streak_legend' // 100+ day streak
    | 'first_post' // First community post
    | 'helpful_hero' // Got 100+ upvotes
    | 'accountability_ace' // Supported 5+ partners
    | 'early_adopter' // Joined in first month
    | 'bug_hunter' // Reported valid bugs
    | 'ama_participant'; // Participated in AMA

export type CommunityRole = 'member' | 'contributor' | 'mentor' | 'moderator' | 'admin';

export interface CommunityMember {
    id: string;
    userId: string;
    displayName: string;
    avatar: string;
    bio?: string;
    level: number;
    levelTitle: string; // "Novice", "Achiever", "Master", "Legend"
    reputationPoints: number;
    badges: CommunityBadgeType[];
    role: CommunityRole;
    joinedAt: string;
    isOnline: boolean;
    sprintsCompleted: number;
    helpfulAnswers: number;
    templatesShared: number;
    currentStreak: number;
    // Privacy settings
    showActivity: boolean;
    acceptPartnerRequests: boolean;
}

export interface CommunityBadge {
    type: CommunityBadgeType;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    unlockedAt?: string;
}

// Knowledge Hub - Articles & News
export type ArticleCategory = 'feature' | 'strategy' | 'productivity' | 'wellness' | 'finance' | 'announcement';

export interface KnowledgeArticle {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    category: ArticleCategory;
    coverImageUrl?: string;
    authorId: string;
    authorName: string;
    publishedAt: string;
    readTimeMinutes: number;
    viewCount: number;
    likeCount: number;
    isBookmarked?: boolean;
    tags: string[];
}

export interface ReleaseNote {
    id: string;
    version: string;
    title: string;
    description: string;
    changes: Array<{
        type: 'feature' | 'improvement' | 'fix' | 'breaking';
        text: string;
    }>;
    publishedAt: string;
    imageUrl?: string;
}

export interface WikiEntry {
    id: string;
    term: string;
    definition: string;
    category: 'glossary' | 'tutorial' | 'faq' | 'troubleshooting';
    relatedTerms?: string[];
    lastUpdated: string;
}

// Q&A Forum
export type QuestionStatus = 'open' | 'answered' | 'closed';

export interface CommunityQuestion {
    id: string;
    title: string;
    body: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    tags: string[];
    status: QuestionStatus;
    viewCount: number;
    upvoteCount: number;
    answerCount: number;
    acceptedAnswerId?: string;
    createdAt: string;
    updatedAt: string;
    isUpvotedByUser?: boolean;
}

export interface CommunityAnswer {
    id: string;
    questionId: string;
    body: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorRole: CommunityRole;
    upvoteCount: number;
    isVerified: boolean; // Official answer from team
    isAccepted: boolean; // Accepted by question author
    createdAt: string;
    updatedAt: string;
    isUpvotedByUser?: boolean;
}

// Success Stories / Wins Board
export type WinCategory = 'sprint_complete' | 'challenge_done' | 'habit_streak' | 'milestone' | 'transformation' | 'other';

export interface SuccessStory {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    title: string;
    story: string;
    category: WinCategory;
    imageUrls?: string[];
    lifeWheelAreaId?: string;
    metrics?: {
        label: string;
        value: string;
    }[];
    likeCount: number;
    commentCount: number;
    celebrateCount: number; // 🎉 reactions
    createdAt: string;
    isLikedByUser?: boolean;
    isCelebratedByUser?: boolean;
}

export interface StoryComment {
    id: string;
    storyId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: string;
}

// Community Templates
export type TemplateType = 'sprint_plan' | 'epic' | 'ritual' | 'challenge' | 'process' | 'checklist';

export interface CommunityTemplate {
    id: string;
    name: string;
    description: string;
    type: TemplateType;
    authorId: string;
    authorName: string;
    content: Record<string, any>; // Template-specific structure
    lifeWheelAreaId?: string;
    tags: string[];
    downloadCount: number;
    rating: number; // 0-5
    ratingCount: number;
    previewImageUrl?: string;
    createdAt: string;
    updatedAt: string;
    isBookmarked?: boolean;
}

export interface TemplateReview {
    id: string;
    templateId: string;
    authorId: string;
    authorName: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

// Leaderboard
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';
export type LeaderboardCategory = 'reputation' | 'helpful' | 'streaks' | 'velocity';

export interface LeaderboardEntry {
    rank: number;
    memberId: string;
    displayName: string;
    avatar: string;
    level: number;
    value: number; // Points/score for this category
    change: number; // Rank change from previous period (+/-)
    badges: CommunityBadgeType[];
}

// Support Circle - Accountability Partners
export type PartnerRequestStatus = 'pending' | 'accepted' | 'declined';

export interface AccountabilityPartner {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    partnerLevel: number;
    connectedSince: string;
    sharedChallenges: string[]; // Challenge IDs
    lastInteraction: string;
    checkInStreak: number;
}

export interface PartnerRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar: string;
    toUserId: string;
    message?: string;
    status: PartnerRequestStatus;
    createdAt: string;
}

export interface MotivationGroup {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string;
    lifeWheelAreaId?: string;
    memberCount: number;
    maxMembers: number;
    isPrivate: boolean;
    createdByUserId: string;
    createdAt: string;
    isJoined?: boolean;
    tags: string[];
}

// Feedback & Feature Requests
export type FeatureRequestStatus = 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';

export interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    status: FeatureRequestStatus;
    upvoteCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    officialResponse?: string;
    isUpvotedByUser?: boolean;
}

export interface BugReport {
    id: string;
    title: string;
    description: string;
    stepsToReproduce?: string;
    authorId: string;
    status: 'reported' | 'confirmed' | 'in_progress' | 'resolved' | 'wont_fix';
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    resolvedAt?: string;
}

// Community Activity Feed
export type ActivityType = 
    | 'sprint_completed' 
    | 'challenge_joined'
    | 'challenge_completed'
    | 'badge_earned'
    | 'streak_milestone'
    | 'template_shared'
    | 'question_answered'
    | 'story_posted'
    | 'level_up';

export interface CommunityActivity {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: ActivityType;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    timestamp: string;
    celebrateCount: number;
}

// Secret Compliment / Kudos
export interface SecretCompliment {
    id: string;
    toUserId: string;
    message: string;
    category: 'encouragement' | 'appreciation' | 'recognition' | 'motivation';
    createdAt: string;
    isRead: boolean;
}

export interface PublicKudos {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar: string;
    toUserId: string;
    toUserName: string;
    toUserAvatar: string;
    message: string;
    category: string;
    likeCount: number;
    createdAt: string;
}

// Weekly Poll / Sprint Challenge
export interface CommunityPoll {
    id: string;
    question: string;
    options: Array<{
        id: string;
        text: string;
        voteCount: number;
    }>;
    totalVotes: number;
    endsAt: string;
    createdAt: string;
    userVotedOptionId?: string;
}

export interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    lifeWheelAreaId: string;
    startDate: string;
    endDate: string;
    participantCount: number;
    completionCount: number;
    rewardXp: number;
    rewardBadge?: CommunityBadgeType;
    isJoined?: boolean;
    isCompleted?: boolean;
}

// Helper types for API responses
export interface ApiResponse<T> {
    data: T;
    error: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
