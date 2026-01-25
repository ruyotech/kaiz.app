import { create } from 'zustand';
import { Task, TaskHistory } from '../types/models';
import { taskApi } from '../services/api';

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
            let tasks: Task[];
            if (filters?.backlog) {
                tasks = await taskApi.getBacklogTasks();
            } else if (filters?.sprintId) {
                tasks = await taskApi.getTasksBySprint(filters.sprintId);
            } else if (filters?.epicId) {
                tasks = await taskApi.getTasksByEpic(filters.epicId);
            } else if (filters?.status) {
                tasks = await taskApi.getTasksByStatus(filters.status);
            } else {
                const response = await taskApi.getTasks();
                tasks = response.content;
            }
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

    addTask: async (task) => {
        try {
            const newTask = await taskApi.createTask(task);
            set(state => ({ tasks: [...state.tasks, newTask] }));
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    },

    updateTask: async (id, updates) => {
        try {
            const updatedTask = await taskApi.updateTask(id, updates);
            set(state => ({
                tasks: state.tasks.map(t =>
                    t.id === id ? updatedTask : t
                ),
            }));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    },

    deleteTask: async (id) => {
        try {
            await taskApi.deleteTask(id);
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
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
