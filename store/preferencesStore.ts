import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLocale = 
    | 'en-US' // English (United States)
    | 'en-GB' // English (United Kingdom)
    | 'es-ES' // Spanish (Spain)
    | 'es-MX' // Spanish (Mexico)
    | 'fr-FR' // French (France)
    | 'de-DE' // German (Germany)
    | 'it-IT' // Italian (Italy)
    | 'pt-BR' // Portuguese (Brazil)
    | 'pt-PT' // Portuguese (Portugal)
    | 'ja-JP' // Japanese (Japan)
    | 'ko-KR' // Korean (South Korea)
    | 'zh-CN' // Chinese (Simplified, China)
    | 'zh-TW' // Chinese (Traditional, Taiwan)
    | 'ar-SA' // Arabic (Saudi Arabia)
    | 'hi-IN' // Hindi (India)
    | 'ru-RU' // Russian (Russia)
    | 'nl-NL' // Dutch (Netherlands)
    | 'pl-PL' // Polish (Poland)
    | 'tr-TR' // Turkish (Turkey)
    | 'sv-SE'; // Swedish (Sweden)

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
    loadDemoPreferences: () => void;
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

// Demo user preferences - pre-configured for testing
const DEMO_PREFERENCES: UserPreferences = {
    locale: 'en-US',
    timezone: 'America/New_York',
    theme: 'auto',
    weekStartsOn: 'monday',
    selectedLifeWheelAreaIds: ['lw-1', 'lw-2', 'lw-3', 'lw-4'], // Health, Career, Finance, Personal Growth
    enableDailyReminders: true,
    enableAiInsights: true,
    enableChallengeUpdates: true,
    enableBillReminders: true,
    allowAnalytics: true,
    allowPersonalization: true,
    hasCompletedOnboarding: true,
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
            
            loadDemoPreferences: () => set(DEMO_PREFERENCES),
        }),
        {
            name: 'user-preferences',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
