import { create } from 'zustand';
import { User } from '../types/models';
import { mockApi } from '../services/mockApi';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const user = await mockApi.login(email, password);
            set({ user, loading: false });
        } catch (error) {
            set({ error: 'Login failed', loading: false });
        }
    },

    logout: () => {
        set({ user: null });
    },

    fetchCurrentUser: async () => {
        set({ loading: true });
        try {
            const user = await mockApi.getCurrentUser();
            set({ user, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch user', loading: false });
        }
    },
}));
