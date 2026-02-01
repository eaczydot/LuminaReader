// Theme Constants for LuminaReader

export const Colors = {
  light: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceSecondary: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9CA3AF',
  },
  dark: {
    primary: '#818CF8',
    primaryDark: '#6366F1',
    secondary: '#A78BFA',
    background: '#111827',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    border: '#374151',
    borderLight: '#4B5563',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: '#1F2937',
    tabBar: '#1F2937',
    tabBarInactive: '#6B7280',
  },
};

export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Highlight colors
export const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FEF08A',
  green: '#BBF7D0',
  blue: '#BFDBFE',
  pink: '#FBCFE8',
  purple: '#DDD6FE',
  orange: '#FED7AA',
};

// Reader-specific settings
export const ReaderDefaults = {
  fontSize: 18,
  fontFamily: 'System',
  lineHeight: 1.6,
  margins: 16,
  availableFonts: [
    { name: 'System', value: 'System' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Palatino', value: 'Palatino' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Arial', value: 'Arial' },
  ],
  fontSizeRange: { min: 12, max: 32, step: 2 },
  lineHeightRange: { min: 1.2, max: 2.4, step: 0.2 },
  marginRange: { min: 8, max: 48, step: 4 },
};

// Integration icons
export const IntegrationIcons: Record<string, string> = {
  notion: '📝',
  obsidian: '🔮',
  instapaper: '📰',
  pocket: '👜',
  readwise: '📚',
  raindrop: '💧',
  omnivore: '🦁',
};

export const IntegrationColors: Record<string, string> = {
  notion: '#000000',
  obsidian: '#7C3AED',
  instapaper: '#1F1F1F',
  pocket: '#EF4056',
  readwise: '#FE9920',
  raindrop: '#0066FF',
  omnivore: '#FFD700',
};
