/**
 * Theme Context
 * Provides theme state and switching functionality throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { getColors, darkColors, lightColors } from './tokens';
import { useStore } from '../store/useStore';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    colorScheme: ColorScheme;
    colors: typeof darkColors | typeof lightColors;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { settings, updateSettings } = useStore();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            if (settings.theme === 'system') {
                setColorScheme(newScheme === 'dark' ? 'dark' : 'light');
            }
        });

        return () => subscription.remove();
    }, [settings.theme]);

    // Update color scheme when theme setting changes
    useEffect(() => {
        if (settings.theme === 'system') {
            const systemScheme = Appearance.getColorScheme();
            setColorScheme(systemScheme === 'dark' ? 'dark' : 'light');
        } else {
            setColorScheme(settings.theme);
        }
    }, [settings.theme]);

    const setTheme = (theme: ThemeMode) => {
        updateSettings({ theme });
    };

    const colors = colorScheme === 'dark' ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme: settings.theme, colorScheme, colors, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
