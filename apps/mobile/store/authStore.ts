import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { authApi, ApiError, setOnAuthExpired, resetAuthExpirationFlag } from '../services/api';
import { router } from 'expo-router';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
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
            isAuthenticated: false,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    console.log('🔐 Logging in...');
                    const { user } = await authApi.login(email, password);
                    // Reset auth expiration flag on successful login
                    resetAuthExpirationFlag();
                    set({ user, loading: false, isAuthenticated: true });
                } catch (error) {
                    const message = error instanceof ApiError 
                        ? error.message 
                        : 'Login failed. Please try again.';
                    set({ error: message, loading: false });
                    throw error;
                }
            },

            register: async (email, password, fullName, timezone) => {
                set({ loading: true, error: null });
                try {
                    console.log('📝 Registering...');
                    const { user } = await authApi.register({
                        email,
                        password,
                        fullName,
                        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    });
                    // Reset auth expiration flag on successful registration
                    resetAuthExpirationFlag();
                    set({ user, loading: false, isAuthenticated: true });
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
                    console.log('🚪 Logging out...');
                    await authApi.logout();
                } catch (error) {
                    console.warn('Logout API call failed:', error);
                }
                set({ user: null, isAuthenticated: false });
            },

            fetchCurrentUser: async () => {
                set({ loading: true, error: null });
                try {
                    console.log('👤 Fetching current user...');
                    const user = await authApi.getCurrentUser();
                    set({ user, loading: false, isAuthenticated: true });
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
                    console.log('🔑 Requesting password reset...');
                    await authApi.forgotPassword(email);
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
                    console.log('✉️ Verifying email...');
                    await authApi.verifyEmail(code);
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
                    console.log('📧 Sending verification code...');
                    const message = await authApi.sendVerificationCode();
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
                set({ user: null, loading: false, error: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ 
                user: state.user, 
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Register callback to handle token expiration from API layer
setOnAuthExpired(() => {
    console.log('🔐 Auth expired, logging out and redirecting to login...');
    useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false, 
        error: 'Session expired. Please log in again.' 
    });
    
    // Navigate to login page using direct router import
    // Using setTimeout to ensure state is updated before navigation
    setTimeout(() => {
        try {
            router.replace('/(auth)/login');
            console.log('✅ Redirected to login page');
        } catch (err) {
            console.warn('Failed to navigate to login:', err);
            // Fallback: try again with a longer delay
            setTimeout(() => {
                try {
                    router.replace('/(auth)/login');
                } catch (e) {
                    console.error('Failed to redirect to login after retry:', e);
                }
            }, 500);
        }
    }, 100);
});
