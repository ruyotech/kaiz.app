// Fibonacci sequence for story points
export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21] as const;

// Task status colors
export const TASK_STATUS_COLORS = {
    draft: '#9CA3AF',
    todo: '#3B82F6',
    in_progress: '#F59E0B',
    done: '#10B981',
} as const;

// Payment status colors
export const PAYMENT_STATUS_COLORS = {
    unpaid: '#F59E0B',
    paid: '#10B981',
    overdue: '#EF4444',
} as const;

// AI confidence thresholds
export const AI_CONFIDENCE_THRESHOLDS = {
    LOW: 0.7,
    MEDIUM: 0.85,
    HIGH: 0.95,
} as const;

// Reaction emojis
export const REACTION_TYPES = {
    thumbsup: '👍',
    fire: '🔥',
    muscle: '💪',
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;

// Max input lengths
export const MAX_INPUT_LENGTHS = {
    TASK_TITLE: 200,
    TASK_DESCRIPTION: 2000,
    COMMENT: 500,
    CHALLENGE_GOAL: 200,
} as const;

// Supported languages/locales
export const SUPPORTED_LANGUAGES = [
    { code: 'en-US' as const, name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'en-GB' as const, name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES' as const, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'es-MX' as const, name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽' },
    { code: 'fr-FR' as const, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de-DE' as const, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT' as const, name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-BR' as const, name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'pt-PT' as const, name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ja-JP' as const, name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR' as const, name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh-CN' as const, name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW' as const, name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'ar-SA' as const, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN' as const, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ru-RU' as const, name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'nl-NL' as const, name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl-PL' as const, name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'tr-TR' as const, name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'sv-SE' as const, name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
] as const;

// Default locale
export const DEFAULT_LOCALE = 'en-US' as const;
