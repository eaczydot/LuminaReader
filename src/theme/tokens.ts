/**
 * Linear iOS-inspired Design System Tokens
 * Supports both light and dark modes
 */

import { Platform, Appearance } from 'react-native';

// ============================================
// DARK MODE COLORS
// ============================================
export const darkColors = {
    // Backgrounds
    bg: '#0A0A0B',
    surface: '#111113',
    surface2: '#1A1A1D',
    surfaceHover: '#222226',

    // Separators & Borders
    separator: 'rgba(255, 255, 255, 0.06)',
    separatorStrong: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',

    // Text
    text: '#ECECEF',
    text2: '#A1A1A6',
    text3: '#6E6E73',
    muted: '#48484A',

    // Accent
    accent: '#7C5CFF',
    accentHover: '#8F73FF',
    accentMuted: 'rgba(124, 92, 255, 0.15)',
    accentText: '#B4A0FF',

    // Semantic
    danger: '#FF453A',
    dangerMuted: 'rgba(255, 69, 58, 0.15)',
    success: '#30D158',
    successMuted: 'rgba(48, 209, 88, 0.15)',
    warning: '#FF9F0A',
    warningMuted: 'rgba(255, 159, 10, 0.15)',

    // Chips / Labels
    chipBg: 'rgba(255, 255, 255, 0.08)',
    chipBgHover: 'rgba(255, 255, 255, 0.12)',
    chipText: '#D1D1D6',
    chipBorder: 'rgba(255, 255, 255, 0.06)',

    // Tab Bar
    tabBg: 'rgba(20, 20, 22, 0.85)',
    tabBgSolid: '#141416',
    tabActive: '#FFFFFF',
    tabInactive: '#6E6E73',
    tabBadge: '#FF453A',
} as const;

// ============================================
// LIGHT MODE COLORS
// ============================================
export const lightColors = {
    // Backgrounds
    bg: '#FFFFFF',
    surface: '#F7F7F7',
    surface2: '#EFEFEF',
    surfaceHover: '#E5E5E5',

    // Separators & Borders
    separator: 'rgba(0, 0, 0, 0.06)',
    separatorStrong: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',

    // Text
    text: '#1C1C1E',
    text2: '#6E6E73',
    text3: '#A1A1A6',
    muted: '#C7C7CC',

    // Accent
    accent: '#6B4EFF',
    accentHover: '#5A3FE6',
    accentMuted: 'rgba(107, 78, 255, 0.1)',
    accentText: '#6B4EFF',

    // Semantic
    danger: '#FF3B30',
    dangerMuted: 'rgba(255, 59, 48, 0.1)',
    success: '#34C759',
    successMuted: 'rgba(52, 199, 89, 0.1)',
    warning: '#FF9500',
    warningMuted: 'rgba(255, 149, 0, 0.1)',

    // Chips / Labels
    chipBg: 'rgba(0, 0, 0, 0.05)',
    chipBgHover: 'rgba(0, 0, 0, 0.08)',
    chipText: '#3C3C43',
    chipBorder: 'rgba(0, 0, 0, 0.06)',

    // Tab Bar
    tabBg: 'rgba(255, 255, 255, 0.85)',
    tabBgSolid: '#FFFFFF',
    tabActive: '#1C1C1E',
    tabInactive: '#A1A1A6',
    tabBadge: '#FF3B30',
} as const;

// Theme-aware color getter
export const getColors = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
        const colorScheme = Appearance.getColorScheme();
        return colorScheme === 'dark' ? darkColors : lightColors;
    }
    return theme === 'dark' ? darkColors : lightColors;
};

// Default export for backward compatibility
export const colors = darkColors;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
    // Font families (mapped to loaded fonts)
    fonts: {
        // Display / Headings
        displayBold: 'Newsreader_700Bold',
        displayBoldItalic: 'Newsreader_700Bold_Italic',
        displayRegular: 'Newsreader_400Regular',

        // Reading / Body (serif)
        serifRegular: 'Newsreader_400Regular',
        serifBold: 'Newsreader_700Bold',

        // UI / Labels (sans-serif)
        sans: 'Inter_400Regular',
        sansMedium: 'Inter_500Medium',
        sansBold: 'Inter_700Bold',

        // System fallback
        system: Platform.select({ ios: 'System', android: 'Roboto' }) || 'System',
    },

    // Font sizes (optimized for density)
    sizes: {
        xs: 11,
        sm: 12,
        base: 14,
        md: 15,
        lg: 17,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 34,
        display: 40,
    },

    // Line heights (multipliers)
    lineHeights: {
        tight: 1.15,
        snug: 1.25,
        normal: 1.4,
        relaxed: 1.55,
        loose: 1.75,
    },

    // Font weights
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Letter spacing
    tracking: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
} as const;

// Strict text styles for consistency
export const textStyles = {
    // Display
    displayLarge: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes['4xl'],
        lineHeight: typography.sizes['4xl'] * typography.lineHeights.tight,
        letterSpacing: typography.tracking.tight,
    },
    displayMedium: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes['3xl'],
        lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
        letterSpacing: typography.tracking.tight,
    },
    displaySmall: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes['2xl'],
        lineHeight: typography.sizes['2xl'] * typography.lineHeights.snug,
    },

    // Headings
    h1: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes.xl,
        lineHeight: typography.sizes.xl * typography.lineHeights.snug,
    },
    h2: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes.lg,
        lineHeight: typography.sizes.lg * typography.lineHeights.snug,
    },

    // Body
    bodyLarge: {
        fontFamily: typography.fonts.serifRegular,
        fontSize: typography.sizes.lg,
        lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
    },
    bodyMedium: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.md,
        lineHeight: typography.sizes.md * typography.lineHeights.normal,
    },
    bodySmall: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.base,
        lineHeight: typography.sizes.base * typography.lineHeights.normal,
    },

    // Labels
    labelLarge: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.base,
        lineHeight: typography.sizes.base * typography.lineHeights.snug,
    },
    labelMedium: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.sm,
        lineHeight: typography.sizes.sm * typography.lineHeights.snug,
        letterSpacing: typography.tracking.wide,
    },
    labelSmall: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        lineHeight: typography.sizes.xs * typography.lineHeights.snug,
        letterSpacing: typography.tracking.wide,
    },
} as const;

// ============================================
// SPACING (optimized for density)
// ============================================
export const spacing = {
    0: 0,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
} as const;

// ============================================
// RADIUS
// ============================================
export const radius = {
    none: 0,
    sm: 6,
    md: 10,
    lg: 12,
    xl: 14,
    '2xl': 16,
    '3xl': 20,
    full: 9999,
} as const;

// ============================================
// ELEVATION / SHADOWS
// ============================================
export const elevation = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    glow: (color: string, intensity: number = 0.3) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: intensity,
        shadowRadius: 12,
        elevation: 0,
    }),
} as const;

// ============================================
// BLUR
// ============================================
export const blur = {
    // iOS blur intensities
    light: 20,
    medium: 40,
    heavy: 80,

    // Whether to use blur (iOS) or solid fallback (Android)
    isSupported: Platform.OS === 'ios',

    // Blur tint for BlurView
    tint: 'dark' as const,
} as const;

// ============================================
// ANIMATION
// ============================================
export const animation = {
    // Durations (ms)
    duration: {
        instant: 100,
        fast: 150,
        normal: 250,
        slow: 400,
        slower: 600,
    },

    // Spring configs for Reanimated
    spring: {
        snappy: { damping: 15, stiffness: 400 },
        bouncy: { damping: 10, stiffness: 300 },
        gentle: { damping: 20, stiffness: 200 },
    },
} as const;

// ============================================
// TAB BAR
// ============================================
export const tabBar = {
    height: 49,
    paddingBottom: 34,
    iconSize: 24,
    labelSize: 10,
    spacing: 3,
    pressedScale: 0.92,
    pressedOpacity: 0.7,
    badgeSize: 18,
    badgeFontSize: 11,
} as const;

// ============================================
// ICONS
// ============================================
export const icons = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    strokeWidth: {
        thin: 1.5,
        normal: 2,
        bold: 2.5,
    },
} as const;

// ============================================
// CONSOLIDATED TOKEN OBJECT
// ============================================
export const tokens = {
    colors,
    darkColors,
    lightColors,
    getColors,
    typography,
    textStyles,
    spacing,
    radius,
    elevation,
    blur,
    animation,
    tabBar,
    icons,
} as const;

export type Tokens = typeof tokens;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type TextStyles = typeof textStyles;

