import { create } from 'zustand';
import { Task, TaskHistory } from '../types/models';
import { mockApi } from '../services/mockApi';

export interface TaskHistoryEntry {
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
    details: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    taskHistory: Record<string, TaskHistoryEntry[]>; // taskId -> history entries

    fetchTasks: (filters?: any) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    getTasksByEpicId: (epicId: string) => Task[];
    addTask: (task: Partial<Task>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    assignToEpic: (taskId: string, epicId: string | null) => void;
    clearTasks: () => void;
    addTaskHistory: (taskId: string, entry: Omit<TaskHistoryEntry, 'id' | 'timestamp'>) => void;
    getTaskHistory: (taskId: string) => TaskHistoryEntry[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    error: null,
    taskHistory: {},

    fetchTasks: async (filters) => {
        set({ loading: true, error: null });
        try {
            const tasks = await mockApi.getTasks(filters);
            set({ tasks, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch tasks', loading: false });
        }
    },

    getTaskById: (id) => {
        return get().tasks.find(t => t.id === id);
    },

    getTasksByEpicId: (epicId) => {
        return get().tasks.filter(t => t.epicId === epicId);
    },

    addTask: (task) => {
        const newTask = {
            id: `task-${Date.now()}`,
            userId: 'user-1',
            isDraft: false,
            status: 'todo',
            createdAt: new Date().toISOString(),
            completedAt: null,
            epicId: null,
            ...task,
        } as Task;

        set(state => ({ tasks: [...state.tasks, newTask] }));
    },

    updateTask: (id, updates) => {
        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));
    },

    deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    },

    assignToEpic: (taskId, epicId) => {
        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === taskId ? { ...t, epicId } : t
            ),
        }));
    },

    clearTasks: () => {
        set({ tasks: [] });
    },

    addTaskHistory: (taskId, entry) => {
        const newEntry: TaskHistoryEntry = {
            ...entry,
            id: `history-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
        };
        
        set(state => ({
            taskHistory: {
                ...state.taskHistory,
                [taskId]: [newEntry, ...(state.taskHistory[taskId] || [])],
            },
        }));
    },

    getTaskHistory: (taskId) => {
        return get().taskHistory[taskId] || [];
    },
}));
