import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { authApi, ApiError } from '../services/api';
import { mockApi } from '../services/mockApi';

// Feature flag: Set to true to use real backend, false for mock data
const USE_REAL_API = true;

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isDemoUser: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    loginDemo: () => Promise<void>;
    register: (email: string, password: string, fullName: string, timezone?: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchCurrentUser: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    sendVerificationCode: () => Promise<string>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            error: null,
            isDemoUser: false,
            isAuthenticated: false,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    if (USE_REAL_API) {
                        console.log('🔐 Logging in with real API...');
                        const { user } = await authApi.login(email, password);
                        set({ user, loading: false, isDemoUser: false, isAuthenticated: true });
                    } else {
                        const user = await mockApi.login(email, password);
                        set({ user, loading: false, isDemoUser: false, isAuthenticated: true });
                    }
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Login failed. Please try again.';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            loginDemo: async () => {
                set({ loading: true, error: null });
                try {
                    // Demo mode always uses mock data
                    console.log('🎭 Logging in with demo mode...');
                    const user = await mockApi.login('john.doe@example.com', 'password123');
                    set({ 
                        user, 
                        loading: false, 
                        isDemoUser: true,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    set({ error: 'Demo login failed', loading: false });
                    throw error;
                }
            },

            register: async (email, password, fullName, timezone) => {
                set({ loading: true, error: null });
                try {
                    if (USE_REAL_API) {
                        console.log('📝 Registering with real API...');
                        const { user } = await authApi.register({
                            email,
                            password,
                            fullName,
                            timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        });
                        set({ user, loading: false, isDemoUser: false, isAuthenticated: true });
                    } else {
                        // Simulate registration
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        set({ loading: false });
                    }
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Registration failed. Please try again.';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    if (USE_REAL_API && !get().isDemoUser) {
                        console.log('🚪 Logging out from real API...');
                        await authApi.logout();
                    }
                } catch (error) {
                    console.warn('Logout API call failed:', error);
                }
                set({ user: null, isDemoUser: false, isAuthenticated: false });
            },

            fetchCurrentUser: async () => {
                set({ loading: true, error: null });
                try {
                    if (USE_REAL_API && !get().isDemoUser) {
                        console.log('👤 Fetching current user from real API...');
                        const user = await authApi.getCurrentUser();
                        set({ user, loading: false, isAuthenticated: true });
                    } else {
                        const user = await mockApi.getCurrentUser();
                        set({ user, loading: false });
                    }
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Failed to fetch user';
                    set({ error: message, loading: false, isAuthenticated: false });
                }
            },

            resetPassword: async (email) => {
                set({ loading: true, error: null });
                try {
                    if (USE_REAL_API) {
                        console.log('🔑 Requesting password reset...');
                        await authApi.forgotPassword(email);
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    set({ loading: false });
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Password reset failed';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            verifyEmail: async (code) => {
                set({ loading: true, error: null });
                try {
                    if (USE_REAL_API) {
                        console.log('✉️ Verifying email...');
                        await authApi.verifyEmail(code);
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    set({ loading: false });
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Email verification failed';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            sendVerificationCode: async () => {
                set({ loading: true, error: null });
                try {
                    let message = 'Verification code sent';
                    if (USE_REAL_API) {
                        console.log('📧 Sending verification code...');
                        message = await authApi.sendVerificationCode();
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    set({ loading: false });
                    return message;
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Failed to send verification code';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            reset: () => {
                set({ user: null, loading: false, error: null, isDemoUser: false, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ 
                user: state.user, 
                isDemoUser: state.isDemoUser,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
