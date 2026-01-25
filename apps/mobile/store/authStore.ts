import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { authApi } from '../services/api';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isDemoUser: boolean;

    login: (email: string, password: string) => Promise<void>;
    loginDemo: () => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchCurrentUser: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loading: false,
            error: null,
            isDemoUser: false,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const user = await authApi.login(email, password);
                    set({ user, loading: false, isDemoUser: false });
                } catch (error) {
                    set({ error: 'Login failed', loading: false });
                    throw error;
                }
            },

            loginDemo: async () => {
                set({ loading: true, error: null });
                try {
                    // Create demo user with default credentials
                    // IMPORTANT: This preserves all user preferences from onboarding
                    // We do NOT overwrite the user's onboarding choices
                    // The preferences (language, life wheel areas, notifications, etc.)
                    // are already saved in preferencesStore during onboarding setup
                    const user = await authApi.login('john.doe@example.com', 'password123');
                    set({
                        user,
                        loading: false,
                        isDemoUser: true
                    });

                    // No need to call loadDemoPreferences() because we want to keep
                    // what the user selected during onboarding
                } catch (error) {
                    set({ error: 'Demo login failed', loading: false });
                    throw error;
                }
            },

            register: async (email, password, fullName) => {
                set({ loading: true, error: null });
                try {
                    const user = await authApi.register(email, password, fullName);
                    set({ user, loading: false, isDemoUser: false });
                } catch (error) {
                    set({ error: 'Registration failed', loading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } finally {
                    set({ user: null, isDemoUser: false });
                }
            },

            fetchCurrentUser: async () => {
                set({ loading: true });
                try {
                    const user = await authApi.getCurrentUser();
                    set({ user, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch user', loading: false });
                }
            },

            resetPassword: async (email) => {
                set({ loading: true, error: null });
                try {
                    // Simulate password reset API call
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    set({ loading: false });
                } catch (error) {
                    set({ error: 'Password reset failed', loading: false });
                    throw error;
                }
            },

            verifyEmail: async (code) => {
                set({ loading: true, error: null });
                try {
                    // Simulate email verification API call
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    set({ loading: false });
                } catch (error) {
                    set({ error: 'Email verification failed', loading: false });
                    throw error;
                }
            },

            reset: () => {
                set({ user: null, loading: false, error: null, isDemoUser: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isDemoUser: state.isDemoUser
            }),
        }
    )
);
