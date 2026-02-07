import { create } from 'zustand';

export type AppContext = 'sprints' | 'sensai' | 'mindset' | 'essentia' | 'bills' | 'challenges' | 'pomodoro' | 'community' | 'family' | 'settings' | 'notifications' | 'dashboard' | 'backlog' | 'epics' | 'taskSearch' | 'templates';

interface NavigationState {
    currentApp: AppContext;
    isAppSwitcherOpen: boolean;
    setCurrentApp: (app: AppContext) => void;
    toggleAppSwitcher: () => void;
    closeModals: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentApp: 'sprints',
    isAppSwitcherOpen: false,
    setCurrentApp: (app) => set({ currentApp: app }),
    toggleAppSwitcher: () => set((state) => ({ isAppSwitcherOpen: !state.isAppSwitcherOpen })),
    closeModals: () => set({ isAppSwitcherOpen: false }),
}));
