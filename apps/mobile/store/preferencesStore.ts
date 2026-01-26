import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported locales - only languages with full translations
export type SupportedLocale = 
    | 'en-US' // English (United States)
    | 'tr-TR'; // Turkish (Turkey)

// Note: More locales can be added once translations are complete:
// | 'en-GB' // English (United Kingdom)
// | 'es-ES' // Spanish (Spain)
// | 'fr-FR' // French (France)
// | 'de-DE' // German (Germany)
// | 'ar-SA' // Arabic (Saudi Arabia)
// | 'zh-CN' // Chinese (Simplified)
// | 'ja-JP'; // Japanese

export type WeekStartDay = 'sunday' | 'monday';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserPreferences {
    // Localization
    locale: SupportedLocale;
    timezone: string;
    
    // Appearance
    theme: ThemeMode;
    weekStartsOn: WeekStartDay;
    
    // Life Wheel Areas (user selected focus areas)
    selectedLifeWheelAreaIds: string[];
    
    // Notifications
    enableDailyReminders: boolean;
    enableAiInsights: boolean;
    enableChallengeUpdates: boolean;
    enableBillReminders: boolean;
    
    // Privacy
    allowAnalytics: boolean;
    allowPersonalization: boolean;
    
    // Feature flags
    hasCompletedOnboarding: boolean;
    hasSeenTutorial: boolean;
}

interface PreferencesState extends UserPreferences {
    // Actions
    setLocale: (locale: SupportedLocale) => void;
    setTimezone: (timezone: string) => void;
    setTheme: (theme: ThemeMode) => void;
    setWeekStartsOn: (day: WeekStartDay) => void;
    setSelectedLifeWheelAreas: (areaIds: string[]) => void;
    toggleLifeWheelArea: (areaId: string) => void;
    setNotificationPreferences: (prefs: Partial<Pick<UserPreferences, 
        'enableDailyReminders' | 'enableAiInsights' | 'enableChallengeUpdates' | 'enableBillReminders'
    >>) => void;
    setPrivacyPreferences: (prefs: Partial<Pick<UserPreferences, 'allowAnalytics' | 'allowPersonalization'>>) => void;
    markOnboardingComplete: () => void;
    markTutorialSeen: () => void;
    reset: () => void;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    theme: 'auto',
    weekStartsOn: 'monday',
    selectedLifeWheelAreaIds: [],
    enableDailyReminders: true,
    enableAiInsights: true,
    enableChallengeUpdates: true,
    enableBillReminders: true,
    allowAnalytics: true,
    allowPersonalization: true,
    hasCompletedOnboarding: false,
    hasSeenTutorial: false,
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            ...DEFAULT_PREFERENCES,

            setLocale: (locale) => set({ locale }),
            
            setTimezone: (timezone) => set({ timezone }),
            
            setTheme: (theme) => set({ theme }),
            
            setWeekStartsOn: (day) => set({ weekStartsOn: day }),
            
            setSelectedLifeWheelAreas: (areaIds) => 
                set({ selectedLifeWheelAreaIds: areaIds }),
            
            toggleLifeWheelArea: (areaId) => 
                set((state) => ({
                    selectedLifeWheelAreaIds: state.selectedLifeWheelAreaIds.includes(areaId)
                        ? state.selectedLifeWheelAreaIds.filter(id => id !== areaId)
                        : [...state.selectedLifeWheelAreaIds, areaId]
                })),
            
            setNotificationPreferences: (prefs) => set(prefs),
            
            setPrivacyPreferences: (prefs) => set(prefs),
            
            markOnboardingComplete: () => 
                set({ hasCompletedOnboarding: true }),
            
            markTutorialSeen: () => 
                set({ hasSeenTutorial: true }),
            
            reset: () => set(DEFAULT_PREFERENCES),
        }),
        {
            name: 'user-preferences',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
