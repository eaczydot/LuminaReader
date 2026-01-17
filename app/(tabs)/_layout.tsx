/**
 * Tab Layout
 * Uses custom LinearTabBar for navigation
 */

import { Tabs } from 'expo-router';
import { LinearTabBar } from '../../src/components/nav/LinearTabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <LinearTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Discover',
                }}
            />
            <Tabs.Screen
                name="updates"
                options={{
                    title: 'Updates',
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    href: null, // Hidden from tab bar, accessed via More sheet
                }}
            />
        </Tabs>
    );
}

