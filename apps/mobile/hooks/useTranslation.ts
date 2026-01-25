/**
 * useTranslation.ts - React hook for translations
 * 
 * Provides a simple hook that re-renders components when language changes.
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

import { useCallback, useEffect } from 'react';
import { i18n, t as translate, setLocale as setI18nLocale } from '../i18n';
import { usePreferencesStore } from '../store/preferencesStore';

/**
 * Hook for accessing translations
 * Automatically syncs with the locale from preferencesStore
 */
export function useTranslation() {
    const locale = usePreferencesStore((state) => state.locale);
    
    // Sync i18n locale with preferences store
    useEffect(() => {
        setI18nLocale(locale);
    }, [locale]);
    
    // Memoized translation function
    const t = useCallback(
        (key: string, options?: Record<string, unknown>): string => {
            return translate(key, options);
        },
        [locale] // Re-create when locale changes to trigger re-render
    );
    
    return {
        t,
        locale,
        i18n,
    };
}

export default useTranslation;
