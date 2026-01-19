import { create } from 'zustand';

interface AppState {
    isOnboarded: boolean;
    theme: 'light' | 'dark' | 'auto';

    setOnboarded: (value: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useAppStore = create<AppState>((set) => ({
    isOnboarded: false,
    theme: 'auto',

    setOnboarded: (value) => {
        set({ isOnboarded: value });
    },

    setTheme: (theme) => {
        set({ theme });
    },
}));
