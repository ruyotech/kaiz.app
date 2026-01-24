import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
    isOnboarded: boolean;
    theme: 'light' | 'dark' | 'auto';

    setOnboarded: (value: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    reset: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            isOnboarded: false,
            theme: 'auto',

            setOnboarded: (value) => {
                set({ isOnboarded: value });
            },

            setTheme: (theme) => {
                set({ theme });
            },

            reset: () => {
                set({ isOnboarded: false, theme: 'auto' });
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
