/**
 * i18n/index.ts - Internationalization Configuration for Kaiz LifeOS
 * 
 * Uses i18n-js with expo-localization for:
 * - Device locale detection
 * - Fallback to English
 * - Easy language switching via settings
 * 
 * Currently supports:
 * - English (en-US, en-GB, en)
 * - Turkish (tr-TR, tr)
 * 
 * Adding new languages:
 * 1. Create a new JSON file in ./locales/[lang].json
 * 2. Import and add to translations object below
 * 3. Add to SUPPORTED_LANGUAGES in constants.ts if not already there
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import tr from './locales/tr.json';

// Create i18n instance
const i18n = new I18n({
    en,
    'en-US': en,
    'en-GB': en,
    tr,
    'tr-TR': tr,
});

// Set default locale from device
i18n.defaultLocale = 'en';
i18n.locale = Localization.getLocales()[0]?.languageTag || 'en';

// Enable fallbacks (if translation missing, use default locale)
i18n.enableFallback = true;

/**
 * Change the app language
 * @param locale - The locale code (e.g., 'en-US', 'tr-TR')
 */
export function setLocale(locale: string): void {
    i18n.locale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): string {
    return i18n.locale;
}

/**
 * Translate a key
 * @param key - The translation key (e.g., 'settings.title')
 * @param options - Optional interpolation values
 */
export function t(key: string, options?: Record<string, unknown>): string {
    return i18n.t(key, options);
}

// Export the i18n instance for direct access if needed
export { i18n };

// Export default for convenience
export default i18n;
