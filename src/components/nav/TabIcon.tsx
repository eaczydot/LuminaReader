/**
 * TabIcon Component
 * Individual tab icon with label, badge, and animated pressed state
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, tabBar, animation } from '../../theme/tokens';

interface TabIconProps {
    icon: React.ReactNode;
    label: string;
    focused: boolean;
    badge?: number;
    onPress: () => void;
    onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TabIcon({
    icon,
    label,
    focused,
    badge,
    onPress,
    onLongPress,
}: TabIconProps) {
    const pressed = useSharedValue(0);

    const handlePressIn = useCallback(() => {
        pressed.value = withSpring(1, animation.spring.snappy);
    }, [pressed]);

    const handlePressOut = useCallback(() => {
        pressed.value = withSpring(0, animation.spring.snappy);
    }, [pressed]);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress]);

    const handleLongPress = useCallback(() => {
        if (onLongPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onLongPress();
        }
    }, [onLongPress]);

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(pressed.value, [0, 1], [1, tabBar.pressedScale]);
        const opacity = interpolate(pressed.value, [0, 1], [1, tabBar.pressedOpacity]);

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <AnimatedPressable
            style={[styles.container, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={400}
        >
            <View style={styles.iconContainer}>
                {icon}
                {badge !== undefined && badge > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {badge > 99 ? '99+' : badge}
                        </Text>
                    </View>
                )}
            </View>
            <Text
                style={[
                    styles.label,
                    { color: focused ? colors.tabActive : colors.tabInactive },
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[1],
    },
    iconContainer: {
        position: 'relative',
        marginBottom: tabBar.spacing,
    },
    label: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: tabBar.labelSize,
        letterSpacing: typography.tracking.normal,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: tabBar.badgeSize,
        height: tabBar.badgeSize,
        borderRadius: tabBar.badgeSize / 2,
        backgroundColor: colors.tabBadge,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontFamily: typography.fonts.sansBold,
        fontSize: tabBar.badgeFontSize,
        color: colors.text,
        fontWeight: '600',
    },
});
