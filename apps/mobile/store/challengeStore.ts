import { create } from 'zustand';
import { Challenge, ChallengeParticipant, ChallengeEntry, ChallengeTemplate, ChallengeAnalytics } from '../types/models';
import { challengeApi } from '../services/api';

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
            const challenges = await challengeApi.getChallenges(status);
            set({ challenges, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch challenges', loading: false });
        }
    },

    fetchTemplates: async (lifeWheelAreaId) => {
        set({ loading: true, error: null });
        try {
            const templates = await challengeApi.getChallengeTemplates(lifeWheelAreaId);
            set({ templates, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch templates', loading: false });
        }
    },

    fetchChallengeDetail: async (challengeId) => {
        set({ loading: true, error: null });
        try {
            const challengeData = await challengeApi.getChallengeById(challengeId);
            const entries = await challengeApi.getChallengeEntries(challengeId);

            set({
                participants: challengeData.participants || [],
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
            const newChallenge = await challengeApi.createChallenge(challengeData);
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
                createdFromTemplateId: templateId,
                ...overrides,
            };

            const newChallenge = await challengeApi.createChallenge(challengeData);
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
            const updatedChallenge = await challengeApi.updateChallenge(challengeId, updates);
            set(state => ({
                challenges: state.challenges.map(c =>
                    c.id === challengeId ? updatedChallenge : c
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
            await challengeApi.deleteChallenge(challengeId);
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

            const entryDate = new Date().toISOString().split('T')[0];
            const entryData = {
                entryDate,
                ...(typeof value === 'boolean'
                    ? { valueBoolean: value }
                    : { valueNumeric: value }),
                note,
            };

            const entry = await challengeApi.logChallengeEntry(challengeId, entryData);

            set(state => ({
                entries: [...state.entries, entry],
            }));

            // Refresh challenge to get updated streak
            const updatedChallenge = await challengeApi.getChallengeById(challengeId);
            set(state => ({
                challenges: state.challenges.map(c =>
                    c.id === challengeId ? updatedChallenge : c
                ),
            }));
        } catch (error) {
            set({ error: 'Failed to log entry' });
        }
    },

    calculateStreak: (challengeId) => {
        const entries = get().entries
            .filter(e => e.challengeId === challengeId)
            .sort((a, b) => new Date(b.date || b.entryDate).getTime() - new Date(a.date || a.entryDate).getTime());

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const entry of entries) {
            const entryDate = new Date(entry.date || entry.entryDate);
            entryDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                const entryValue = entry.value ?? entry.valueBoolean ?? entry.valueNumeric;
                if (entryValue) {
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

        const completedEntries = entries.filter(e => {
            const val = e.value ?? e.valueBoolean ?? e.valueNumeric;
            return val === true || (typeof val === 'number' && val > 0);
        });
        const completionRate = (completedEntries.length / entries.length) * 100;

        const numericEntries = entries.filter(e => typeof (e.value ?? e.valueNumeric) === 'number');
        const averageValue = numericEntries.length > 0
            ? numericEntries.reduce((sum, e) => sum + ((e.value ?? e.valueNumeric) as number), 0) / numericEntries.length
            : undefined;

        // Find best and worst days
        const entriesByValue = [...numericEntries].sort((a, b) =>
            ((b.value ?? b.valueNumeric) as number) - ((a.value ?? a.valueNumeric) as number)
        );
        const bestDay = entriesByValue[0]?.date || entriesByValue[0]?.entryDate;
        const worstDay = entriesByValue[entriesByValue.length - 1]?.date || entriesByValue[entriesByValue.length - 1]?.entryDate;

        return {
            challengeId,
            completionRate,
            averageValue,
            bestDay,
            worstDay,
            totalImpact: (challenge.totalCompletions || 0) * (challenge.pointValue || 1),
            consistencyScore: Math.min(100, (challenge.currentStreak / challenge.duration) * 100),
        };
    },

    addReaction: (entryId, userId, type) => {
        set(state => ({
            entries: state.entries.map(entry => {
                if (entry.id === entryId) {
                    const reactions = entry.reactions || [];
                    const existingReaction = reactions.find(r => r.userId === userId);
                    if (existingReaction) {
                        return {
                            ...entry,
                            reactions: reactions.map(r =>
                                r.userId === userId ? { ...r, type } : r
                            ),
                        };
                    } else {
                        return {
                            ...entry,
                            reactions: [...reactions, { userId, type }],
                        };
                    }
                }
                return entry;
            }),
        }));
    },

    inviteAccountabilityPartner: async (challengeId, userId) => {
        try {
            await challengeApi.inviteParticipant(challengeId, { userId, isAccountabilityPartner: true });
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
        });
    },
}));
