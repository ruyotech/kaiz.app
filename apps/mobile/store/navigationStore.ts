import { create } from 'zustand';

export type AppContext = 'sprints' | 'mindset' | 'essentia' | 'bills' | 'challenges' | 'pomodoro' | 'community' | 'family' | 'settings' | 'notifications' | 'dashboard' | 'backlog' | 'epics' | 'taskSearch' | 'templates';

interface NavigationState {
    currentApp: AppContext;
    isAppSwitcherOpen: boolean;
    isMoreMenuOpen: boolean;
    setCurrentApp: (app: AppContext) => void;
    toggleAppSwitcher: () => void;
    toggleMoreMenu: () => void;
    closeModals: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentApp: 'sprints',
    isAppSwitcherOpen: false,
    isMoreMenuOpen: false,
    setCurrentApp: (app) => set({ currentApp: app }),
    toggleAppSwitcher: () => set((state) => ({ isAppSwitcherOpen: !state.isAppSwitcherOpen, isMoreMenuOpen: false })),
    toggleMoreMenu: () => set((state) => ({ isMoreMenuOpen: !state.isMoreMenuOpen, isAppSwitcherOpen: false })),
    closeModals: () => set({ isAppSwitcherOpen: false, isMoreMenuOpen: false }),
}));
