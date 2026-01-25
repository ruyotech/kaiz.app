import { create } from 'zustand';
import { Epic } from '../types/models';
import { mockApi } from '../services/mockApi';

interface EpicState {
    epics: Epic[];
    loading: boolean;
    error: string | null;

    fetchEpics: () => Promise<void>;
    getEpicById: (id: string) => Epic | undefined;
    addEpic: (epic: Partial<Epic>) => void;
    updateEpic: (id: string, updates: Partial<Epic>) => void;
    deleteEpic: (id: string) => void;
    addTaskToEpic: (epicId: string, taskId: string) => void;
    removeTaskFromEpic: (epicId: string, taskId: string) => void;
    clearEpics: () => void;
}

export const useEpicStore = create<EpicState>((set, get) => ({
    epics: [],
    loading: false,
    error: null,

    fetchEpics: async () => {
        set({ loading: true, error: null });
        try {
            const epics = await mockApi.getEpics() as Epic[];
            set({ epics, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch epics', loading: false });
        }
    },

    getEpicById: (id) => {
        return get().epics.find(e => e.id === id);
    },

    addEpic: (epic) => {
        const newEpic = {
            id: `epic-${Date.now()}`,
            userId: 'user-1',
            status: 'planning',
            totalPoints: 0,
            completedPoints: 0,
            color: '#3B82F6',
            icon: 'rocket-launch',
            taskIds: [],
            createdAt: new Date().toISOString(),
            ...epic,
        } as Epic;

        set(state => ({ epics: [...state.epics, newEpic] }));
    },

    updateEpic: (id, updates) => {
        set(state => ({
            epics: state.epics.map(e =>
                e.id === id ? { ...e, ...updates } : e
            ),
        }));
    },

    deleteEpic: (id) => {
        set(state => ({ epics: state.epics.filter(e => e.id !== id) }));
    },

    addTaskToEpic: (epicId, taskId) => {
        set(state => ({
            epics: state.epics.map(e => {
                if (e.id === epicId) {
                    const taskIds = e.taskIds || [];
                    if (!taskIds.includes(taskId)) {
                        return { ...e, taskIds: [...taskIds, taskId] };
                    }
                }
                return e;
            }),
        }));
    },

    removeTaskFromEpic: (epicId, taskId) => {
        set(state => ({
            epics: state.epics.map(e => {
                if (e.id === epicId) {
                    const taskIds = e.taskIds || [];
                    return { ...e, taskIds: taskIds.filter(id => id !== taskId) };
                }
                return e;
            }),
        }));
    },

    clearEpics: () => {
        set({ epics: [] });
    },
}));
