import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { authApi, ApiError } from '../services/api';
import { getAccessToken } from '../services/apiClient';
import { logger } from '../utils/logger';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  sendVerificationCode: () => Promise<string>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          logger.auth('Logging in…');
          const { user } = await authApi.login(email, password);
          set({ user, loading: false, isAuthenticated: true });
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Login failed. Please try again.';
          set({ error: message, loading: false });
          throw error;
        }
      },

      register: async (email, password, fullName, timezone) => {
        set({ loading: true, error: null });
        try {
          logger.auth('Registering…');
          const { user } = await authApi.register({
            email,
            password,
            fullName,
            timezone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          set({ user, loading: false, isAuthenticated: true });
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Registration failed. Please try again.';
          set({ error: message, loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          logger.auth('Logging out…');
          await authApi.logout();
        } catch (error) {
          logger.warn('Logout API call failed', error);
        }
        set({ user: null, isAuthenticated: false });
      },

      fetchCurrentUser: async () => {
        set({ loading: true, error: null });
        try {
          logger.auth('Fetching current user…');
          const user = await authApi.getCurrentUser();
          set({ user, loading: false, isAuthenticated: true });
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Failed to fetch user';
          set({ error: message, loading: false, isAuthenticated: false });
        }
      },

      /**
       * Validate the session on app launch.
       * If token exists in SecureStore → call /auth/me to confirm validity.
       * If valid → update user state. If invalid → clear everything.
       */
      validateSession: async () => {
        try {
          const token = await getAccessToken();
          if (!token) {
            set({ user: null, isAuthenticated: false });
            return false;
          }
          logger.auth('Validating session on launch…');
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
          return true;
        } catch {
          await authApi.clearTokens();
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          logger.auth('Requesting password reset…');
          await authApi.forgotPassword(email);
          set({ loading: false });
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Password reset failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      verifyEmail: async (code) => {
        set({ loading: true, error: null });
        try {
          logger.auth('Verifying email…');
          await authApi.verifyEmail(code);
          set({ loading: false });
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Email verification failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      sendVerificationCode: async () => {
        set({ loading: true, error: null });
        try {
          logger.auth('Sending verification code…');
          const message = await authApi.sendVerificationCode();
          set({ loading: false });
          return message;
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Failed to send verification code';
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
      // Only persist user profile (NOT tokens — those live in SecureStore)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
