/**
 * settingsStore.ts - Centralized Settings Store for Kaiz 
 * 
 * This store manages all app settings with persistence using Zustand + AsyncStorage.
 * Implements tri-state theme mode (Light/Dark/System) and comprehensive settings
 * for Account, Command Center, Sprints, and App System preferences.
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Importing FileSystem for cache management
import { Appearance, ColorSchemeName } from 'react-native'; // Importing Appearance for theme management
import { ThemeMode } from './preferencesStore';

// ============================================================================
// Types & Interfaces
// ============================================================================

// ThemeMode is imported from preferencesStore for consistency ('light' | 'dark' | 'auto')

/**
 * Sprint default view options
 */
export type SprintViewMode = 'calendar' | 'kanban' | 'list';

/**
 * AI Model selection options
 */
export type AIModel = 'auto' | 'gpt-4' | 'gpt-3.5' | 'claude';

/**
 * Complete settings interface with all app preferences
 */
export interface AppSettings {
    // === Account & Profile ===
    profileName: string;
    profileAvatar: string | null;
    
    // === Command Center (AI/Chat) Preferences ===
    commandCenter: {
        autoPlayVoiceNotes: boolean;
        hapticFeedback: boolean;
        aiModel: AIModel;
        showTypingIndicator: boolean;
        messagePreview: boolean;
        sendWithEnter: boolean;
    };
    
    // === Sprints & Workflow ===
    sprints: {
        defaultView: SprintViewMode;
        showCompletedTasks: boolean;
        enableTaskNotifications: boolean;
        autoStartPomodoro: boolean;
        weekStartsOn: 'sunday' | 'monday';
    };
    
    // === App System ===
    system: {
        themeMode: ThemeMode;
        reducedMotion: boolean;
        soundEffects: boolean;
    };
    
    // === Storage & Cache ===
    storage: {
        cacheSize: number; // in bytes
        lastCacheClear: string | null; // ISO date string
    };
    
    // === App Info (read-only, computed) ===
    appInfo: {
        version: string;
        buildNumber: string;
    };
}

/**
 * Settings store state with all actions
 */
interface SettingsState extends AppSettings {
    // === Computed ===
    effectiveTheme: ColorSchemeName;
    
    // === Actions - Account ===
    setProfileName: (name: string) => void;
    setProfileAvatar: (uri: string | null) => void;
    
    // === Actions - Command Center ===
    setAutoPlayVoiceNotes: (enabled: boolean) => void;
    setHapticFeedback: (enabled: boolean) => void;
    setAIModel: (model: AIModel) => void;
    setShowTypingIndicator: (enabled: boolean) => void;
    setMessagePreview: (enabled: boolean) => void;
    setSendWithEnter: (enabled: boolean) => void;
    
    // === Actions - Sprints ===
    setDefaultSprintView: (view: SprintViewMode) => void;
    setShowCompletedTasks: (show: boolean) => void;
    setEnableTaskNotifications: (enabled: boolean) => void;
    setAutoStartPomodoro: (enabled: boolean) => void;
    setWeekStartsOn: (day: 'sunday' | 'monday') => void;
    
    // === Actions - System ===
    setThemeMode: (mode: ThemeMode) => void;
    setReducedMotion: (enabled: boolean) => void;
    setSoundEffects: (enabled: boolean) => void;
    
    // === Actions - Storage ===
    clearCache: () => Promise<void>;
    calculateCacheSize: () => Promise<void>;
    
    // === Actions - General ===
    reset: () => void;
    hydrateAppInfo: () => void;
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: AppSettings = {
    // Account & Profile
    profileName: '',
    profileAvatar: null,
    
    // Command Center
    commandCenter: {
        autoPlayVoiceNotes: false,
        hapticFeedback: true,
        aiModel: 'auto',
        showTypingIndicator: true,
        messagePreview: true,
        sendWithEnter: false,
    },
    
    // Sprints & Workflow
    sprints: {
        defaultView: 'calendar',
        showCompletedTasks: true,
        enableTaskNotifications: true,
        autoStartPomodoro: false,
        weekStartsOn: 'monday',
    },
    
    // App System
    system: {
        themeMode: 'auto',
        reducedMotion: false,
        soundEffects: true,
    },
    
    // Storage & Cache
    storage: {
        cacheSize: 0,
        lastCacheClear: null,
    },
    
    // App Info
    appInfo: {
        version: '1.0.0',
        buildNumber: '1',
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the effective theme based on mode and system preference
 */
function getEffectiveTheme(themeMode: ThemeMode): ColorSchemeName {
    if (themeMode === 'auto') {
        return Appearance.getColorScheme() || 'light';
    }
    return themeMode;
}

/**
 * Calculate cache directory size
 */

// Helper to get cache directory size
async function getCacheDirectorySize(): Promise<number> {
    try {
        const cacheDir = FileSystem.cacheDirectory || null;
        if (!cacheDir) return 0;
        // @ts-ignore
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        if (!dirInfo.exists) return 0;
        // Placeholder: actual size calculation would require recursive walk
        return 0;
    } catch (error) {
        console.error('Error calculating cache size:', error);
        return 0;
    }
}

// ============================================================================
// Settings Store
// ============================================================================

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_SETTINGS,
            // Computed
            effectiveTheme: getEffectiveTheme(DEFAULT_SETTINGS.system.themeMode),
            // === Account Actions ===
            setProfileName: (name) => set({ profileName: name }),
            setProfileAvatar: (uri) => set({ profileAvatar: uri }),
            // === Command Center Actions ===
            setAutoPlayVoiceNotes: (enabled) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, autoPlayVoiceNotes: enabled },
                })),
            setHapticFeedback: (enabled) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, hapticFeedback: enabled },
                })),
            setAIModel: (model) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, aiModel: model },
                })),
            setShowTypingIndicator: (enabled) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, showTypingIndicator: enabled },
                })),
            setMessagePreview: (enabled) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, messagePreview: enabled },
                })),
            setSendWithEnter: (enabled) =>
                set((state) => ({
                    commandCenter: { ...state.commandCenter, sendWithEnter: enabled },
                })),
            // === Sprint Actions ===
            setDefaultSprintView: (view) =>
                set((state) => ({
                    sprints: { ...state.sprints, defaultView: view },
                })),
            setShowCompletedTasks: (show) =>
                set((state) => ({
                    sprints: { ...state.sprints, showCompletedTasks: show },
                })),
            
            setEnableTaskNotifications: (enabled) =>
                set((state) => ({
                    sprints: { ...state.sprints, enableTaskNotifications: enabled },
                })),
            
            setAutoStartPomodoro: (enabled) =>
                set((state) => ({
                    sprints: { ...state.sprints, autoStartPomodoro: enabled },
                })),
            
            setWeekStartsOn: (day) =>
                set((state) => ({
                    sprints: { ...state.sprints, weekStartsOn: day },
                })),
            
            // === System Actions ===
            setThemeMode: (mode) => {
                const effectiveTheme = getEffectiveTheme(mode);
                set((state) => ({
                    system: { ...state.system, themeMode: mode },
                    effectiveTheme,
                }));
            },
            
            setReducedMotion: (enabled) =>
                set((state) => ({
                    system: { ...state.system, reducedMotion: enabled },
                })),
            
            setSoundEffects: (enabled) =>
                set((state) => ({
                    system: { ...state.system, soundEffects: enabled },
                })),

            // === Storage Actions ===
            clearCache: async () => {
                try {
                    const cacheDir = FileSystem.cacheDirectory || null;
                    if (cacheDir) {
                        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
                        if (dirInfo.exists) {
                            await FileSystem.deleteAsync(cacheDir, { idempotent: true });
                        }
                    }
                    set((state) => ({
                        storage: {
                            ...state.storage,
                            cacheSize: 0,
                            lastCacheClear: new Date().toISOString(),
                        },
                    }));
                } catch (error) {
                    console.error('Error clearing cache:', error);
                }
            },

            calculateCacheSize: async () => {
                const size = await getCacheDirectorySize();
                set((state) => ({
                    storage: { ...state.storage, cacheSize: size },
                }));
            },

            // === General Actions ===
            reset: () => {
                set({
                    ...DEFAULT_SETTINGS,
                    effectiveTheme: getEffectiveTheme(DEFAULT_SETTINGS.system.themeMode),
                });
            },

            hydrateAppInfo: () => {
                // No-op: Remove Application dependency for now
            },
        }),
        {
            name: 'kaiz-settings-v1',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist user-changeable settings, not computed values
                profileName: state.profileName,
                profileAvatar: state.profileAvatar,
                commandCenter: state.commandCenter,
                sprints: state.sprints,
                system: state.system,
                storage: state.storage,
            }),
        }
    )
);

// ============================================================================
// Theme Mode Hook for easy consumption
// ============================================================================

/**
 * Hook to get the current effective theme (respects system setting)
 */
export function useEffectiveTheme(): ColorSchemeName {
    const themeMode = useSettingsStore((state) => state.system.themeMode);
    const effectiveTheme = useSettingsStore((state) => state.effectiveTheme);
    
    // Also listen to system appearance changes when in 'system' mode
    // This is handled by React Native's useColorScheme in consuming components
    
    return effectiveTheme;
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode(): boolean {
    const effectiveTheme = useEffectiveTheme();
    return effectiveTheme === 'dark';
}
