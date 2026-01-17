/**
 * Theme hook providing access to design tokens
 * Includes mode handling stub for future light mode support
 */

import { useMemo } from 'react';
import { tokens, colors, typography, spacing, radius, elevation } from './tokens';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
    mode: ThemeMode;
    tokens: typeof tokens;
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    radius: typeof radius;
    elevation: typeof elevation;
    // Helpers
    isDark: boolean;
    isLight: boolean;
}

/**
 * Hook to access theme tokens
 * Currently returns dark mode tokens; light mode support can be added later
 */
export function useTheme(): ThemeContextValue {
    // TODO: Implement theme mode switching when light mode is needed
    const mode: ThemeMode = 'dark';

    return useMemo(
        () => ({
            mode,
            tokens,
            colors,
            typography,
            spacing,
            radius,
            elevation,
            isDark: mode === 'dark',
            isLight: mode === 'light',
        }),
        [mode]
    );
}

/**
 * Get a color token value
 * Utility for inline usage
 */
export function getColor(key: keyof typeof colors): string {
    return colors[key];
}

/**
 * Get a spacing token value
 */
export function getSpacing(key: keyof typeof spacing): number {
    return spacing[key];
}

/**
 * Get a radius token value
 */
export function getRadius(key: keyof typeof radius): number {
    return radius[key];
}

// Re-export tokens for direct access
export { tokens, colors, typography, spacing, radius, elevation } from './tokens';
