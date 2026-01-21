/**
 * ContextActionBar Component
 * Floating action bar that adapts its content based on context (Linear-inspired)
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../Typography';
import { colors, spacing, radius, blur, elevation, textStyles } from '../../theme/tokens';
import { LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface Action {
    id: string;
    icon: LucideIcon;
    label: string;
    onPress: () => void;
    color?: string;
    isActive?: boolean;
}

interface ContextActionBarProps {
    actions: Action[];
    style?: any;
}

const insets = useSafeAreaInsets();
const canUseBlur = blur.isSupported && BlurView;
const Container = canUseBlur ? BlurView : View;

const handlePress = (onPress: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
};

return (
    <View style={[
        styles.outerContainer,
        { bottom: Math.max(insets.bottom, spacing[4]) },
        style
    ]}>
        <Container
            intensity={blur.medium}
            tint={blur.tint === 'dark' ? 'dark' : 'light'}
            style={[
                styles.innerContainer,
                !canUseBlur && { backgroundColor: colors.surface }
            ]}
        >
            {actions.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    style={styles.actionButton}
                    onPress={() => handlePress(action.onPress)}
                    activeOpacity={0.7}
                >
                    <action.icon
                        size={18}
                        color={action.isActive ? colors.accent : (action.color || colors.text2)}
                        strokeWidth={action.isActive ? 2 : 1.5}
                    />
                    <Typography
                        variant="labelSmall"
                        style={[
                            styles.actionLabel,
                            { color: action.isActive ? colors.accent : (action.color || colors.text2) }
                        ]}
                    >
                        {action.label}
                    </Typography>
                </TouchableOpacity>
            ))}
        </Container>
    </View>
);
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        alignSelf: 'center',
        width: 'auto',
        minWidth: 200,
        maxWidth: '90%',
        ...Platform.select({
            ios: elevation.md,
            android: { elevation: 8 },
        }),
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[2],
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[1],
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        minWidth: 70,
    },
    actionLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
