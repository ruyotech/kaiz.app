import { logger } from '../utils/logger';
/**
 * SensAI Store - AI Scrum Master & Life Coach State Management
 * 
 * Handles velocity tracking, interventions, standups, ceremonies,
 * and life wheel oversight.
 */

import { create } from 'zustand';
import { sensaiApi } from '../services/api';
import {
    VelocityMetrics,
    SprintHealth,
    DailyStandup,
    Intervention,
    SprintCeremony,
    LifeWheelMetrics,
    CoachMessage,
    SensAISettings,
    IntakeResult,
    SensAIAnalytics,
    LIFE_WHEEL_DIMENSIONS,
    InterventionType,
    StandupBlocker,
    RecoveryTask,
} from '../types/sensai.types';

interface SensAIState {
    // Core state
    isInitialized: boolean;
    loading: boolean;
    error: string | null;

    // Velocity & Capacity
    velocityMetrics: VelocityMetrics | null;
    currentSprintHealth: SprintHealth | null;

    // Daily Operations
    todayStandup: DailyStandup | null;
    recentStandups: DailyStandup[];

    // Interventions
    activeInterventions: Intervention[];
    interventionHistory: Intervention[];

    // Ceremonies
    upcomingCeremonies: SprintCeremony[];
    pastCeremonies: SprintCeremony[];

    // Life Wheel
    lifeWheelMetrics: LifeWheelMetrics | null;

    // Coach Messages
    coachMessages: CoachMessage[];
    unreadMessageCount: number;

    // Settings
    settings: SensAISettings | null;

    // Analytics
    analytics: SensAIAnalytics | null;

    // Actions - Initialization
    initialize: (userId: string) => Promise<void>;
    refreshData: () => Promise<void>;

    // Actions - Velocity
    calculateVelocity: () => Promise<void>;
    getSprintHealth: (sprintId: string) => Promise<SprintHealth>;

    // Actions - Standup
    getTodayStandup: () => Promise<DailyStandup | null>;
    completeStandup: (blockers: string[], notes?: string, mood?: string) => Promise<void>;
    skipStandup: (reason?: string) => Promise<void>;
    convertBlockerToTask: (blockerId: string) => Promise<void>;

    // Actions - Interventions
    fetchActiveInterventions: () => Promise<void>;
    acknowledgeIntervention: (interventionId: string, action: 'acknowledge' | 'override' | 'defer', reason?: string) => Promise<void>;
    dismissIntervention: (interventionId: string) => Promise<void>;

    // Actions - Ceremonies
    startCeremony: (type: 'planning' | 'review' | 'retrospective') => Promise<void>;
    startSprintPlanning: () => Promise<void>;
    completeSprintPlanning: (selectedTaskIds: string[], notes?: string) => Promise<void>;
    startSprintReview: () => Promise<void>;
    completeSprintReview: (notes?: string) => Promise<void>;
    startRetrospective: () => Promise<void>;
    completeRetrospective: (whatWorked: string[], whatBlocked: string[], learnings: string[]) => Promise<void>;

    // Actions - Life Wheel
    fetchLifeWheelMetrics: () => Promise<void>;
    addRecoveryTask: (task: RecoveryTask) => Promise<void>;

    // Actions - Intake
    processIntake: (type: string, content: string, metadata?: Record<string, any>) => Promise<IntakeResult>;

    // Actions - Messages
    fetchCoachMessages: () => Promise<void>;
    markMessageRead: (messageId: string) => void;
    markAllMessagesRead: () => void;
    addCoachMessage: (message: CoachMessage) => void;
    generateWelcomeMessage: () => void;

    // Actions - Settings
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Partial<SensAISettings>) => Promise<void>;

    // Actions - Analytics
    fetchAnalytics: (period: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;

    // Utility
    getInterventionsByType: (type: InterventionType) => Intervention[];
    getNeglectedDimensions: () => string[];
    isOvercommitted: (plannedPoints: number) => boolean;
    calculateOvercommitPercentage: (plannedPoints: number) => number;
    clearError: () => void;
}

export const useSensAIStore = create<SensAIState>((set, get) => ({
    // Initial state
    isInitialized: false,
    loading: false,
    error: null,
    velocityMetrics: null,
    currentSprintHealth: null,
    todayStandup: null,
    recentStandups: [],
    activeInterventions: [],
    interventionHistory: [],
    upcomingCeremonies: [],
    pastCeremonies: [],
    lifeWheelMetrics: null,
    coachMessages: [],
    unreadMessageCount: 0,
    settings: null,
    analytics: null,

    // Initialize SensAI for user
    initialize: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            // Fetch all initial data in parallel (with individual error handling)
            const [velocity, standup, interventions, lifeWheel, settings] = await Promise.all([
                sensaiApi.getVelocityMetrics().catch(() => null),
                sensaiApi.getTodayStandup().catch(() => ({ standup: null, sprintHealth: null })),
                sensaiApi.getActiveInterventions().catch(() => []),
                sensaiApi.getLifeWheelMetrics().catch(() => null),
                sensaiApi.getSettings().catch(() => null),
            ]);

            set({
                velocityMetrics: velocity,
                todayStandup: standup?.standup || null,
                currentSprintHealth: standup?.sprintHealth || null,
                activeInterventions: interventions || [],
                lifeWheelMetrics: lifeWheel,
                settings: settings,
                isInitialized: true,
                loading: false,
            });

            // Generate initial coach message
            get().generateWelcomeMessage();
        } catch (error) {
            set({ error: 'Failed to initialize SensAI', loading: false });
        }
    },

    refreshData: async () => {
        const state = get();
        if (!state.isInitialized) return;
        
        set({ loading: true, error: null });
        try {
            await Promise.all([
                state.calculateVelocity(),
                state.getTodayStandup(),
                state.fetchActiveInterventions(),
                state.fetchLifeWheelMetrics(),
            ]);
            set({ loading: false });
        } catch (error) {
            set({ error: 'Failed to refresh data', loading: false });
        }
    },

    // Velocity Actions
    calculateVelocity: async () => {
        try {
            const velocity = await sensaiApi.getVelocityMetrics();
            set({ velocityMetrics: velocity });
        } catch (error) {
            logger.error('Failed to calculate velocity:', error);
        }
    },

    getSprintHealth: async (sprintId: string) => {
        try {
            const health = await sensaiApi.getSprintHealth(sprintId);
            set({ currentSprintHealth: health });
            return health;
        } catch (error) {
            logger.error('Failed to get sprint health:', error);
            throw error;
        }
    },

    // Standup Actions
    getTodayStandup: async () => {
        try {
            const response = await sensaiApi.getTodayStandup();
            set({ 
                todayStandup: response.standup,
                currentSprintHealth: response.sprintHealth,
            });
            return response.standup;
        } catch (error) {
            logger.error('Failed to get today standup:', error);
            return null;
        }
    },

    completeStandup: async (blockers: string[], notes?: string, mood?: string) => {
        set({ loading: true, error: null });
        try {
            const standup = await sensaiApi.completeStandup({
                blockers,
                notes,
                mood: mood as any,
            });
            set({ 
                todayStandup: standup,
                loading: false,
            });
            
            // Add celebration message
            get().addCoachMessage({
                id: `standup-complete-${Date.now()}`,
                type: 'celebration',
                tone: 'celebratory',
                message: 'Daily standup complete! You\'re staying connected with your goals.',
                timestamp: new Date().toISOString(),
                read: false,
            });
        } catch (error) {
            set({ error: 'Failed to complete standup', loading: false });
        }
    },

    skipStandup: async (reason?: string) => {
        try {
            await sensaiApi.skipStandup(reason);
            const standup = get().todayStandup;
            if (standup) {
                set({ todayStandup: { ...standup, status: 'skipped' } });
            }
        } catch (error) {
            logger.error('Failed to skip standup:', error);
        }
    },

    convertBlockerToTask: async (blockerId: string) => {
        try {
            await sensaiApi.convertBlockerToTask(blockerId);
            const standup = get().todayStandup;
            if (standup) {
                const updatedBlockers = standup.blockers.map(b => 
                    b.id === blockerId ? { ...b, convertedToTask: true } : b
                );
                set({ todayStandup: { ...standup, blockers: updatedBlockers } });
            }
        } catch (error) {
            logger.error('Failed to convert blocker to task:', error);
        }
    },

    // Intervention Actions
    fetchActiveInterventions: async () => {
        try {
            const interventions = await sensaiApi.getActiveInterventions();
            set({ activeInterventions: interventions });
        } catch (error) {
            logger.error('Failed to fetch interventions:', error);
        }
    },

    acknowledgeIntervention: async (interventionId: string, action: 'acknowledge' | 'override' | 'defer', reason?: string) => {
        set({ loading: true, error: null });
        try {
            await sensaiApi.acknowledgeIntervention({
                interventionId,
                action,
                overrideReason: reason,
            });
            
            set(state => ({
                activeInterventions: state.activeInterventions.map(i => 
                    i.id === interventionId 
                        ? { ...i, acknowledged: true, acknowledgedAt: new Date().toISOString(), overridden: action === 'override', overrideReason: reason }
                        : i
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to acknowledge intervention', loading: false });
        }
    },

    dismissIntervention: async (interventionId: string) => {
        set(state => ({
            activeInterventions: state.activeInterventions.filter(i => i.id !== interventionId),
        }));
    },

    // Ceremony Actions
    startCeremony: async (type: 'planning' | 'review' | 'retrospective') => {
        try {
            const ceremony = await sensaiApi.startCeremony(type);
            set(state => ({
                upcomingCeremonies: [...state.upcomingCeremonies, ceremony],
            }));
        } catch (error) {
            logger.error(`Failed to start ${type} ceremony:`, error);
        }
    },

    startSprintPlanning: async () => {
        try {
            const ceremony = await sensaiApi.startCeremony('planning');
            set(state => ({
                upcomingCeremonies: [...state.upcomingCeremonies, ceremony],
            }));
        } catch (error) {
            logger.error('Failed to start sprint planning:', error);
        }
    },

    completeSprintPlanning: async (selectedTaskIds: string[], notes?: string) => {
        set({ loading: true, error: null });
        try {
            await sensaiApi.completeSprintPlanning({
                selectedTaskIds,
                notes,
            });
            
            // Refresh velocity and health after planning
            await get().calculateVelocity();
            
            set({ loading: false });
            
            get().addCoachMessage({
                id: `planning-complete-${Date.now()}`,
                type: 'celebration',
                tone: 'encouraging',
                title: 'Sprint Planned!',
                message: `Sprint committed. ${selectedTaskIds.length} tasks queued. Let's ship it.`,
                timestamp: new Date().toISOString(),
                read: false,
            });
        } catch (error) {
            set({ error: 'Failed to complete sprint planning', loading: false });
        }
    },

    startSprintReview: async () => {
        try {
            const ceremony = await sensaiApi.startCeremony('review');
            set(state => ({
                upcomingCeremonies: [...state.upcomingCeremonies, ceremony],
            }));
        } catch (error) {
            logger.error('Failed to start sprint review:', error);
        }
    },

    completeSprintReview: async (notes?: string) => {
        set({ loading: true, error: null });
        try {
            await sensaiApi.completeSprintReview(notes);
            await get().calculateVelocity();
            set({ loading: false });
        } catch (error) {
            set({ error: 'Failed to complete sprint review', loading: false });
        }
    },

    startRetrospective: async () => {
        try {
            const ceremony = await sensaiApi.startCeremony('retrospective');
            set(state => ({
                upcomingCeremonies: [...state.upcomingCeremonies, ceremony],
            }));
        } catch (error) {
            logger.error('Failed to start retrospective:', error);
        }
    },

    completeRetrospective: async (whatWorked: string[], whatBlocked: string[], learnings: string[]) => {
        set({ loading: true, error: null });
        try {
            await sensaiApi.completeRetrospective({
                whatWorked,
                whatBlocked,
                keyLearnings: learnings,
            });
            set({ loading: false });
        } catch (error) {
            set({ error: 'Failed to complete retrospective', loading: false });
        }
    },

    // Life Wheel Actions
    fetchLifeWheelMetrics: async () => {
        try {
            const metrics = await sensaiApi.getLifeWheelMetrics();
            set({ lifeWheelMetrics: metrics });
        } catch (error) {
            logger.error('Failed to fetch life wheel metrics:', error);
        }
    },

    addRecoveryTask: async (task: RecoveryTask) => {
        try {
            await sensaiApi.addRecoveryTask(task);
            get().addCoachMessage({
                id: `recovery-task-${Date.now()}`,
                type: 'tip',
                tone: 'encouraging',
                message: `Great choice! "${task.title}" added to restore balance in ${LIFE_WHEEL_DIMENSIONS.find(d => d.id === task.dimension)?.name}.`,
                timestamp: new Date().toISOString(),
                read: false,
            });
        } catch (error) {
            logger.error('Failed to add recovery task:', error);
        }
    },

    // Intake Actions
    processIntake: async (type: string, content: string, metadata?: Record<string, any>) => {
        set({ loading: true, error: null });
        try {
            const result = await sensaiApi.processIntake({
                type: type as any,
                content,
                metadata,
            });
            set({ loading: false });
            return result;
        } catch (error) {
            set({ error: 'Failed to process intake', loading: false });
            throw error;
        }
    },

    // Message Actions
    fetchCoachMessages: async () => {
        try {
            const messages = await sensaiApi.getCoachMessages();
            set({ 
                coachMessages: messages,
                unreadMessageCount: messages.filter(m => !m.read).length,
            });
        } catch (error) {
            logger.error('Failed to fetch coach messages:', error);
        }
    },

    markMessageRead: (messageId: string) => {
        set(state => ({
            coachMessages: state.coachMessages.map(m => 
                m.id === messageId ? { ...m, read: true } : m
            ),
            unreadMessageCount: Math.max(0, state.unreadMessageCount - 1),
        }));
    },

    markAllMessagesRead: () => {
        set(state => ({
            coachMessages: state.coachMessages.map(m => ({ ...m, read: true })),
            unreadMessageCount: 0,
        }));
    },

    addCoachMessage: (message: CoachMessage) => {
        set(state => ({
            coachMessages: [message, ...state.coachMessages],
            unreadMessageCount: state.unreadMessageCount + 1,
        }));
    },

    generateWelcomeMessage: () => {
        const { settings, velocityMetrics, activeInterventions } = get();
        const hour = new Date().getHours();
        
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        if (hour >= 17) greeting = 'Good evening';
        
        const interventionCount = activeInterventions.filter(i => !i.acknowledged).length;
        let messageText = `${greeting}! Ready to tackle today's goals?`;
        
        if (interventionCount > 0) {
            messageText = `${greeting}! You have ${interventionCount} item${interventionCount > 1 ? 's' : ''} that need${interventionCount === 1 ? 's' : ''} your attention.`;
        } else if (velocityMetrics && velocityMetrics.velocityTrend === 'up') {
            messageText = `${greeting}! Your velocity is trending up. Keep the momentum going!`;
        }

        get().addCoachMessage({
            id: `welcome-${Date.now()}`,
            type: 'greeting',
            tone: settings?.preferredTone || 'encouraging',
            message: messageText,
            timestamp: new Date().toISOString(),
            read: false,
        });
    },

    // Settings Actions
    fetchSettings: async () => {
        try {
            const settings = await sensaiApi.getSettings();
            set({ settings });
        } catch (error) {
            logger.error('Failed to fetch settings:', error);
        }
    },

    updateSettings: async (newSettings: Partial<SensAISettings>) => {
        set({ loading: true, error: null });
        try {
            const updated = await sensaiApi.updateSettings(newSettings);
            set({ settings: updated, loading: false });
        } catch (error) {
            set({ error: 'Failed to update settings', loading: false });
        }
    },

    // Analytics Actions
    fetchAnalytics: async (period: 'week' | 'month' | 'quarter' | 'year') => {
        try {
            const analytics = await sensaiApi.getAnalytics(period);
            set({ analytics });
        } catch (error) {
            logger.error('Failed to fetch analytics:', error);
        }
    },

    // Utility Functions
    getInterventionsByType: (type: InterventionType) => {
        return get().activeInterventions.filter(i => i.type === type);
    },

    getNeglectedDimensions: () => {
        const metrics = get().lifeWheelMetrics;
        if (!metrics) return [];
        return metrics.neglectedDimensions;
    },

    isOvercommitted: (plannedPoints: number) => {
        const velocity = get().velocityMetrics;
        if (!velocity) return false;
        const buffer = get().settings?.overcommitBuffer || 1.2;
        return plannedPoints > velocity.currentVelocity * buffer;
    },

    calculateOvercommitPercentage: (plannedPoints: number) => {
        const velocity = get().velocityMetrics;
        if (!velocity || velocity.currentVelocity === 0) return 0;
        return Math.round(((plannedPoints - velocity.currentVelocity) / velocity.currentVelocity) * 100);
    },

    clearError: () => set({ error: null }),
}));

// Helper function to add coach messages (internal use)
function addCoachMessage(this: any, message: CoachMessage) {
    const state = useSensAIStore.getState();
    useSensAIStore.setState({
        coachMessages: [message, ...state.coachMessages],
        unreadMessageCount: state.unreadMessageCount + 1,
    });
}

// Add to prototype for internal use
(useSensAIStore.getState() as any).addCoachMessage = function(message: CoachMessage) {
    useSensAIStore.setState(state => ({
        coachMessages: [message, ...state.coachMessages],
        unreadMessageCount: state.unreadMessageCount + 1,
    }));
};

(useSensAIStore.getState() as any).generateWelcomeMessage = function() {
    const state = useSensAIStore.getState();
    const velocity = state.velocityMetrics;
    const health = state.currentSprintHealth;
    
    let message = "Good to see you. Ready to make progress.";
    let title = "Welcome back";
    
    if (health) {
        if (health.healthStatus === 'ahead') {
            message = `Ahead of schedule. ${health.completionPercentage}% complete on day ${health.dayOfSprint}. Keep the momentum.`;
            title = "Strong Sprint";
        } else if (health.healthStatus === 'at_risk') {
            message = `Sprint needs attention. ${health.completionPercentage}% complete, should be at ${health.expectedPercentage}%. Let's focus.`;
            title = "Sprint Check-in";
        } else if (health.healthStatus === 'behind') {
            message = `Behind schedule. ${health.remainingPoints} points remaining. Time to prioritize what matters most.`;
            title = "Sprint Alert";
        }
    }
    
    (useSensAIStore.getState() as any).addCoachMessage({
        id: `welcome-${Date.now()}`,
        type: 'greeting',
        tone: health?.healthStatus === 'behind' ? 'direct' : 'encouraging',
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
    });
};
