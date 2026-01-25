import { create } from 'zustand';
import { Epic } from '../types/models';
import { epicApi } from '../services/api';

interface EpicState {
    epics: Epic[];
    loading: boolean;
    error: string | null;

    fetchEpics: () => Promise<void>;
    getEpicById: (id: string) => Epic | undefined;
    addEpic: (epic: Partial<Epic>) => Promise<Epic>;
    updateEpic: (id: string, updates: Partial<Epic>) => Promise<void>;
    deleteEpic: (id: string) => Promise<void>;
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
            const epics = await epicApi.getEpics() as Epic[];
            set({ epics, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch epics', loading: false });
        }
    },

    getEpicById: (id) => {
        return get().epics.find(e => e.id === id);
    },

    addEpic: async (epic) => {
        set({ loading: true, error: null });
        try {
            const newEpic = await epicApi.createEpic({
                title: epic.title || 'New Epic',
                description: epic.description,
                lifeWheelAreaId: epic.lifeWheelAreaId || 'life-health',
                targetSprintId: epic.targetSprintId,
                color: epic.color,
                icon: epic.icon,
            }) as Epic;
            set(state => ({ epics: [...state.epics, newEpic], loading: false }));
            return newEpic;
        } catch (error) {
            set({ error: 'Failed to create epic', loading: false });
            throw error;
        }
    },

    updateEpic: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updatedEpic = await epicApi.updateEpic(id, updates) as Epic;
            set(state => ({
                epics: state.epics.map(e => e.id === id ? updatedEpic : e),
                loading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to update epic', loading: false });
        }
    },

    deleteEpic: async (id) => {
        set({ loading: true, error: null });
        try {
            await epicApi.deleteEpic(id);
            set(state => ({ epics: state.epics.filter(e => e.id !== id), loading: false }));
        } catch (error) {
            set({ error: 'Failed to delete epic', loading: false });
        }
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
