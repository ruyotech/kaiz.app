/**
 * useTranslation.ts - React hook for translations
 * 
 * Provides a reactive hook that re-renders components when language changes.
 * Uses the preferencesStore locale to stay in sync with settings.
 * 
 * Usage:
 * ```tsx
 * const { t } = useTranslation();
 * return <Text>{t('settings.title')}</Text>;
 * ```
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';
import { i18n, t as translate, setLocale as setI18nLocale, subscribeToLocaleChanges, getLocale } from '../i18n';
import { usePreferencesStore, type SupportedLocale } from '../store/preferencesStore';

/**
 * Hook for accessing translations
 * Automatically syncs with the locale from preferencesStore
 * Re-renders component when locale changes
 */
export function useTranslation() {
    const storeLocale = usePreferencesStore((state) => state.locale);
    const setStoreLocale = usePreferencesStore((state) => state.setLocale);
    // Local state to force re-render when locale changes
    const [currentLocale, setCurrentLocale] = useState(getLocale());
    
    // Sync i18n locale with preferences store
    useEffect(() => {
        if (storeLocale && storeLocale !== getLocale()) {
            setI18nLocale(storeLocale);
        }
    }, [storeLocale]);
    
    // Subscribe to locale changes for reactive updates
    useEffect(() => {
        const unsubscribe = subscribeToLocaleChanges((newLocale) => {
            setCurrentLocale(newLocale);
        });
        return unsubscribe;
    }, []);
    
    // Translation function that uses current locale
    const t = useCallback(
        (key: string, options?: Record<string, unknown>): string => {
            return translate(key, options);
        },
        [currentLocale] // Re-create when locale changes to get fresh translations
    );
    
    // Function to change locale (updates both i18n and store)
    const setLocale = useCallback(
        (locale: SupportedLocale) => {
            setI18nLocale(locale);
            setStoreLocale(locale);
        },
        [setStoreLocale]
    );
    
    return {
        t,
        locale: currentLocale,
        setLocale,
        i18n,
    };
}

export default useTranslation;
