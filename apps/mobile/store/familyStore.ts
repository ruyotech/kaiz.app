import { logger } from '../utils/logger';
/**
 * familyStore.ts - Family Membership State Management
 * 
 * Comprehensive Zustand store for family workspace management including:
 * - Family workspace CRUD operations
 * - Member management and invitations
 * - Shared tasks and epics
 * - Family ceremonies (standups, planning)
 * - Kudos system
 * - Independence transitions
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    FamilyWorkspace,
    FamilyMember,
    FamilyRole,
    FamilyPermission,
    FamilySettings,
    FamilyCeremony,
    CeremonyType,
    CeremonyHighlight,
    FamilyKudos,
    KudosType,
    SharedEpic,
    SharedTask,
    TaskVisibility,
    FamilyEvent,
    FamilyActivity,
    FamilyVelocity,
    IndependenceTransition,
    TransitionDataSelections,
    TransitionDataSummary,
    FamilyInvite,
    ROLE_CONFIGURATIONS,
    ViewScope,
} from '../types/family.types';
import { familyApi, FamilyResponse, FamilyMemberResponse, FamilyInviteResponse } from '../services/api';

// ==========================================
// Types & Interfaces
// ==========================================

interface FamilyFilters {
    taskStatus?: string;
    taskAssignee?: string;
    epicStatus?: string;
    activityType?: string;
    dateRange?: { start: string; end: string };
}

interface FamilyState {
    // Current family workspace
    currentFamily: FamilyWorkspace | null;
    isOwner: boolean;
    currentMemberRole: FamilyRole | null;
    
    // View scope for family-aware features
    currentViewScope: ViewScope;
    
    // API loading state
    apiAvailable: boolean;
    
    // Members
    members: FamilyMember[];
    pendingInvites: FamilyInvite[];
    
    // Shared content
    sharedEpics: SharedEpic[];
    sharedTasks: SharedTask[];
    
    // Ceremonies
    ceremonies: FamilyCeremony[];
    activeCeremony: FamilyCeremony | null;
    
    // Kudos
    kudos: FamilyKudos[];
    unreadKudosCount: number;
    
    // Calendar
    familyEvents: FamilyEvent[];
    
    // Activity
    activityFeed: FamilyActivity[];
    
    // Velocity
    familyVelocity: FamilyVelocity | null;
    
    // Independence transition
    activeTransition: IndependenceTransition | null;
    transitionDataSummary: TransitionDataSummary | null;
    
    // UI State
    loading: boolean;
    error: string | null;
    filters: FamilyFilters;
    
    // ==========================================
    // View Scope Actions
    // ==========================================
    setViewScope: (scope: ViewScope) => void;
    
    // ==========================================
    // Family Workspace Actions
    // ==========================================
    createFamily: (name: string) => Promise<void>;
    fetchFamily: (familyId: string) => Promise<void>;
    fetchMyFamily: () => Promise<void>;
    updateFamilySettings: (settings: Partial<FamilySettings>) => Promise<void>;
    generateInviteCode: () => Promise<string>;
    leaveFamily: () => Promise<void>;
    deleteFamily: () => Promise<void>;
    
    // ==========================================
    // Member Actions
    // ==========================================
    fetchMembers: () => Promise<void>;
    inviteMember: (email: string, role: FamilyRole) => Promise<void>;
    joinFamily: (inviteCode: string) => Promise<void>;
    updateMemberRole: (userId: string, role: FamilyRole) => Promise<void>;
    removeMember: (userId: string) => Promise<void>;
    
    // ==========================================
    // Shared Tasks Actions
    // ==========================================
    fetchSharedTasks: (filters?: FamilyFilters) => Promise<void>;
    createSharedTask: (task: Partial<SharedTask>) => Promise<SharedTask>;
    updateSharedTask: (taskId: string, updates: Partial<SharedTask>) => Promise<void>;
    deleteSharedTask: (taskId: string) => Promise<void>;
    assignTask: (taskId: string, userId: string | null) => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;
    approveTaskCompletion: (taskId: string) => Promise<void>;
    
    // ==========================================
    // Shared Epics Actions
    // ==========================================
    fetchSharedEpics: () => Promise<void>;
    createSharedEpic: (epic: Partial<SharedEpic>) => Promise<SharedEpic>;
    updateSharedEpic: (epicId: string, updates: Partial<SharedEpic>) => Promise<void>;
    deleteSharedEpic: (epicId: string) => Promise<void>;
    
    // ==========================================
    // Ceremony Actions
    // ==========================================
    fetchCeremonies: () => Promise<void>;
    createCeremony: (ceremony: Partial<FamilyCeremony>) => Promise<void>;
    startCeremony: (ceremonyId: string) => Promise<void>;
    completeCeremony: (ceremonyId: string, notes: string, highlights: CeremonyHighlight[]) => Promise<void>;
    addCeremonyHighlight: (ceremonyId: string, highlight: Omit<CeremonyHighlight, 'id' | 'createdAt'>) => void;
    setMemberMood: (ceremonyId: string, userId: string, mood: 'great' | 'good' | 'okay' | 'struggling') => void;
    
    // ==========================================
    // Kudos Actions
    // ==========================================
    fetchKudos: () => Promise<void>;
    sendKudos: (toUserId: string, type: KudosType, message: string, isPrivate?: boolean) => Promise<void>;
    markKudosAsRead: () => void;
    
    // ==========================================
    // Calendar Actions
    // ==========================================
    fetchFamilyEvents: (startDate: string, endDate: string) => Promise<void>;
    createFamilyEvent: (event: Partial<FamilyEvent>) => Promise<void>;
    updateFamilyEvent: (eventId: string, updates: Partial<FamilyEvent>) => Promise<void>;
    deleteFamilyEvent: (eventId: string) => Promise<void>;
    
    // ==========================================
    // Activity Actions
    // ==========================================
    fetchActivityFeed: () => Promise<void>;
    
    // ==========================================
    // Velocity Actions
    // ==========================================
    fetchFamilyVelocity: (weekNumber?: number, year?: number) => Promise<void>;
    
    // ==========================================
    // Independence Transition Actions
    // ==========================================
    initiateIndependenceTransition: (childUserId: string) => Promise<void>;
    requestIndependence: () => Promise<void>;
    fetchTransitionDataSummary: () => Promise<void>;
    updateTransitionSelections: (selections: Partial<TransitionDataSelections>) => void;
    approveIndependence: (transitionId: string) => Promise<void>;
    completeIndependence: (transitionId: string, keepFamilyConnection: boolean) => Promise<void>;
    cancelIndependence: (transitionId: string) => Promise<void>;
    
    // ==========================================
    // Permission Helpers
    // ==========================================
    hasPermission: (permission: FamilyPermission) => boolean;
    canManageTask: (task: SharedTask) => boolean;
    canViewTask: (task: SharedTask, currentUserId: string) => boolean;
    
    // ==========================================
    // Utility Actions
    // ==========================================
    setFilters: (filters: Partial<FamilyFilters>) => void;
    clearError: () => void;
    reset: () => void;
}

// ==========================================
// Initial State
// ==========================================

const initialState = {
    currentFamily: null,
    isOwner: false,
    currentMemberRole: null,
    currentViewScope: 'mine' as ViewScope,
    apiAvailable: true, // Assume API is available, will be set to false on error
    members: [],
    pendingInvites: [],
    sharedEpics: [],
    sharedTasks: [],
    ceremonies: [],
    activeCeremony: null,
    kudos: [],
    unreadKudosCount: 0,
    familyEvents: [],
    activityFeed: [],
    familyVelocity: null,
    activeTransition: null,
    transitionDataSummary: null,
    loading: false,
    error: null,
    filters: {},
};

// ==========================================
// Mock Data Generators
// ==========================================

const generateMockFamily = (): FamilyWorkspace => ({
    id: 'family-1',
    name: 'The Smiths',
    ownerId: 'user-1',
    members: [],
    sharedEpics: [],
    sharedTasks: [],
    sprintSync: 'aligned',
    inviteCode: 'SMITH2024',
    inviteCodeExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
        allowChildTaskCreation: true,
        requireAdultApprovalForTaskCompletion: false,
        sprintStartDay: 'sunday',
        standupTime: '18:00',
        standupDays: [0], // Sunday
        enableVelocitySharing: true,
        enableKudos: true,
        enableCeremonies: true,
        notifyOnMemberActivity: true,
        defaultTaskVisibility: 'shared',
    },
    ceremonies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const generateMockMembers = (): FamilyMember[] => [
    {
        userId: 'user-1',
        displayName: 'John Smith',
        avatar: 'account',
        role: 'owner',
        permissions: ROLE_CONFIGURATIONS.owner.permissions,
        joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1985-03-15',
        isActive: true,
        lastActiveAt: new Date().toISOString(),
        tasksCompleted: 156,
        currentStreak: 12,
        kudosReceived: 45,
        kudosGiven: 78,
    },
    {
        userId: 'user-2',
        displayName: 'Sarah Smith',
        avatar: 'account',
        role: 'adult',
        permissions: ROLE_CONFIGURATIONS.adult.permissions,
        joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1987-07-22',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tasksCompleted: 189,
        currentStreak: 8,
        kudosReceived: 52,
        kudosGiven: 91,
    },
    {
        userId: 'user-3',
        displayName: 'Emma Smith',
        avatar: 'account',
        role: 'teen',
        permissions: ROLE_CONFIGURATIONS.teen.permissions,
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '2010-11-05',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tasksCompleted: 67,
        currentStreak: 5,
        kudosReceived: 34,
        kudosGiven: 29,
    },
    {
        userId: 'user-4',
        displayName: 'Max Smith',
        avatar: 'account',
        role: 'child',
        permissions: ROLE_CONFIGURATIONS.child.permissions,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '2016-04-12',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        tasksCompleted: 23,
        currentStreak: 3,
        kudosReceived: 18,
        kudosGiven: 15,
    },
];

const generateMockSharedTasks = (): SharedTask[] => [
    {
        id: 'st-1',
        epicId: 'se-1',
        familyId: 'family-1',
        title: 'Plan family vacation activities',
        description: 'Research and list fun activities for our beach vacation',
        createdBy: 'user-1',
        assignedTo: 'user-3',
        visibility: 'shared',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        completedBy: null,
        storyPoints: 3,
        requiresApproval: false,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'st-2',
        epicId: 'se-1',
        familyId: 'family-1',
        title: 'Book hotel reservations',
        description: 'Find and book family-friendly hotel near the beach',
        createdBy: 'user-2',
        assignedTo: 'user-2',
        visibility: 'shared',
        status: 'done',
        priority: 'high',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedBy: 'user-2',
        storyPoints: 5,
        requiresApproval: false,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'st-3',
        epicId: null,
        familyId: 'family-1',
        title: 'Weekly grocery shopping',
        description: 'Buy groceries for the week',
        createdBy: 'user-1',
        assignedTo: null,
        visibility: 'shared',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        completedBy: null,
        storyPoints: 2,
        requiresApproval: false,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'st-4',
        epicId: 'se-2',
        familyId: 'family-1',
        title: 'Clean room',
        description: 'Tidy up and organize bedroom',
        createdBy: 'user-2',
        assignedTo: 'user-4',
        visibility: 'assigned',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        completedBy: null,
        storyPoints: 1,
        requiresApproval: true,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const generateMockSharedEpics = (): SharedEpic[] => [
    {
        id: 'se-1',
        familyId: 'family-1',
        title: 'Family Beach Vacation',
        description: 'Planning our summer vacation to the beach',
        icon: 'beach',
        color: '#06B6D4',
        createdBy: 'user-1',
        assignedTo: ['user-1', 'user-2', 'user-3'],
        status: 'active',
        progress: 65,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tasks: [],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'se-2',
        familyId: 'family-1',
        title: 'Home Chores',
        description: 'Regular household tasks and responsibilities',
        icon: 'home-outline',
        color: '#10B981',
        createdBy: 'user-2',
        assignedTo: ['user-1', 'user-2', 'user-3', 'user-4'],
        status: 'active',
        progress: 40,
        targetDate: null,
        tasks: [],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const generateMockCeremonies = (): FamilyCeremony[] => [
    {
        id: 'cer-1',
        type: 'standup',
        title: 'Family Standup',
        description: "How's everyone doing today?",
        scheduledAt: new Date().toISOString(),
        completedAt: null,
        participants: ['user-1', 'user-2', 'user-3', 'user-4'],
        notes: '',
        mood: {},
        highlights: [],
    },
    {
        id: 'cer-2',
        type: 'sprint_planning',
        title: 'Weekly Planning',
        description: 'Plan our tasks for the upcoming week',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        participants: ['user-1', 'user-2', 'user-3', 'user-4'],
        notes: '',
        mood: {},
        highlights: [],
    },
];

const generateMockKudos = (): FamilyKudos[] => [
    {
        id: 'kudos-1',
        fromUserId: 'user-2',
        toUserId: 'user-3',
        message: 'Great job finishing your homework early!',
        type: 'great_job',
        isPrivate: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'kudos-2',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        message: 'Thank you for cooking dinner!',
        type: 'thank_you',
        isPrivate: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'kudos-3',
        fromUserId: 'user-3',
        toUserId: 'user-4',
        message: 'You did great at your soccer game!',
        type: 'proud_of_you',
        isPrivate: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const generateMockActivity = (): FamilyActivity[] => [
    {
        id: 'act-1',
        familyId: 'family-1',
        type: 'task_completed',
        actorId: 'user-2',
        actorName: 'Sarah',
        actorAvatar: 'account',
        targetId: 'st-2',
        targetName: 'Book hotel reservations',
        metadata: { storyPoints: 5 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'act-2',
        familyId: 'family-1',
        type: 'kudos_sent',
        actorId: 'user-2',
        actorName: 'Sarah',
        actorAvatar: 'account',
        targetId: 'user-3',
        targetName: 'Emma',
        metadata: { kudosType: 'great_job' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'act-3',
        familyId: 'family-1',
        type: 'streak_milestone',
        actorId: 'user-1',
        actorName: 'John',
        actorAvatar: 'account',
        targetId: null,
        targetName: null,
        metadata: { streakDays: 12 },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

const generateMockVelocity = (): FamilyVelocity => ({
    familyId: 'family-1',
    weekNumber: 5,
    year: 2026,
    memberVelocities: [
        { userId: 'user-1', displayName: 'John', avatar: 'account', plannedPoints: 15, completedPoints: 12, completionRate: 80, streak: 12 },
        { userId: 'user-2', displayName: 'Sarah', avatar: 'account', plannedPoints: 18, completedPoints: 16, completionRate: 89, streak: 8 },
        { userId: 'user-3', displayName: 'Emma', avatar: 'account', plannedPoints: 10, completedPoints: 8, completionRate: 80, streak: 5 },
        { userId: 'user-4', displayName: 'Max', avatar: 'account', plannedPoints: 5, completedPoints: 4, completionRate: 80, streak: 3 },
    ],
    totalPoints: 48,
    completedPoints: 40,
    averageCompletion: 83,
});

// ==========================================
// Store Implementation
// ==========================================

export const useFamilyStore = create<FamilyState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ==========================================
            // View Scope Actions
            // ==========================================
            
            setViewScope: (scope: ViewScope) => {
                set({ currentViewScope: scope });
            },

            // ==========================================
            // Family Workspace Actions
            // ==========================================
            
            createFamily: async (name) => {
                set({ loading: true, error: null });
                try {
                    const apiFamily = await familyApi.createFamily({ name });
                    // Map API response to FamilyWorkspace
                    const newFamily: FamilyWorkspace = {
                        id: apiFamily.id,
                        name: apiFamily.name,
                        ownerId: apiFamily.ownerId,
                        members: [],
                        sharedEpics: [],
                        sharedTasks: [],
                        sprintSync: 'aligned',
                        inviteCode: apiFamily.inviteCode,
                        inviteCodeExpiresAt: apiFamily.inviteCodeExpiresAt,
                        settings: apiFamily.settings || generateMockFamily().settings,
                        ceremonies: [],
                        createdAt: apiFamily.createdAt,
                        updatedAt: apiFamily.updatedAt,
                    };
                    set({ 
                        currentFamily: newFamily, 
                        isOwner: true,
                        currentMemberRole: 'owner',
                        apiAvailable: true,
                        loading: false 
                    });
                } catch (error) {
                    // Fallback to mock data if API unavailable
                    logger.warn('API unavailable, using mock data:', error);
                    const newFamily = {
                        ...generateMockFamily(),
                        id: `family-${Date.now()}`,
                        name,
                    };
                    set({ 
                        currentFamily: newFamily, 
                        isOwner: true,
                        currentMemberRole: 'owner',
                        apiAvailable: false,
                        loading: false 
                    });
                }
            },

            fetchFamily: async (familyId) => {
                set({ loading: true, error: null });
                try {
                    // Fetch family and membership in parallel
                    const [apiFamily, membership] = await Promise.all([
                        familyApi.getFamily(familyId),
                        familyApi.getMyMembership(),
                    ]);
                    
                    const family: FamilyWorkspace = {
                        id: apiFamily.id,
                        name: apiFamily.name,
                        ownerId: apiFamily.ownerId,
                        members: [],
                        sharedEpics: [],
                        sharedTasks: [],
                        sprintSync: 'aligned',
                        inviteCode: apiFamily.inviteCode,
                        inviteCodeExpiresAt: apiFamily.inviteCodeExpiresAt,
                        settings: apiFamily.settings || generateMockFamily().settings,
                        ceremonies: [],
                        createdAt: apiFamily.createdAt,
                        updatedAt: apiFamily.updatedAt,
                    };
                    
                    // Determine role from membership
                    const memberRole = membership.role.toLowerCase() as FamilyRole;
                    const isOwner = membership.isOwner;
                    
                    set({ 
                        currentFamily: family,
                        isOwner,
                        currentMemberRole: memberRole,
                        apiAvailable: true,
                        loading: false 
                    });
                    
                    // Fetch members in background
                    get().fetchMembers();
                } catch (error: unknown) {
                    // Check if this is a 404/500 "not found" - family doesn't exist
                    const errObj = error as { statusCode?: number; message?: string } | null;
                    const isNotFound = errObj?.statusCode === 404 || 
                        errObj?.message?.includes('not found');
                    
                    if (isNotFound) {
                        logger.log('Family not found:', familyId);
                        set({ 
                            currentFamily: null,
                            members: [],
                            isOwner: false,
                            currentMemberRole: null,
                            apiAvailable: true,
                            loading: false 
                        });
                    } else {
                        // Actual API error
                        logger.warn('Could not fetch family:', error);
                        set({ 
                            currentFamily: null,
                            members: [],
                            isOwner: false,
                            currentMemberRole: null,
                            apiAvailable: false,
                            loading: false 
                        });
                    }
                }
            },

            fetchMyFamily: async () => {
                set({ loading: true, error: null });
                try {
                    const apiFamily = await familyApi.getMyFamily();
                    const family: FamilyWorkspace = {
                        id: apiFamily.id,
                        name: apiFamily.name,
                        ownerId: apiFamily.ownerId,
                        members: [],
                        sharedEpics: [],
                        sharedTasks: [],
                        sprintSync: 'aligned',
                        inviteCode: apiFamily.inviteCode,
                        inviteCodeExpiresAt: apiFamily.inviteCodeExpiresAt,
                        settings: apiFamily.settings || generateMockFamily().settings,
                        ceremonies: [],
                        createdAt: apiFamily.createdAt,
                        updatedAt: apiFamily.updatedAt,
                    };
                    
                    // Get membership to determine role
                    try {
                        const membership = await familyApi.getMyMembership();
                        const memberRole = membership.role.toLowerCase() as FamilyRole;
                        const isOwner = membership.isOwner;
                        
                        set({ 
                            currentFamily: family,
                            isOwner,
                            currentMemberRole: memberRole,
                            apiAvailable: true,
                            loading: false 
                        });
                        
                        // Fetch members in background
                        get().fetchMembers();
                    } catch (membershipError) {
                        // Family exists but membership fetch failed - use defaults
                        logger.warn('Could not fetch membership:', membershipError);
                        set({ 
                            currentFamily: family,
                            isOwner: false,
                            currentMemberRole: 'adult',
                            apiAvailable: true,
                            loading: false 
                        });
                    }
                } catch (error: unknown) {
                    // Check if this is a 404/500 "not found" - user has no family
                    // The backend returns 404 when user is not a member of any family
                    const errObj = error as { statusCode?: number; message?: string } | null;
                    const isNotFound = errObj?.statusCode === 404 || 
                        errObj?.message?.includes('not a member of any family') ||
                        errObj?.message?.includes('not found');
                    
                    if (isNotFound) {
                        // User has no family - this is a valid state, not an error
                        logger.log('User has no family workspace');
                        set({ 
                            currentFamily: null,
                            members: [],
                            isOwner: false,
                            currentMemberRole: null,
                            apiAvailable: true,
                            loading: false 
                        });
                    } else {
                        // Actual API error - log it but show empty state (not mock data)
                        logger.warn('Could not fetch family:', error);
                        set({ 
                            currentFamily: null,
                            members: [],
                            isOwner: false,
                            currentMemberRole: null,
                            apiAvailable: false, // API may be down
                            loading: false 
                        });
                    }
                }
            },

            updateFamilySettings: async (settings) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        currentFamily: state.currentFamily ? {
                            ...state.currentFamily,
                            settings: { ...state.currentFamily.settings, ...settings },
                            updatedAt: new Date().toISOString(),
                        } : null,
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to update settings', loading: false });
                }
            },

            generateInviteCode: async () => {
                set({ loading: true, error: null });
                try {
                    const familyId = get().currentFamily?.id;
                    if (!familyId) {
                        throw new Error('No family selected');
                    }
                    
                    const code = await familyApi.regenerateInviteCode(familyId);
                    set(state => ({
                        currentFamily: state.currentFamily ? {
                            ...state.currentFamily,
                            inviteCode: code,
                            inviteCodeExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        } : null,
                        loading: false,
                    }));
                    return code;
                } catch (error) {
                    // Fallback to local generation if API unavailable
                    logger.warn('API unavailable, generating local code:', error);
                    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
                    set(state => ({
                        currentFamily: state.currentFamily ? {
                            ...state.currentFamily,
                            inviteCode: code,
                            inviteCodeExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        } : null,
                        apiAvailable: false,
                        loading: false,
                    }));
                    return code;
                }
            },

            leaveFamily: async () => {
                set({ loading: true, error: null });
                try {
                    await familyApi.leaveFamily();
                    set({ ...initialState });
                } catch (error) {
                    logger.warn('API error, clearing local state:', error);
                    set({ ...initialState });
                }
            },

            deleteFamily: async () => {
                set({ loading: true, error: null });
                try {
                    const familyId = get().currentFamily?.id;
                    if (familyId) {
                        await familyApi.deleteFamily(familyId);
                    }
                    set({ ...initialState });
                } catch (error) {
                    logger.warn('API error:', error);
                    set({ error: 'Failed to delete family', loading: false });
                    throw error;
                }
            },

            // ==========================================
            // Member Actions
            // ==========================================

            fetchMembers: async () => {
                const familyId = get().currentFamily?.id;
                if (!familyId) {
                    // No family - no members to fetch
                    set({ members: [], loading: false });
                    return;
                }
                
                set({ loading: true, error: null });
                try {
                    const apiMembers = await familyApi.getMembers(familyId);
                    // Map API response to FamilyMember[]
                    const members: FamilyMember[] = apiMembers.map((m: FamilyMemberResponse) => ({
                        userId: m.userId,
                        displayName: m.displayName,
                        avatar: m.avatarUrl || 'account-outline',
                        role: m.role.toLowerCase() as FamilyRole,
                        permissions: ROLE_CONFIGURATIONS[m.role.toLowerCase() as FamilyRole]?.permissions || [],
                        joinedAt: m.joinedAt,
                        dateOfBirth: undefined,
                        isActive: m.isActive,
                        lastActiveAt: m.lastActiveAt || new Date().toISOString(),
                        tasksCompleted: m.tasksCompleted || 0,
                        currentStreak: m.currentStreak || 0,
                        kudosReceived: 0,
                        kudosGiven: 0,
                    }));
                    set({ members, loading: false });
                } catch (error) {
                    // API error - set empty members, don't fall back to mock
                    logger.warn('Could not fetch members:', error);
                    set({ members: [], apiAvailable: false, loading: false });
                }
            },

            inviteMember: async (email, role) => {
                set({ loading: true, error: null });
                try {
                    const familyId = get().currentFamily?.id;
                    if (!familyId) {
                        throw new Error('No family selected');
                    }
                    
                    await familyApi.inviteMember(familyId, { email, role: role.toUpperCase() as FamilyRole });
                    // Refresh pending invites
                    try {
                        const apiInvites = await familyApi.getPendingInvites(familyId);
                        const invites: FamilyInvite[] = apiInvites.map((inv: FamilyInviteResponse) => ({
                            code: inv.id, // Use ID as code for reference
                            familyId: familyId,
                            familyName: get().currentFamily?.name || '',
                            invitedBy: '', // Not provided in response
                            invitedByName: inv.invitedByName,
                            suggestedRole: inv.suggestedRole.toLowerCase() as FamilyRole,
                            expiresAt: inv.expiresAt,
                            usedAt: inv.status === 'ACCEPTED' ? inv.createdAt : null,
                            usedBy: inv.email,
                        }));
                        set({ pendingInvites: invites, loading: false });
                    } catch (inviteError) {
                        logger.warn('Could not fetch pending invites:', inviteError);
                        set({ loading: false });
                    }
                } catch (error) {
                    // Fallback to mock invite
                    logger.warn('API unavailable, using mock invite:', error);
                    const invite: FamilyInvite = {
                        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
                        familyId: get().currentFamily?.id || '',
                        familyName: get().currentFamily?.name || '',
                        invitedBy: 'user-1',
                        invitedByName: 'Current User',
                        suggestedRole: role,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        usedAt: null,
                        usedBy: null,
                    };
                    set(state => ({
                        pendingInvites: [...state.pendingInvites, invite],
                        apiAvailable: false,
                        loading: false,
                    }));
                }
            },

            joinFamily: async (inviteCode) => {
                set({ loading: true, error: null });
                try {
                    const membership = await familyApi.joinFamily({ inviteCode });
                    
                    // Fetch the full family details
                    const apiFamily = await familyApi.getFamily(membership.familyId);
                    const family: FamilyWorkspace = {
                        id: apiFamily.id,
                        name: apiFamily.name,
                        ownerId: apiFamily.ownerId,
                        members: [],
                        sharedEpics: [],
                        sharedTasks: [],
                        sprintSync: 'aligned',
                        inviteCode: apiFamily.inviteCode,
                        inviteCodeExpiresAt: apiFamily.inviteCodeExpiresAt,
                        settings: apiFamily.settings || generateMockFamily().settings,
                        ceremonies: [],
                        createdAt: apiFamily.createdAt,
                        updatedAt: apiFamily.updatedAt,
                    };
                    
                    set({
                        currentFamily: family,
                        isOwner: membership.isOwner,
                        currentMemberRole: membership.role.toLowerCase() as FamilyRole,
                        apiAvailable: true,
                        loading: false,
                    });
                    
                    // Fetch members in background
                    get().fetchMembers();
                } catch (error) {
                    // For join, we should not fallback to mock - show error
                    logger.error('Failed to join family:', error);
                    set({ error: 'Invalid or expired invite code', loading: false });
                    throw error;
                }
            },

            updateMemberRole: async (userId, role) => {
                set({ loading: true, error: null });
                try {
                    const familyId = get().currentFamily?.id;
                    if (!familyId) {
                        throw new Error('No family selected');
                    }
                    
                    await familyApi.updateMemberRole(familyId, userId, role.toUpperCase() as FamilyRole);
                    set(state => ({
                        members: state.members.map(m =>
                            m.userId === userId
                                ? { ...m, role, permissions: ROLE_CONFIGURATIONS[role]?.permissions || [] }
                                : m
                        ),
                        loading: false,
                    }));
                } catch (error) {
                    // Fallback to local update
                    logger.warn('API unavailable, updating locally:', error);
                    set(state => ({
                        members: state.members.map(m =>
                            m.userId === userId
                                ? { ...m, role, permissions: ROLE_CONFIGURATIONS[role]?.permissions || [] }
                                : m
                        ),
                        apiAvailable: false,
                        loading: false,
                    }));
                }
            },

            removeMember: async (userId) => {
                set({ loading: true, error: null });
                try {
                    const familyId = get().currentFamily?.id;
                    if (!familyId) {
                        throw new Error('No family selected');
                    }
                    
                    await familyApi.removeMember(familyId, userId);
                    set(state => ({
                        members: state.members.filter(m => m.userId !== userId),
                        loading: false,
                    }));
                } catch (error) {
                    // Fallback to local removal
                    logger.warn('API unavailable, removing locally:', error);
                    set(state => ({
                        members: state.members.filter(m => m.userId !== userId),
                        apiAvailable: false,
                        loading: false,
                    }));
                }
            },

            // ==========================================
            // Shared Tasks Actions
            // ==========================================

            fetchSharedTasks: async (filters) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    let tasks = generateMockSharedTasks();
                    if (filters?.taskStatus) {
                        tasks = tasks.filter(t => t.status === filters.taskStatus);
                    }
                    if (filters?.taskAssignee) {
                        tasks = tasks.filter(t => t.assignedTo === filters.taskAssignee);
                    }
                    set({ sharedTasks: tasks, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch shared tasks', loading: false });
                }
            },

            createSharedTask: async (task) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const newTask: SharedTask = {
                        id: `st-${Date.now()}`,
                        epicId: task.epicId || null,
                        familyId: get().currentFamily?.id || '',
                        title: task.title || '',
                        description: task.description || '',
                        createdBy: 'user-1',
                        assignedTo: task.assignedTo || null,
                        visibility: task.visibility || 'shared',
                        status: 'todo',
                        priority: task.priority || 'medium',
                        dueDate: task.dueDate || null,
                        completedAt: null,
                        completedBy: null,
                        storyPoints: task.storyPoints || 1,
                        requiresApproval: task.requiresApproval || false,
                        approvedBy: null,
                        approvedAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    set(state => ({
                        sharedTasks: [...state.sharedTasks, newTask],
                        loading: false,
                    }));
                    return newTask;
                } catch (error) {
                    set({ error: 'Failed to create task', loading: false });
                    throw error;
                }
            },

            updateSharedTask: async (taskId, updates) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        sharedTasks: state.sharedTasks.map(t =>
                            t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
                        ),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to update task', loading: false });
                }
            },

            deleteSharedTask: async (taskId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        sharedTasks: state.sharedTasks.filter(t => t.id !== taskId),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to delete task', loading: false });
                }
            },

            assignTask: async (taskId, userId) => {
                await get().updateSharedTask(taskId, { assignedTo: userId });
            },

            completeTask: async (taskId) => {
                await get().updateSharedTask(taskId, {
                    status: 'done',
                    completedAt: new Date().toISOString(),
                    completedBy: 'user-1',
                });
            },

            approveTaskCompletion: async (taskId) => {
                await get().updateSharedTask(taskId, {
                    approvedBy: 'user-1',
                    approvedAt: new Date().toISOString(),
                });
            },

            // ==========================================
            // Shared Epics Actions
            // ==========================================

            fetchSharedEpics: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ sharedEpics: generateMockSharedEpics(), loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch shared epics', loading: false });
                }
            },

            createSharedEpic: async (epic) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const newEpic: SharedEpic = {
                        id: `se-${Date.now()}`,
                        familyId: get().currentFamily?.id || '',
                        title: epic.title || '',
                        description: epic.description || '',
                        icon: epic.icon || 'clipboard-text-outline',
                        color: epic.color || '#8B5CF6',
                        createdBy: 'user-1',
                        assignedTo: epic.assignedTo || [],
                        status: 'planning',
                        progress: 0,
                        targetDate: epic.targetDate || null,
                        tasks: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    set(state => ({
                        sharedEpics: [...state.sharedEpics, newEpic],
                        loading: false,
                    }));
                    return newEpic;
                } catch (error) {
                    set({ error: 'Failed to create epic', loading: false });
                    throw error;
                }
            },

            updateSharedEpic: async (epicId, updates) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        sharedEpics: state.sharedEpics.map(e =>
                            e.id === epicId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
                        ),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to update epic', loading: false });
                }
            },

            deleteSharedEpic: async (epicId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        sharedEpics: state.sharedEpics.filter(e => e.id !== epicId),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to delete epic', loading: false });
                }
            },

            // ==========================================
            // Ceremony Actions
            // ==========================================

            fetchCeremonies: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ ceremonies: generateMockCeremonies(), loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch ceremonies', loading: false });
                }
            },

            createCeremony: async (ceremony) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const newCeremony: FamilyCeremony = {
                        id: `cer-${Date.now()}`,
                        type: ceremony.type || 'standup',
                        title: ceremony.title || '',
                        description: ceremony.description || '',
                        scheduledAt: ceremony.scheduledAt || new Date().toISOString(),
                        completedAt: null,
                        participants: ceremony.participants || [],
                        notes: '',
                        mood: {},
                        highlights: [],
                    };
                    set(state => ({
                        ceremonies: [...state.ceremonies, newCeremony],
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to create ceremony', loading: false });
                }
            },

            startCeremony: async (ceremonyId) => {
                const ceremony = get().ceremonies.find(c => c.id === ceremonyId);
                if (ceremony) {
                    set({ activeCeremony: ceremony });
                }
            },

            completeCeremony: async (ceremonyId, notes, highlights) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        ceremonies: state.ceremonies.map(c =>
                            c.id === ceremonyId
                                ? { ...c, completedAt: new Date().toISOString(), notes, highlights }
                                : c
                        ),
                        activeCeremony: null,
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to complete ceremony', loading: false });
                }
            },

            addCeremonyHighlight: (ceremonyId, highlight) => {
                const newHighlight: CeremonyHighlight = {
                    ...highlight,
                    id: `highlight-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                set(state => ({
                    activeCeremony: state.activeCeremony?.id === ceremonyId
                        ? { ...state.activeCeremony, highlights: [...state.activeCeremony.highlights, newHighlight] }
                        : state.activeCeremony,
                }));
            },

            setMemberMood: (ceremonyId, userId, mood) => {
                set(state => ({
                    activeCeremony: state.activeCeremony?.id === ceremonyId
                        ? { ...state.activeCeremony, mood: { ...state.activeCeremony.mood, [userId]: mood } }
                        : state.activeCeremony,
                }));
            },

            // ==========================================
            // Kudos Actions
            // ==========================================

            fetchKudos: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ kudos: generateMockKudos(), unreadKudosCount: 2, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch kudos', loading: false });
                }
            },

            sendKudos: async (toUserId, type, message, isPrivate = false) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const newKudos: FamilyKudos = {
                        id: `kudos-${Date.now()}`,
                        fromUserId: 'user-1',
                        toUserId,
                        message,
                        type,
                        isPrivate,
                        createdAt: new Date().toISOString(),
                    };
                    set(state => ({
                        kudos: [newKudos, ...state.kudos],
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to send kudos', loading: false });
                    throw error;
                }
            },

            markKudosAsRead: () => {
                set({ unreadKudosCount: 0 });
            },

            // ==========================================
            // Calendar Actions
            // ==========================================

            fetchFamilyEvents: async (startDate, endDate) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    // Generate some mock events
                    const events: FamilyEvent[] = [
                        {
                            id: 'event-1',
                            familyId: 'family-1',
                            title: 'Family Dinner',
                            description: 'Weekly family dinner together',
                            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                            isAllDay: false,
                            location: 'Home',
                            participants: ['user-1', 'user-2', 'user-3', 'user-4'],
                            createdBy: 'user-2',
                            color: '#8B5CF6',
                            type: 'event',
                            linkedTaskId: null,
                            linkedCeremonyId: null,
                            createdAt: new Date().toISOString(),
                        },
                    ];
                    set({ familyEvents: events, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch events', loading: false });
                }
            },

            createFamilyEvent: async (event) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const newEvent: FamilyEvent = {
                        id: `event-${Date.now()}`,
                        familyId: get().currentFamily?.id || '',
                        title: event.title || '',
                        description: event.description || '',
                        startTime: event.startTime || new Date().toISOString(),
                        endTime: event.endTime || new Date().toISOString(),
                        isAllDay: event.isAllDay || false,
                        location: event.location || null,
                        participants: event.participants || [],
                        createdBy: 'user-1',
                        color: event.color || '#8B5CF6',
                        type: event.type || 'event',
                        linkedTaskId: event.linkedTaskId || null,
                        linkedCeremonyId: event.linkedCeremonyId || null,
                        createdAt: new Date().toISOString(),
                    };
                    set(state => ({
                        familyEvents: [...state.familyEvents, newEvent],
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to create event', loading: false });
                }
            },

            updateFamilyEvent: async (eventId, updates) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        familyEvents: state.familyEvents.map(e =>
                            e.id === eventId ? { ...e, ...updates } : e
                        ),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to update event', loading: false });
                }
            },

            deleteFamilyEvent: async (eventId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set(state => ({
                        familyEvents: state.familyEvents.filter(e => e.id !== eventId),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to delete event', loading: false });
                }
            },

            // ==========================================
            // Activity Actions
            // ==========================================

            fetchActivityFeed: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ activityFeed: generateMockActivity(), loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch activity', loading: false });
                }
            },

            // ==========================================
            // Velocity Actions
            // ==========================================

            fetchFamilyVelocity: async (weekNumber, year) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ familyVelocity: generateMockVelocity(), loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch velocity', loading: false });
                }
            },

            // ==========================================
            // Independence Transition Actions
            // ==========================================

            initiateIndependenceTransition: async (childUserId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const transition: IndependenceTransition = {
                        id: `trans-${Date.now()}`,
                        childUserId,
                        parentUserId: 'user-1',
                        familyId: get().currentFamily?.id || '',
                        trigger: 'manual_parent',
                        status: 'pending',
                        dataSelections: {
                            movePersonalTasks: true,
                            movePersonalEpics: true,
                            copySharedTasksAsArchive: true,
                            moveLifeWheelHistory: true,
                            resetVelocityMetrics: true,
                            archiveFamilyCeremonies: true,
                        },
                        requestedAt: new Date().toISOString(),
                        approvedAt: null,
                        completedAt: null,
                        newAccountId: null,
                        keepFamilyAlumniConnection: false,
                    };
                    set({ activeTransition: transition, loading: false });
                } catch (error) {
                    set({ error: 'Failed to initiate transition', loading: false });
                    throw error;
                }
            },

            requestIndependence: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const transition: IndependenceTransition = {
                        id: `trans-${Date.now()}`,
                        childUserId: 'user-3', // Current user (teen/child)
                        parentUserId: 'user-1',
                        familyId: get().currentFamily?.id || '',
                        trigger: 'manual_request',
                        status: 'pending',
                        dataSelections: {
                            movePersonalTasks: true,
                            movePersonalEpics: true,
                            copySharedTasksAsArchive: true,
                            moveLifeWheelHistory: true,
                            resetVelocityMetrics: true,
                            archiveFamilyCeremonies: true,
                        },
                        requestedAt: new Date().toISOString(),
                        approvedAt: null,
                        completedAt: null,
                        newAccountId: null,
                        keepFamilyAlumniConnection: false,
                    };
                    set({ activeTransition: transition, loading: false });
                } catch (error) {
                    set({ error: 'Failed to request independence', loading: false });
                    throw error;
                }
            },

            fetchTransitionDataSummary: async () => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const summary: TransitionDataSummary = {
                        personalTasksCount: 67,
                        personalEpicsCount: 5,
                        sharedTasksCount: 23,
                        lifeWheelEntriesCount: 156,
                        velocityWeeksCount: 26,
                        ceremoniesCount: 42,
                        kudosReceivedCount: 34,
                        kudosGivenCount: 29,
                    };
                    set({ transitionDataSummary: summary, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch data summary', loading: false });
                }
            },

            updateTransitionSelections: (selections) => {
                set(state => ({
                    activeTransition: state.activeTransition ? {
                        ...state.activeTransition,
                        dataSelections: { ...state.activeTransition.dataSelections, ...selections },
                    } : null,
                }));
            },

            approveIndependence: async (transitionId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    set(state => ({
                        activeTransition: state.activeTransition?.id === transitionId ? {
                            ...state.activeTransition,
                            status: 'in_progress',
                            approvedAt: new Date().toISOString(),
                        } : state.activeTransition,
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to approve transition', loading: false });
                    throw error;
                }
            },

            completeIndependence: async (transitionId, keepFamilyConnection) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    set(state => ({
                        activeTransition: state.activeTransition?.id === transitionId ? {
                            ...state.activeTransition,
                            status: 'completed',
                            completedAt: new Date().toISOString(),
                            keepFamilyAlumniConnection: keepFamilyConnection,
                            newAccountId: `new-account-${Date.now()}`,
                        } : state.activeTransition,
                        members: state.members.filter(m => m.userId !== state.activeTransition?.childUserId),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to complete transition', loading: false });
                    throw error;
                }
            },

            cancelIndependence: async (transitionId) => {
                set({ loading: true, error: null });
                try {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    set({ activeTransition: null, transitionDataSummary: null, loading: false });
                } catch (error) {
                    set({ error: 'Failed to cancel transition', loading: false });
                }
            },

            // ==========================================
            // Permission Helpers
            // ==========================================

            hasPermission: (permission) => {
                const role = get().currentMemberRole;
                if (!role) return false;
                return ROLE_CONFIGURATIONS[role].permissions.includes(permission);
            },

            canManageTask: (task) => {
                const state = get();
                if (!state.currentMemberRole) return false;
                
                // Owner and adults can manage all tasks
                if (['owner', 'adult'].includes(state.currentMemberRole)) return true;
                
                // Teens can edit their own or shared tasks
                if (state.currentMemberRole === 'teen') {
                    return task.createdBy === 'user-1' || // Mock current user
                        task.visibility === 'shared';
                }
                
                return false;
            },

            canViewTask: (task, currentUserId) => {
                const state = get();
                if (!state.currentMemberRole) return false;
                
                // Owner and adults can view all tasks
                if (['owner', 'adult'].includes(state.currentMemberRole)) return true;
                
                // For others, check visibility
                if (task.visibility === 'private') {
                    return task.createdBy === currentUserId;
                }
                if (task.visibility === 'assigned') {
                    return task.assignedTo === currentUserId || 
                        ['owner', 'adult'].includes(state.currentMemberRole);
                }
                
                return true; // shared
            },

            // ==========================================
            // Utility Actions
            // ==========================================

            setFilters: (filters) => {
                set(state => ({ filters: { ...state.filters, ...filters } }));
            },

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set({ ...initialState });
            },
        }),
        {
            name: 'family-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                currentFamily: state.currentFamily,
                currentMemberRole: state.currentMemberRole,
                isOwner: state.isOwner,
            }),
        }
    )
);
