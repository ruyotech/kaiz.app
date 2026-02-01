/**
 * useTheme.ts - Theme Management Hook for Kaiz LifeOS
 * 
 * Re-exports from ThemeProvider for backward compatibility.
 * For new code, prefer importing directly from '../providers/ThemeProvider'.
 * 
 * @author Kaiz Team
 * @version 2.0.0
 */

// Re-export everything from ThemeProvider for backward compatibility
export {
    useThemeContext,
    useIsDarkMode,
    useThemeColors,
    useThemeColor,
    getColorsForTheme,
    LIGHT_COLORS,
    DARK_COLORS,
    type ThemeColors,
    type ThemeContextValue,
} from '../providers/ThemeProvider';

import { useThemeContext, LIGHT_COLORS, DARK_COLORS } from '../providers/ThemeProvider';

// Alias for backward compatibility
export const useTheme = useThemeContext;

// Re-export color aliases for backward compatibility  
export const lightColors = LIGHT_COLORS;
export const darkColors = DARK_COLORS;

// Type alias for backward compatibility
export type UseThemeReturn = import('../providers/ThemeProvider').ThemeContextValue;
