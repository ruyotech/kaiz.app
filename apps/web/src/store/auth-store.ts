'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, authApi, clearTokens, getAccessToken, setOnAuthExpired } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Set up auth expiration handler
      if (typeof window !== 'undefined') {
        setOnAuthExpired(() => {
          set({ user: null, isAuthenticated: false, isAdmin: false });
          window.location.href = '/login';
        });
      }

      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,  // Start as false, set to true only during operations
        isAdmin: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const response = await authApi.login(email, password);
            const isAdmin = response.user.role === 'ADMIN';
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isAdmin,
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        register: async (data) => {
          set({ isLoading: true });
          try {
            const response = await authApi.register(data);
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isAdmin: false,
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authApi.logout();
          } finally {
            set({ 
              user: null, 
              isAuthenticated: false,
              isAdmin: false,
              isLoading: false 
            });
          }
        },

        checkAuth: async () => {
          const token = getAccessToken();
          if (!token) {
            set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
            return;
          }

          set({ isLoading: true });
          try {
            const user = await authApi.getCurrentUser();
            const isAdmin = user.role === 'ADMIN';
            set({ user, isAuthenticated: true, isAdmin, isLoading: false });
          } catch {
            clearTokens();
            set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
          }
        },

        setUser: (user) => {
          const isAdmin = user?.role === 'ADMIN' || false;
          set({ user, isAuthenticated: !!user, isAdmin });
        },
      };
    },
    {
      name: 'kaiz-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
