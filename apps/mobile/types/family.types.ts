/**
 * Family Membership Types
 * 
 * Comprehensive type definitions for family workspaces,
 * members, permissions, and account transitions.
 */

// ==========================================
// View Scope Types
// ==========================================

/**
 * View scope for filtering tasks/epics by family context.
 * - 'mine': Show only the current user's tasks
 * - 'family': Show all family-visible tasks
 * - 'child:{userId}': Parent viewing a specific child's tasks
 */
export type ViewScope = 'mine' | 'family' | `child:${string}`;

/**
 * Parse view scope to extract child user ID if applicable.
 */
export function parseViewScope(scope: ViewScope): { type: 'mine' | 'family' | 'child'; childUserId?: string } {
    if (scope === 'mine') return { type: 'mine' };
    if (scope === 'family') return { type: 'family' };
    if (scope.startsWith('child:')) {
        return { type: 'child', childUserId: scope.replace('child:', '') };
    }
    return { type: 'mine' };
}

// ==========================================
// Permission Types
// ==========================================

export type FamilyPermission =
    | 'view_shared_tasks'
    | 'create_shared_tasks'
    | 'edit_shared_tasks'
    | 'delete_shared_tasks'
    | 'assign_tasks'
    | 'view_shared_epics'
    | 'create_shared_epics'
    | 'edit_shared_epics'
    | 'view_family_calendar'
    | 'add_calendar_events'
    | 'view_family_velocity'
    | 'manage_members'
    | 'invite_members'
    | 'remove_members'
    | 'manage_settings'
    | 'send_kudos'
    | 'view_all_tasks'
    | 'approve_independence';

// ==========================================
// Role Configuration
// ==========================================

export type FamilyRole = 'owner' | 'adult' | 'teen' | 'child';

export interface RolePermissions {
    role: FamilyRole;
    permissions: FamilyPermission[];
    ageRange: { min: number; max: number | null };
    label: string;
    description: string;
    icon: string;
    color: string;
}

export const ROLE_CONFIGURATIONS: Record<FamilyRole, RolePermissions> = {
    owner: {
        role: 'owner',
        permissions: [
            'view_shared_tasks', 'create_shared_tasks', 'edit_shared_tasks', 'delete_shared_tasks',
            'assign_tasks', 'view_shared_epics', 'create_shared_epics', 'edit_shared_epics',
            'view_family_calendar', 'add_calendar_events', 'view_family_velocity',
            'manage_members', 'invite_members', 'remove_members', 'manage_settings',
            'send_kudos', 'view_all_tasks', 'approve_independence'
        ],
        ageRange: { min: 18, max: null },
        label: 'Family Owner',
        description: 'Full control over family workspace and billing',
        icon: 'crown',
        color: '#F59E0B',
    },
    adult: {
        role: 'adult',
        permissions: [
            'view_shared_tasks', 'create_shared_tasks', 'edit_shared_tasks', 'delete_shared_tasks',
            'assign_tasks', 'view_shared_epics', 'create_shared_epics', 'edit_shared_epics',
            'view_family_calendar', 'add_calendar_events', 'view_family_velocity',
            'invite_members', 'manage_settings', 'send_kudos', 'view_all_tasks', 'approve_independence'
        ],
        ageRange: { min: 18, max: null },
        label: 'Adult Member',
        description: 'Co-manage family tasks and members',
        icon: 'account-star',
        color: '#8B5CF6',
    },
    teen: {
        role: 'teen',
        permissions: [
            'view_shared_tasks', 'create_shared_tasks', 'edit_shared_tasks',
            'view_shared_epics', 'view_family_calendar', 'add_calendar_events',
            'send_kudos'
        ],
        ageRange: { min: 13, max: 17 },
        label: 'Teen Member',
        description: 'Participate in family tasks with some autonomy',
        icon: 'account-school',
        color: '#3B82F6',
    },
    child: {
        role: 'child',
        permissions: [
            'view_shared_tasks', 'view_shared_epics', 'view_family_calendar', 'send_kudos'
        ],
        ageRange: { min: 0, max: 12 },
        label: 'Child Member',
        description: 'View and participate in assigned family tasks',
        icon: 'account-child',
        color: '#10B981',
    },
};

// ==========================================
// Task Visibility Types
// ==========================================

export type TaskVisibility = 'private' | 'shared' | 'assigned';

export interface TaskVisibilityConfig {
    type: TaskVisibility;
    label: string;
    description: string;
    icon: string;
    color: string;
}

export const TASK_VISIBILITY_OPTIONS: TaskVisibilityConfig[] = [
    {
        type: 'private',
        label: 'Private',
        description: 'Only you can see this task',
        icon: 'lock',
        color: '#6B7280',
    },
    {
        type: 'shared',
        label: 'Shared with Family',
        description: 'All family members can see this task',
        icon: 'account-group',
        color: '#8B5CF6',
    },
    {
        type: 'assigned',
        label: 'Assigned',
        description: 'Visible to assignee and adults only',
        icon: 'account-arrow-right',
        color: '#3B82F6',
    },
];

// ==========================================
// Family Workspace Types
// ==========================================

export interface FamilyWorkspace {
    id: string;
    name: string;
    ownerId: string;
    members: FamilyMember[];
    sharedEpics: string[];
    sharedTasks: string[];
    sprintSync: 'aligned'; // all Sunday starts
    inviteCode: string;
    inviteCodeExpiresAt: string;
    settings: FamilySettings;
    ceremonies: FamilyCeremony[];
    createdAt: string;
    updatedAt: string;
}

export interface FamilyMember {
    userId: string;
    displayName: string;
    avatar: string;
    role: FamilyRole;
    permissions: FamilyPermission[];
    joinedAt: string;
    dateOfBirth?: string;
    isActive: boolean;
    lastActiveAt: string;
    // Stats
    tasksCompleted: number;
    currentStreak: number;
    kudosReceived: number;
    kudosGiven: number;
}

export interface FamilySettings {
    allowChildTaskCreation: boolean;
    requireAdultApprovalForTaskCompletion: boolean;
    sprintStartDay: 'sunday' | 'monday';
    standupTime: string; // HH:mm format
    standupDays: number[]; // 0-6 (Sunday-Saturday)
    enableVelocitySharing: boolean;
    enableKudos: boolean;
    enableCeremonies: boolean;
    notifyOnMemberActivity: boolean;
    defaultTaskVisibility: TaskVisibility;
}

// ==========================================
// Family Ceremony Types
// ==========================================

export type CeremonyType = 'sprint_planning' | 'standup' | 'retrospective' | 'celebration';

export interface FamilyCeremony {
    id: string;
    type: CeremonyType;
    title: string;
    description: string;
    scheduledAt: string;
    completedAt: string | null;
    participants: string[]; // user IDs
    notes: string;
    mood: Record<string, 'great' | 'good' | 'okay' | 'struggling'>; // userId -> mood
    highlights: CeremonyHighlight[];
}

export interface CeremonyHighlight {
    id: string;
    memberId: string;
    type: 'achievement' | 'challenge' | 'goal' | 'gratitude';
    content: string;
    createdAt: string;
}

// ==========================================
// Kudos System Types
// ==========================================

export interface FamilyKudos {
    id: string;
    fromUserId: string;
    toUserId: string;
    message: string;
    type: KudosType;
    isPrivate: boolean;
    createdAt: string;
}

export type KudosType =
    | 'great_job'
    | 'thank_you'
    | 'proud_of_you'
    | 'keep_going'
    | 'team_player'
    | 'improvement'
    | 'creativity'
    | 'persistence';

export interface KudosConfig {
    type: KudosType;
    emoji: string;
    label: string;
    color: string;
}

export const KUDOS_OPTIONS: KudosConfig[] = [
    { type: 'great_job', emoji: '🌟', label: 'Great Job!', color: '#F59E0B' },
    { type: 'thank_you', emoji: '💜', label: 'Thank You', color: '#8B5CF6' },
    { type: 'proud_of_you', emoji: '🎉', label: 'Proud of You', color: '#10B981' },
    { type: 'keep_going', emoji: '💪', label: 'Keep Going!', color: '#3B82F6' },
    { type: 'team_player', emoji: '🤝', label: 'Team Player', color: '#06B6D4' },
    { type: 'improvement', emoji: '📈', label: 'Great Progress', color: '#EC4899' },
    { type: 'creativity', emoji: '🎨', label: 'Creative!', color: '#F97316' },
    { type: 'persistence', emoji: '🔥', label: 'On Fire!', color: '#EF4444' },
];

// ==========================================
// Shared Epic Types
// ==========================================

export interface SharedEpic {
    id: string;
    familyId: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    createdBy: string;
    assignedTo: string[]; // member user IDs
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    progress: number; // 0-100
    targetDate: string | null;
    tasks: SharedTask[];
    createdAt: string;
    updatedAt: string;
}

export interface SharedTask {
    id: string;
    epicId: string | null;
    familyId: string;
    title: string;
    description: string;
    createdBy: string;
    assignedTo: string | null;
    visibility: TaskVisibility;
    status: 'todo' | 'in_progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string | null;
    completedAt: string | null;
    completedBy: string | null;
    storyPoints: number;
    requiresApproval: boolean;
    approvedBy: string | null;
    approvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// ==========================================
// Family Calendar Types
// ==========================================

export interface FamilyEvent {
    id: string;
    familyId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    location: string | null;
    participants: string[];
    createdBy: string;
    color: string;
    type: 'event' | 'task_deadline' | 'ceremony' | 'reminder';
    linkedTaskId: string | null;
    linkedCeremonyId: string | null;
    createdAt: string;
}

// ==========================================
// Independence Transition Types
// ==========================================

export type TransitionTrigger = 'manual_parent' | 'auto_age_18' | 'manual_request';

export interface IndependenceTransition {
    id: string;
    childUserId: string;
    parentUserId: string;
    familyId: string;
    trigger: TransitionTrigger;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    // Data migration selections
    dataSelections: TransitionDataSelections;
    // Timestamps
    requestedAt: string;
    approvedAt: string | null;
    completedAt: string | null;
    // New account info
    newAccountId: string | null;
    keepFamilyAlumniConnection: boolean;
}

export interface TransitionDataSelections {
    movePersonalTasks: boolean;
    movePersonalEpics: boolean;
    copySharedTasksAsArchive: boolean;
    moveLifeWheelHistory: boolean;
    resetVelocityMetrics: boolean;
    archiveFamilyCeremonies: boolean;
}

export interface TransitionDataSummary {
    personalTasksCount: number;
    personalEpicsCount: number;
    sharedTasksCount: number;
    lifeWheelEntriesCount: number;
    velocityWeeksCount: number;
    ceremoniesCount: number;
    kudosReceivedCount: number;
    kudosGivenCount: number;
}

// ==========================================
// Invite Types
// ==========================================

export interface FamilyInvite {
    code: string;
    familyId: string;
    familyName: string;
    invitedBy: string;
    invitedByName: string;
    suggestedRole: FamilyRole;
    expiresAt: string;
    usedAt: string | null;
    usedBy: string | null;
}

// ==========================================
// Activity Feed Types
// ==========================================

export type FamilyActivityType =
    | 'task_created'
    | 'task_completed'
    | 'task_assigned'
    | 'epic_created'
    | 'epic_completed'
    | 'member_joined'
    | 'member_left'
    | 'kudos_sent'
    | 'ceremony_completed'
    | 'streak_milestone'
    | 'independence_started';

export interface FamilyActivity {
    id: string;
    familyId: string;
    type: FamilyActivityType;
    actorId: string;
    actorName: string;
    actorAvatar: string;
    targetId: string | null;
    targetName: string | null;
    metadata: Record<string, any>;
    createdAt: string;
}

// ==========================================
// Velocity Types
// ==========================================

export interface FamilyVelocity {
    familyId: string;
    weekNumber: number;
    year: number;
    memberVelocities: MemberVelocity[];
    totalPoints: number;
    completedPoints: number;
    averageCompletion: number;
}

export interface MemberVelocity {
    userId: string;
    displayName: string;
    avatar: string;
    plannedPoints: number;
    completedPoints: number;
    completionRate: number;
    streak: number;
}
