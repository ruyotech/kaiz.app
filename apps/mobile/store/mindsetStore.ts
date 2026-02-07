/**
 * Mindset Preferences Store — UI-only state (theme selection, display prefs)
 *
 * Server state (content, themes, favorites) lives in TanStack Query hooks.
 * This store only persists local display preferences.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MindsetPreferencesState {
  /** Currently selected theme ID for card display */
  selectedThemeId: string | null;
  /** Whether auto-play / auto-swipe is enabled */
  autoSwipeEnabled: boolean;
  /** Auto-swipe interval in milliseconds */
  autoSwipeIntervalMs: number;

  setSelectedTheme: (themeId: string | null) => void;
  setAutoSwipe: (enabled: boolean) => void;
  setAutoSwipeInterval: (ms: number) => void;
}

export const useMindsetPreferencesStore = create<MindsetPreferencesState>()(
  persist(
    (set) => ({
      selectedThemeId: null,
      autoSwipeEnabled: false,
      autoSwipeIntervalMs: 5000,

      setSelectedTheme: (themeId) => set({ selectedThemeId: themeId }),
      setAutoSwipe: (enabled) => set({ autoSwipeEnabled: enabled }),
      setAutoSwipeInterval: (ms) => set({ autoSwipeIntervalMs: ms }),
    }),
    {
      name: 'mindset-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
