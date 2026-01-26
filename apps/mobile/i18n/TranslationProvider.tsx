/**
 * TranslationProvider.tsx - React Context Provider for i18n
 * 
 * Provides translation context to the entire app and handles:
 * - Syncing locale from preferences store
 * - Forcing re-renders when language changes
 * - Initializing locale on app startup
 * 
 * Wrap your app root with this provider:
 * ```tsx
 * <TranslationProvider>
 *   <App />
 * </TranslationProvider>
 * ```
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { i18n, t as translate, setLocale as setI18nLocale, subscribeToLocaleChanges, getLocale } from './index';
import { usePreferencesStore } from '../store/preferencesStore';

// Translation context type
interface TranslationContextType {
    t: (key: string, options?: Record<string, unknown>) => string;
    locale: string;
    setLocale: (locale: string) => void;
    i18n: typeof i18n;
}

// Create context
const TranslationContext = createContext<TranslationContextType | null>(null);

// Props for the provider
interface TranslationProviderProps {
    children: ReactNode;
}

/**
 * TranslationProvider - Wraps the app to provide translation context
 */
export function TranslationProvider({ children }: TranslationProviderProps) {
    const storeLocale = usePreferencesStore((state) => state.locale);
    const setStoreLocale = usePreferencesStore((state) => state.setLocale);
    
    // Local state to force re-render when locale changes
    const [currentLocale, setCurrentLocale] = useState(getLocale());
    
    // Sync i18n locale with preferences store on mount and when store changes
    useEffect(() => {
        if (storeLocale && storeLocale !== getLocale()) {
            setI18nLocale(storeLocale);
            setCurrentLocale(storeLocale);
        }
    }, [storeLocale]);
    
    // Subscribe to locale changes for reactive updates
    useEffect(() => {
        const unsubscribe = subscribeToLocaleChanges((newLocale) => {
            setCurrentLocale(newLocale);
        });
        return unsubscribe;
    }, []);
    
    // Translation function
    const t = useCallback(
        (key: string, options?: Record<string, unknown>): string => {
            return translate(key, options);
        },
        [currentLocale] // Re-create when locale changes
    );
    
    // Locale setter that updates both i18n and preferences store
    const setLocale = useCallback(
        (locale: string) => {
            setI18nLocale(locale);
            setStoreLocale(locale as 'en-US' | 'tr-TR');
        },
        [setStoreLocale]
    );
    
    const value: TranslationContextType = {
        t,
        locale: currentLocale,
        setLocale,
        i18n,
    };
    
    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
}

/**
 * Hook to use translations from context
 * Throws error if used outside of TranslationProvider
 */
export function useTranslationContext(): TranslationContextType {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
}

export default TranslationProvider;
