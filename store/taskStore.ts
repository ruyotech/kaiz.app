import { create } from 'zustand';
import { Task } from '../types/models';
import { mockApi } from '../services/mockApi';

interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;

    fetchTasks: (filters?: any) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    addTask: (task: Partial<Task>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

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

    addTask: (task) => {
        const newTask = {
            id: `task-${Date.now()}`,
            userId: 'user-1',
            isDraft: false,
            status: 'todo',
            createdAt: new Date().toISOString(),
            completedAt: null,
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

    clearTasks: () => {
        set({ tasks: [] });
    },
}));
