// User Management
export interface User {
    id: string;
    email: string;
    fullName: string;
    accountType: 'individual' | 'family_adult' | 'family_child' | 'corporate';
    subscriptionTier: 'free' | 'pro' | 'family' | 'corporate' | 'enterprise';
    timezone: string;
    avatarUrl: string | null;
    createdAt: string;
}

export interface Family {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
}

// SDLC - Life Wheel
export interface LifeWheelArea {
    id: string;
    name: string;
    icon: string;
    color: string;
}

// SDLC - Eisenhower Matrix
export interface EisenhowerQuadrant {
    id: string;
    name: string;
    label: string;
    color: string;
}

// SDLC - Sprints (52 weeks)
export interface Sprint {
    id: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    status: 'planned' | 'active' | 'completed';
    totalPoints: number;
    completedPoints: number;
}

// SDLC - Epics
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
    createdAt: string;
}

// SDLC - Tasks
export interface Task {
    id: string;
    title: string;
    description: string;
    userId: string;
    epicId: string | null;
    lifeWheelAreaId: string;
    eisenhowerQuadrantId: string;
    sprintId: string | null;
    storyPoints: 1 | 2 | 3 | 5 | 8 | 13 | 21;
    status: 'draft' | 'todo' | 'in_progress' | 'done';
    isDraft: boolean;
    aiConfidence: number | null;
    createdFromTemplateId: string | null;
    createdAt: string;
    completedAt: string | null;
}

export interface TaskHistory {
    id: string;
    taskId: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
    changedByUserId: string;
    timestamp: string;
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
    defaultStoryPoints: number;
    defaultLifeWheelAreaId: string;
    defaultEisenhowerQuadrantId: string;
    userId: string;
    createdAt: string;
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

// Motivation - Quotes
export interface QuoteCategory {
    id: string;
    name: string;
    icon: string;
}

export interface Quote {
    id: string;
    text: string;
    author: string;
    categoryId: string;
    createdAt: string;
}

// Books
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

// Challenges
export interface Challenge {
    id: string;
    challengeType: 'solo' | 'group';
    goal: string;
    unit: string;
    targetValue: number;
    createdByUserId: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface ChallengeParticipant {
    id: string;
    challengeId: string;
    userId: string;
    currentProgress: number;
    lastUpdated: string;
    streakDays: number;
}

export interface ChallengeEntry {
    id: string;
    challengeId: string;
    userId: string;
    entryValue: number;
    entryDate: string;
    timestamp: string;
    reactions: Array<{
        userId: string;
        type: 'thumbsup' | 'fire' | 'muscle';
    }>;
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
