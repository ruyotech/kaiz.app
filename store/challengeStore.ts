import { create } from 'zustand';
import { Challenge, ChallengeParticipant, ChallengeEntry } from '../types/models';
import { mockApi } from '../services/mockApi';

interface ChallengeState {
    challenges: Challenge[];
    participants: ChallengeParticipant[];
    entries: ChallengeEntry[];
    loading: boolean;
    error: string | null;

    fetchChallenges: (userId?: string) => Promise<void>;
    fetchChallengeDetail: (challengeId: string) => Promise<void>;
    addEntry: (challengeId: string, entryValue: number) => void;
    addReaction: (entryId: string, userId: string, type: 'thumbsup' | 'fire' | 'muscle') => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    participants: [],
    entries: [],
    loading: false,
    error: null,

    fetchChallenges: async (userId) => {
        set({ loading: true, error: null });
        try {
            const challenges = await mockApi.getChallenges(userId);
            set({ challenges, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch challenges', loading: false });
        }
    },

    fetchChallengeDetail: async (challengeId) => {
        set({ loading: true, error: null });
        try {
            const challengeData = await mockApi.getChallengeById(challengeId);
            const entries = await mockApi.getChallengeEntries(challengeId);

            set({
                participants: challengeData.participants || [],
                entries,
                loading: false,
            });
        } catch (error) {
            set({ error: 'Failed to fetch challenge details', loading: false });
        }
    },

    addEntry: (challengeId, entryValue) => {
        const newEntry: ChallengeEntry = {
            id: `entry-${Date.now()}`,
            challengeId,
            userId: 'user-1',
            entryValue,
            entryDate: new Date().toISOString().split('T')[0],
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

    addReaction: (entryId, userId, type) => {
        set(state => ({
            entries: state.entries.map(e =>
                e.id === entryId
                    ? {
                        ...e,
                        reactions: [...e.reactions, { userId, type }],
                    }
                    : e
            ),
        }));
    },
}));
