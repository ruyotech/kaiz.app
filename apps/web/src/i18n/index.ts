/**
 * i18n/index.ts - Internationalization for Kaiz Web
 * 
 * Lightweight i18n implementation for Next.js that:
 * - Detects browser locale
 * - Supports language switching
 * - Falls back to English
 * - Works with both client and server components
 * 
 * Currently supports:
 * - English (en)
 * - Turkish (tr)
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import en from './locales/en.json';
import tr from './locales/tr.json';

// Type definitions
export type Locale = 'en' | 'tr';
export type TranslationKey = string;

// Available locales
export const locales: Locale[] = ['en', 'tr'];
export const defaultLocale: Locale = 'en';

// Locale metadata
export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
};

// Translation dictionaries
const translations: Record<Locale, typeof en> = {
  en,
  tr,
};

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate variables in a string
 * Supports {{variable}} syntax
 */
function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Create a translator function for a specific locale
 */
export function createTranslator(locale: Locale) {
  const dictionary = translations[locale] || translations[defaultLocale];
  
  return function t(key: string, variables?: Record<string, string | number>): string {
    const value = getNestedValue(dictionary as Record<string, unknown>, key);
    
    if (value === undefined) {
      // Fallback to default locale
      const fallbackValue = getNestedValue(translations[defaultLocale] as Record<string, unknown>, key);
      if (fallbackValue) {
        return interpolate(fallbackValue, variables);
      }
      // Return key if not found
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    return interpolate(value, variables);
  };
}

/**
 * Detect browser locale and return matching supported locale
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  
  const browserLocale = navigator.language.split('-')[0];
  return locales.includes(browserLocale as Locale) ? (browserLocale as Locale) : defaultLocale;
}

/**
 * Get locale from cookie or detect from browser
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  
  // Try to get from localStorage
  const stored = localStorage.getItem('kaiz-locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  
  return detectLocale();
}

/**
 * Save locale preference
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kaiz-locale', locale);
    // Optionally reload for full re-render
    window.location.reload();
  }
}

// Export translations for direct access if needed
export { en, tr };
