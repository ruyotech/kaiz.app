import { create } from 'zustand';

export type AppContext = 'sdlc' | 'mindset' | 'essentia' | 'bills' | 'challenges' | 'pomodoro';

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
    currentApp: 'sdlc',
    isAppSwitcherOpen: false,
    isMoreMenuOpen: false,
    setCurrentApp: (app) => set({ currentApp: app, isMoreMenuOpen: false }),
    toggleAppSwitcher: () => set((state) => ({ isAppSwitcherOpen: !state.isAppSwitcherOpen })),
    toggleMoreMenu: () => set((state) => ({ isMoreMenuOpen: !state.isMoreMenuOpen })),
    closeModals: () => set({ isAppSwitcherOpen: false, isMoreMenuOpen: false }),
}));
