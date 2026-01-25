import { create } from 'zustand';
import { Challenge, ChallengeParticipant, ChallengeEntry, ChallengeTemplate, ChallengeAnalytics } from '../types/models';
import { mockApi } from '../services/mockApi';

interface ChallengeState {
    challenges: Challenge[];
    templates: ChallengeTemplate[];
    participants: ChallengeParticipant[];
    entries: ChallengeEntry[];
    loading: boolean;
    error: string | null;

    // Fetch operations
    fetchChallenges: (userId?: string, status?: string) => Promise<void>;
    fetchTemplates: (lifeWheelAreaId?: string) => Promise<void>;
    fetchChallengeDetail: (challengeId: string) => Promise<void>;
    
    // CRUD operations
    createChallenge: (challenge: Partial<Challenge>) => Promise<Challenge>;
    createChallengeFromTemplate: (templateId: string, overrides?: Partial<Challenge>) => Promise<Challenge>;
    updateChallenge: (challengeId: string, updates: Partial<Challenge>) => Promise<void>;
    deleteChallenge: (challengeId: string) => Promise<void>;
    
    // Progress tracking
    logEntry: (challengeId: string, value: number | boolean, note?: string) => Promise<void>;
    calculateStreak: (challengeId: string) => number;
    getAnalytics: (challengeId: string) => ChallengeAnalytics;
    
    // Social features
    addReaction: (entryId: string, userId: string, type: 'thumbsup' | 'fire' | 'muscle' | 'celebrate') => void;
    inviteAccountabilityPartner: (challengeId: string, userId: string) => Promise<void>;
    
    // Utility
    pauseChallenge: (challengeId: string) => Promise<void>;
    resumeChallenge: (challengeId: string) => Promise<void>;
    completeChallenge: (challengeId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    templates: [],
    participants: [],
    entries: [],
    loading: false,
    error: null,

    fetchChallenges: async (userId, status) => {
        set({ loading: true, error: null });
        try {
            const challenges = await mockApi.getChallenges(userId, status);
            set({ challenges, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch challenges', loading: false });
        }
    },

    fetchTemplates: async (lifeWheelAreaId) => {
        set({ loading: true, error: null });
        try {
            const templates = await mockApi.getChallengeTemplates(lifeWheelAreaId);
            set({ templates, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch templates', loading: false });
        }
    },

    fetchChallengeDetail: async (challengeId) => {
        set({ loading: true, error: null });
        try {
            const challengeData = await mockApi.getChallengeById(challengeId);
            const entries = await mockApi.getChallengeEntries(challengeId) as ChallengeEntry[];

            set({
                participants: (challengeData.participants || []) as ChallengeParticipant[],
                entries,
                loading: false,
            });
        } catch (error) {
            set({ error: 'Failed to fetch challenge details', loading: false });
        }
    },

    createChallenge: async (challengeData) => {
        set({ loading: true, error: null });
        try {
            const newChallenge = await mockApi.createChallenge(challengeData);
            set(state => ({
                challenges: [...state.challenges, newChallenge],
                loading: false,
            }));
            return newChallenge;
        } catch (error) {
            set({ error: 'Failed to create challenge', loading: false });
            throw error;
        }
    },

    createChallengeFromTemplate: async (templateId, overrides = {}) => {
        set({ loading: true, error: null });
        try {
            const template = get().templates.find(t => t.id === templateId);
            if (!template) throw new Error('Template not found');

            const challengeData: Partial<Challenge> = {
                name: template.name,
                description: template.description,
                lifeWheelAreaId: template.lifeWheelAreaId,
                metricType: template.metricType,
                targetValue: template.targetValue,
                unit: template.unit,
                duration: template.suggestedDuration,
                recurrence: template.recurrence,
                ...overrides,
            };

            const newChallenge = await mockApi.createChallenge(challengeData);
            set(state => ({
                challenges: [...state.challenges, newChallenge],
                loading: false,
            }));
            return newChallenge;
        } catch (error) {
            set({ error: 'Failed to create challenge from template', loading: false });
            throw error;
        }
    },

    updateChallenge: async (challengeId, updates) => {
        set({ loading: true, error: null });
        try {
            await mockApi.updateChallenge(challengeId, updates);
            set(state => ({
                challenges: state.challenges.map(c =>
                    c.id === challengeId ? { ...c, ...updates } : c
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to update challenge', loading: false });
        }
    },

    deleteChallenge: async (challengeId) => {
        set({ loading: true, error: null });
        try {
            await mockApi.deleteChallenge(challengeId);
            set(state => ({
                challenges: state.challenges.filter(c => c.id !== challengeId),
                loading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to delete challenge', loading: false });
        }
    },

    logEntry: async (challengeId, value, note) => {
        try {
            const challenge = get().challenges.find(c => c.id === challengeId);
            if (!challenge) throw new Error('Challenge not found');

            const entry = await mockApi.logChallengeEntry({
                challengeId,
                value,
                note,
                date: new Date().toISOString().split('T')[0],
            });

            set(state => ({
                entries: [...state.entries, entry],
            }));

            // Recalculate streak
            const newStreak = get().calculateStreak(challengeId);
            await get().updateChallenge(challengeId, {
                currentStreak: newStreak,
                bestStreak: Math.max(challenge.bestStreak, newStreak),
                totalCompletions: challenge.totalCompletions + 1,
            });
        } catch (error) {
            set({ error: 'Failed to log entry' });
        }
    },

    calculateStreak: (challengeId) => {
        const entries = get().entries
            .filter(e => e.challengeId === challengeId)
            .sort((a, b) => new Date(b.date || b.entryDate || '').getTime() - new Date(a.date || a.entryDate || '').getTime());

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const entry of entries) {
            const entryDate = new Date(entry.date || entry.entryDate || '');
            entryDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                if (entry.value ?? entry.entryValue) {
                    streak++;
                } else {
                    break;
                }
            } else if (daysDiff > streak) {
                break;
            }
        }

        return streak;
    },

    getAnalytics: (challengeId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        const entries = get().entries.filter(e => e.challengeId === challengeId);

        if (!challenge || entries.length === 0) {
            return {
                challengeId,
                completionRate: 0,
                totalImpact: 0,
                consistencyScore: 0,
            };
        }

        const completedEntries = entries.filter(e => e.value === true || (typeof e.value === 'number' && e.value > 0));
        const completionRate = (completedEntries.length / entries.length) * 100;

        const numericEntries = entries.filter(e => typeof e.value === 'number');
        const averageValue = numericEntries.length > 0
            ? numericEntries.reduce((sum, e) => sum + (e.value as number), 0) / numericEntries.length
            : undefined;

        // Find best and worst days
        const entriesByValue = [...numericEntries].sort((a, b) => (b.value as number) - (a.value as number));
        const bestDay = entriesByValue[0]?.date;
        const worstDay = entriesByValue[entriesByValue.length - 1]?.date;

        return {
            challengeId,
            completionRate,
            averageValue,
            bestDay,
            worstDay,
            totalImpact: challenge.totalCompletions * (challenge.pointValue || 1),
            consistencyScore: Math.min(100, (challenge.currentStreak / challenge.duration) * 100),
        };
    },

    addReaction: (entryId, userId, type) => {
        set(state => ({
            entries: state.entries.map(entry => {
                if (entry.id === entryId) {
                    const existingReaction = entry.reactions.find(r => r.userId === userId);
                    if (existingReaction) {
                        return {
                            ...entry,
                            reactions: entry.reactions.map(r =>
                                r.userId === userId ? { ...r, type } : r
                            ),
                        };
                    } else {
                        return {
                            ...entry,
                            reactions: [...entry.reactions, { userId, type }],
                        };
                    }
                }
                return entry;
            }),
        }));
    },

    inviteAccountabilityPartner: async (challengeId, userId) => {
        try {
            await mockApi.inviteAccountabilityPartner(challengeId, userId);
            // Refresh challenge data
            await get().fetchChallengeDetail(challengeId);
        } catch (error) {
            set({ error: 'Failed to invite partner' });
        }
    },

    pauseChallenge: async (challengeId) => {
        await get().updateChallenge(challengeId, { status: 'paused' });
    },

    resumeChallenge: async (challengeId) => {
        await get().updateChallenge(challengeId, { status: 'active' });
    },

    completeChallenge: async (challengeId) => {
        await get().updateChallenge(challengeId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
        });
    },

    addEntry: (challengeId: string, entryValue: number) => {
        const newEntry: ChallengeEntry = {
            id: `entry-${Date.now()}`,
            challengeId,
            userId: 'user-1',
            value: entryValue,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            reactions: [],
        };

        set(state => ({ entries: [...state.entries, newEntry] }));

        // Also update participant progress
        set(state => ({
            participants: state.participants.map(p =>
                p.userId === 'user-1' && p.challengeId === challengeId
                    ? { ...p, currentProgress: p.currentProgress + entryValue, lastUpdated: new Date().toISOString() }
                    : p
            ),
        }));
    },
}));
