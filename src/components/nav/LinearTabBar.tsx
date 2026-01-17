/**
 * LinearTabBar Component
 * Custom tab bar for expo-router with iOS blur, haptics, and Linear-inspired styling
 */

import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Platform, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
    Home,
    Bell,
    Bookmark,
    Search,
    MoreHorizontal,
} from 'lucide-react-native';
import { TabIcon } from './TabIcon';
import { MoreSheet, MoreSheetRef } from './MoreSheet';
import { CustomizeTabsSheet, CustomizeTabsSheetRef } from './CustomizeTabsSheet';
import { colors, spacing, radius, blur, tabBar, elevation } from '../../theme/tokens';
import { useStore } from '../../store/useStore';

// Tab configuration
const TAB_CONFIG: Record<
    string,
    { icon: typeof Home; label: string; badge?: () => number }
> = {
    index: { icon: Home, label: 'Discover' },
    updates: {
        icon: Bell,
        label: 'Updates',
        badge: () => {
            // Could connect to store for unread count
            return 0;
        },
    },
    library: { icon: Bookmark, label: 'Library' },
    search: { icon: Search, label: 'Search' },
};

// Quick actions for the More sheet
const QUICK_ACTIONS = [
    {
        id: 'add-article',
        label: 'Add Article',
        icon: Home,
        onPress: () => {
            // TODO: Implement add article
            console.log('Add article');
        },
    },
];

interface LinearTabBarProps extends BottomTabBarProps { }

export function LinearTabBar({ state, descriptors, navigation }: LinearTabBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const moreSheetRef = useRef<MoreSheetRef>(null);
    const customizeSheetRef = useRef<CustomizeTabsSheetRef>(null);

    const { tabPreferences } = useStore();

    // Get visible tabs based on preferences
    const getVisibleTabs = useCallback(() => {
        const visibleRoutes = state.routes.filter((route) => {
            // Settings is always hidden from tab bar (accessed via More)
            if (route.name === 'settings') return false;
            // Check user preferences
            return tabPreferences.visible[route.name] !== false;
        });

        // Sort by user's preferred order
        return visibleRoutes.sort((a, b) => {
            const orderA = tabPreferences.order.indexOf(a.name);
            const orderB = tabPreferences.order.indexOf(b.name);
            if (orderA === -1) return 1;
            if (orderB === -1) return -1;
            return orderA - orderB;
        });
    }, [state.routes, tabPreferences]);

    const visibleTabs = getVisibleTabs();

    // Get hidden tabs for More sheet
    const getHiddenTabs = useCallback(() => {
        return state.routes
            .filter((route) => {
                if (route.name === 'settings') return true; // Always show in More
                return tabPreferences.visible[route.name] === false;
            })
            .map((route) => {
                const config = TAB_CONFIG[route.name];
                const Icon = config?.icon || Home;
                return {
                    id: route.name,
                    label: config?.label || route.name,
                    icon: <Icon size={20} color={colors.text2} strokeWidth={1.5} />,
                    onPress: () => {
                        navigation.navigate(route.name);
                    },
                };
            });
    }, [state.routes, tabPreferences, navigation]);

    const handleTabPress = useCallback(
        (routeName: string, isFocused: boolean) => {
            const event = navigation.emit({
                type: 'tabPress',
                target: routeName,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(routeName);
            }
        },
        [navigation]
    );

    const handleTabLongPress = useCallback(
        (routeName: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Route-specific long-press actions could be added here
            // For now, open customize sheet
            customizeSheetRef.current?.open();
        },
        []
    );

    const handleMorePress = useCallback(() => {
        moreSheetRef.current?.open();
    }, []);

    const handleMoreLongPress = useCallback(() => {
        customizeSheetRef.current?.open();
    }, []);

    const handleNavigateToSettings = useCallback(() => {
        router.push('/(tabs)/settings');
    }, [router]);

    const handleOpenCustomize = useCallback(() => {
        customizeSheetRef.current?.open();
    }, []);

    // Defensive check for BlurView native component
    // If it's iOS but the native manager is missing, fallback to View
    const canUseBlur = blur.isSupported && BlurView;

    const TabBarContainer = canUseBlur ? BlurView : View;
    const containerProps = canUseBlur
        ? { intensity: blur.heavy, tint: blur.tint }
        : {};

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        paddingBottom: insets.bottom || spacing[4],
                    },
                ]}
            >
                {/* Separator line */}
                <View style={styles.separator} />

                <TabBarContainer
                    style={[
                        styles.tabBar,
                        !blur.isSupported && { backgroundColor: colors.tabBgSolid },
                        { height: tabBar.height },
                    ]}
                    {...containerProps}
                >
                    {/* Visible tabs */}
                    {visibleTabs.map((route) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === state.routes.indexOf(route);
                        const config = TAB_CONFIG[route.name];

                        if (!config) return null;

                        const Icon = config.icon;
                        const badge = config.badge?.();

                        return (
                            <TabIcon
                                key={route.key}
                                icon={
                                    <Icon
                                        size={tabBar.iconSize}
                                        color={isFocused ? colors.tabActive : colors.tabInactive}
                                        strokeWidth={isFocused ? 2 : 1.5}
                                    />
                                }
                                label={config.label}
                                focused={isFocused}
                                badge={badge}
                                onPress={() => handleTabPress(route.name, isFocused)}
                                onLongPress={() => handleTabLongPress(route.name)}
                            />
                        );
                    })}

                    {/* More tab */}
                    <TabIcon
                        icon={
                            <MoreHorizontal
                                size={tabBar.iconSize}
                                color={colors.tabInactive}
                                strokeWidth={1.5}
                            />
                        }
                        label="More"
                        focused={false}
                        onPress={handleMorePress}
                        onLongPress={handleMoreLongPress}
                    />
                </TabBarContainer>
            </View>

            {/* Sheets */}
            <MoreSheet
                ref={moreSheetRef}
                quickActions={QUICK_ACTIONS}
                hiddenTabs={getHiddenTabs()}
                onNavigateToSettings={handleNavigateToSettings}
                onOpenCustomize={handleOpenCustomize}
            />
            <CustomizeTabsSheet ref={customizeSheetRef} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: blur.isSupported ? 'transparent' : colors.tabBgSolid,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.separator,
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...Platform.select({
            ios: {
                ...elevation.sm,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
