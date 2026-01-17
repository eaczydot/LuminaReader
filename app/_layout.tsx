import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Newsreader_400Regular, Newsreader_700Bold, Newsreader_700Bold_Italic } from '@expo-google-fonts/newsreader';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../src/store/useStore';
import { ThemeProvider } from '../src/theme/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
        Newsreader_400Regular,
        Newsreader_700Bold,
        Newsreader_700Bold_Italic,
    });

    const { hydrateTabPreferences } = useStore();

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
            // Hydrate tab preferences on app startup
            hydrateTabPreferences();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <ThemeProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0C0E' } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}


