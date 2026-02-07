/**
 * Central Theme System — Single source of truth for all colors, spacing, and module accents.
 *
 * Rules:
 * - NEVER hardcode hex colors in components. Import from here.
 * - Module accents MUST be referenced via `moduleColors[module]`.
 * - Semantic tokens (success, error, etc.) come from `LIGHT_THEME` / `DARK_THEME`.
 */

// ============================================================================
// Brand Palette
// ============================================================================

export const brand = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// ============================================================================
// Module Accent Colors (per-feature branding)
// ============================================================================

export const moduleColors = {
  sprints: '#3B82F6',   // blue-500
  sensai: '#10B981',    // emerald-500
  challenges: '#F59E0B', // amber-500
  essentia: '#8B5CF6',  // violet-500
  mindset: '#EC4899',   // pink-500
  pomodoro: '#EF4444',  // red-500
  community: '#06B6D4', // cyan-500
  family: '#EC4899',    // pink-500
  notifications: '#F97316', // orange-500
  settings: '#6B7280',  // gray-500
  backlog: '#6366F1',   // indigo-500
  epics: '#8B5CF6',     // violet-500
  taskSearch: '#0EA5E9', // sky-500
  templates: '#14B8A6', // teal-500
  commandCenter: '#8B5CF6', // violet-500
} as const;

export type ModuleKey = keyof typeof moduleColors;

// ============================================================================
// Semantic Colors (light / dark)
// ============================================================================

export interface SemanticColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  card: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  // Borders
  border: string;
  borderSecondary: string;
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  // Special
  overlay: string;
  shadow: string;
  // Interactive
  ripple: string;
  highlight: string;
  // Input
  inputBackground: string;
  placeholder: string;
  // Status bar
  statusBarStyle: 'light' | 'dark' | 'auto';
}

export const LIGHT_THEME: SemanticColors = {
  background: brand.neutral[50],
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: brand.neutral[100],
  card: '#FFFFFF',
  text: brand.neutral[900],
  textSecondary: brand.neutral[500],
  textTertiary: brand.neutral[400],
  textInverse: '#FFFFFF',
  border: brand.neutral[200],
  borderSecondary: brand.neutral[100],
  primary: brand.primary[500],
  primaryLight: brand.primary[100],
  primaryDark: brand.primary[700],
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  ripple: 'rgba(0, 0, 0, 0.08)',
  highlight: 'rgba(59, 130, 246, 0.1)',
  inputBackground: brand.neutral[50],
  placeholder: brand.neutral[400],
  statusBarStyle: 'dark',
};

export const DARK_THEME: SemanticColors = {
  background: brand.neutral[900],
  backgroundSecondary: brand.neutral[800],
  backgroundTertiary: brand.neutral[700],
  card: brand.neutral[800],
  text: brand.neutral[50],
  textSecondary: brand.neutral[400],
  textTertiary: brand.neutral[500],
  textInverse: brand.neutral[900],
  border: brand.neutral[700],
  borderSecondary: brand.neutral[600],
  primary: brand.primary[400],
  primaryLight: '#1E3A5F',
  primaryDark: brand.primary[300],
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  error: '#F87171',
  errorLight: '#7F1D1D',
  info: '#38BDF8',
  infoLight: '#0C4A6E',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  ripple: 'rgba(255, 255, 255, 0.1)',
  highlight: 'rgba(96, 165, 250, 0.2)',
  inputBackground: brand.neutral[700],
  placeholder: brand.neutral[500],
  statusBarStyle: 'light',
};

// ============================================================================
// Status Colors (task statuses, priorities, etc.)
// ============================================================================

export const taskStatusColors = {
  draft: brand.neutral[400],
  todo: brand.primary[500],
  in_progress: '#F59E0B',
  done: '#10B981',
} as const;

export const priorityColors = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  URGENT: '#EF4444',
} as const;

export const paymentStatusColors = {
  unpaid: '#F59E0B',
  paid: '#10B981',
  overdue: '#EF4444',
} as const;

// ============================================================================
// Spacing & Sizing (consistent spacing scale)
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;
