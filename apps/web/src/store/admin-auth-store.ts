'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminUser, adminAuthApi, clearAdminTokens, getAdminAccessToken } from '@/lib/api';

interface AdminAuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAdmin: (admin: AdminUser | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,  // Start as false, set to true only during operations

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await adminAuthApi.login(email, password);
          set({ 
            admin: response.admin, 
            isAuthenticated: true,
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
          await adminAuthApi.logout();
        } finally {
          set({ 
            admin: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      checkAuth: async () => {
        const token = getAdminAccessToken();
        if (!token) {
          set({ admin: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const admin = await adminAuthApi.getCurrentAdmin();
          set({ admin, isAuthenticated: true, isLoading: false });
        } catch {
          clearAdminTokens();
          set({ admin: null, isAuthenticated: false, isLoading: false });
        }
      },

      setAdmin: (admin: AdminUser | null) => {
        set({ admin, isAuthenticated: !!admin });
      },
    }),
    {
      name: 'kaiz-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);
