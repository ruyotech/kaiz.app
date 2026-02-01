import { create } from 'zustand';
import { Task } from '../types/models';
import { taskApi } from '../services/api';
import { ViewScope } from '../types/family.types';

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
    taskHistory: Record<string, TaskHistoryEntry[]>;
    
    // Family view scope
    currentViewScope: ViewScope;
    setViewScope: (scope: ViewScope) => void;

    fetchTasks: (filters?: any) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    getTasksByEpicId: (epicId: string) => Task[];
    getFilteredTasks: () => Task[];
    addTask: (task: Partial<Task>) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
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
    currentViewScope: 'mine',

    setViewScope: (scope) => {
        set({ currentViewScope: scope });
    },

    /**
     * Get tasks filtered by current view scope.
     * - 'mine': Only personal tasks (no familyId or user's own tasks)
     * - 'family': All family visible tasks (shared + assigned to user)
     * - 'child:{id}': All tasks for a specific child (parent view)
     */
    getFilteredTasks: () => {
        const { tasks, currentViewScope } = get();
        
        if (currentViewScope === 'mine') {
            // Personal view: show tasks without family assignment or private to user
            return tasks.filter(task => 
                !task.familyId || 
                task.visibility === 'private'
            );
        }
        
        if (currentViewScope === 'family') {
            // Family view: show shared and assigned tasks
            return tasks.filter(task =>
                task.familyId && (
                    task.visibility === 'shared' ||
                    task.visibility === 'assigned'
                )
            );
        }
        
        if (currentViewScope.startsWith('child:')) {
            const childUserId = currentViewScope.replace('child:', '');
            // Parent viewing child: show all of child's tasks
            return tasks.filter(task =>
                task.userId === childUserId ||
                task.assignedToUserId === childUserId
            );
        }
        
        return tasks;
    },

    fetchTasks: async (filters) => {
        set({ loading: true, error: null });
        try {
            let tasks: Task[];
            if (filters?.backlog) {
                tasks = await taskApi.getBacklogTasks() as Task[];
            } else if (filters?.sprintId) {
                tasks = await taskApi.getTasksBySprint(filters.sprintId) as Task[];
            } else if (filters?.epicId) {
                tasks = await taskApi.getTasksByEpic(filters.epicId) as Task[];
            } else if (filters?.status) {
                tasks = await taskApi.getTasksByStatus(filters.status) as Task[];
            } else {
                tasks = await taskApi.getAll(filters) as Task[];
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
        set({ loading: true, error: null });
        try {
            const newTask = await taskApi.createTask(task) as Task;
            set(state => ({ tasks: [...state.tasks, newTask], loading: false }));
            return newTask;
        } catch (error) {
            set({ error: 'Failed to create task', loading: false });
            throw error;
        }
    },

    updateTask: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updatedTask = await taskApi.updateTask(id, updates) as Task;
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
                loading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to update task', loading: false });
        }
    },

    deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
            await taskApi.deleteTask(id);
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id), loading: false }));
        } catch (error) {
            set({ error: 'Failed to delete task', loading: false });
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
