/**
 * localizedDate.ts - Locale-aware date formatting utilities
 * 
 * Wraps date-fns with locale support for i18n.
 * Uses the current app locale for formatting.
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { format as dateFnsFormat, Locale } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { getLocale } from '../i18n';

// Map of supported locales
const locales: Record<string, Locale> = {
    'en': enUS,
    'en-US': enUS,
    'en-GB': enUS,
    'tr': tr,
    'tr-TR': tr,
};

/**
 * Get the date-fns locale for the current app locale
 */
export function getDateLocale(): Locale {
    const appLocale = getLocale();
    return locales[appLocale] || enUS;
}

/**
 * Format a date with locale support
 * @param date - Date to format
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatLocalized(date: Date | number, formatStr: string): string {
    return dateFnsFormat(date, formatStr, { locale: getDateLocale() });
}

/**
 * Get localized month name (short)
 * @param date - Date to get month from
 * @returns Short month name (e.g., "Jan", "Oca")
 */
export function getMonthShort(date: Date): string {
    return formatLocalized(date, 'MMM');
}

/**
 * Get localized month name (full)
 * @param date - Date to get month from
 * @returns Full month name (e.g., "January", "Ocak")
 */
export function getMonthFull(date: Date): string {
    return formatLocalized(date, 'MMMM');
}

/**
 * Get localized day of week (short)
 * @param date - Date to get day from
 * @returns Short day name (e.g., "Mon", "Pzt")
 */
export function getDayShort(date: Date): string {
    return formatLocalized(date, 'EEE');
}

/**
 * Get localized day of week (full)
 * @param date - Date to get day from
 * @returns Full day name (e.g., "Monday", "Pazartesi")
 */
export function getDayFull(date: Date): string {
    return formatLocalized(date, 'EEEE');
}

/**
 * Get localized relative date string
 * Uses translation keys for "Today", "Yesterday", etc.
 */
export function getRelativeDateLocalized(
    date: Date,
    t: (key: string, options?: Record<string, unknown>) => string
): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('time.today');
    if (diffDays === 1) return t('time.yesterday');
    if (diffDays === -1) return t('time.tomorrow');
    if (diffDays > 1 && diffDays < 7) return t('time.daysAgo', { count: diffDays });
    if (diffDays < -1 && diffDays > -7) return t('time.inDays', { count: Math.abs(diffDays) });
    
    return formatLocalized(date, 'PP'); // Localized date format
}

/**
 * Format date for display (localized)
 * @param date - Date to format
 * @returns Formatted date like "Jan 15, 2026" or "15 Oca 2026"
 */
export function formatDateLocalized(date: Date): string {
    return formatLocalized(date, 'PP');
}

/**
 * Format date and time for display (localized)
 * @param date - Date to format
 * @returns Formatted datetime
 */
export function formatDateTimeLocalized(date: Date): string {
    return formatLocalized(date, 'PPp');
}

/**
 * Format time for display (localized)
 * @param date - Date to format
 * @returns Formatted time like "3:30 PM" or "15:30"
 */
export function formatTimeLocalized(date: Date): string {
    return formatLocalized(date, 'p');
}

/**
 * Format options for toLocaleDateString replacement
 */
export interface LocalizedDateOptions {
    month?: 'short' | 'long' | 'narrow' | 'numeric' | '2-digit';
    day?: 'numeric' | '2-digit';
    year?: 'numeric' | '2-digit';
    weekday?: 'short' | 'long' | 'narrow';
}

/**
 * Localized replacement for toLocaleDateString('en-US', options)
 * Converts Intl.DateTimeFormat options to date-fns format strings
 * @param date - Date to format
 * @param options - Format options similar to toLocaleDateString
 * @returns Formatted date string
 */
export function toLocaleDateStringLocalized(
    date: Date | string | number,
    options: LocalizedDateOptions = {}
): string {
    const d = new Date(date);
    
    // Build format string based on options
    let formatParts: string[] = [];
    
    if (options.weekday) {
        switch (options.weekday) {
            case 'short': formatParts.push('EEE'); break;
            case 'long': formatParts.push('EEEE'); break;
            case 'narrow': formatParts.push('EEEEE'); break;
        }
    }
    
    if (options.month) {
        switch (options.month) {
            case 'short': formatParts.push('MMM'); break;
            case 'long': formatParts.push('MMMM'); break;
            case 'narrow': formatParts.push('MMMMM'); break;
            case 'numeric': formatParts.push('M'); break;
            case '2-digit': formatParts.push('MM'); break;
        }
    }
    
    if (options.day) {
        switch (options.day) {
            case 'numeric': formatParts.push('d'); break;
            case '2-digit': formatParts.push('dd'); break;
        }
    }
    
    if (options.year) {
        switch (options.year) {
            case 'numeric': formatParts.push('yyyy'); break;
            case '2-digit': formatParts.push('yy'); break;
        }
    }
    
    // Default format if no options provided
    if (formatParts.length === 0) {
        return formatLocalized(d, 'PP');
    }
    
    // Join with appropriate separators
    // For "month day, year" format
    const formatStr = formatParts.join(' ');
    return formatLocalized(d, formatStr);
}

