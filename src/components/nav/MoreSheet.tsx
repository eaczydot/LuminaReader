/**
 * MoreSheet Component
 * Bottom sheet showing hidden tabs, settings, and customize option
 */

import React, { useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    Settings,
    Sliders,
    ChevronRight,
    Bell,
    Search,
    LucideIcon,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, elevation, blur, animation } from '../../theme/tokens';

export interface MoreSheetRef {
    open: () => void;
    close: () => void;
}

interface QuickAction {
    id: string;
    label: string;
    icon: LucideIcon;
    onPress: () => void;
}

interface HiddenTab {
    id: string;
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
}

interface MoreSheetProps {
    quickActions?: QuickAction[];
    hiddenTabs?: HiddenTab[];
    onNavigateToSettings: () => void;
    onOpenCustomize: () => void;
}

export const MoreSheet = forwardRef<MoreSheetRef, MoreSheetProps>(
    ({ quickActions = [], hiddenTabs = [], onNavigateToSettings, onOpenCustomize }, ref) => {
        const [visible, setVisible] = React.useState(false);
        const translateY = useSharedValue(300);
        const backdropOpacity = useSharedValue(0);

        const open = useCallback(() => {
            setVisible(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            backdropOpacity.value = withTiming(1, { duration: animation.duration.normal });
            translateY.value = withSpring(0, animation.spring.snappy);
        }, [backdropOpacity, translateY]);

        const close = useCallback(() => {
            backdropOpacity.value = withTiming(0, { duration: animation.duration.fast });
            translateY.value = withSpring(300, animation.spring.snappy, () => {
                runOnJS(setVisible)(false);
            });
        }, [backdropOpacity, translateY]);

        useImperativeHandle(ref, () => ({ open, close }), [open, close]);

        const animatedSheetStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
        }));

        const animatedBackdropStyle = useAnimatedStyle(() => ({
            opacity: backdropOpacity.value,
        }));

        const handleRowPress = useCallback(
            (onPress: () => void) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                close();
                setTimeout(onPress, 200);
            },
            [close]
        );

        if (!visible) return null;

        const SheetBackground = blur.isSupported ? BlurView : View;
        const sheetBgProps = blur.isSupported
            ? { intensity: blur.medium, tint: blur.tint }
            : {};

        return (
            <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
                <View style={styles.backdrop}>
                    <Animated.View style={[StyleSheet.absoluteFill, animatedBackdropStyle]}>
                        <Pressable style={styles.backdropTouchable} onPress={close} />
                    </Animated.View>

                    <Animated.View style={[styles.sheetContainer, animatedSheetStyle]}>
                        <SheetBackground
                            style={[
                                styles.sheet,
                                !blur.isSupported && { backgroundColor: colors.surface },
                            ]}
                            {...sheetBgProps}
                        >
                            {/* Handle */}
                            <View style={styles.handle} />

                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.content}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Quick Actions */}
                                {quickActions.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                                        <View style={styles.quickActionsRow}>
                                            {quickActions.map((action) => (
                                                <TouchableOpacity
                                                    key={action.id}
                                                    style={styles.quickAction}
                                                    onPress={() => handleRowPress(action.onPress)}
                                                >
                                                    <View style={styles.quickActionIcon}>
                                                        <action.icon
                                                            size={20}
                                                            color={colors.text}
                                                            strokeWidth={1.5}
                                                        />
                                                    </View>
                                                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Hidden Tabs */}
                                {hiddenTabs.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>More Tabs</Text>
                                        {hiddenTabs.map((tab) => (
                                            <TouchableOpacity
                                                key={tab.id}
                                                style={styles.row}
                                                onPress={() => handleRowPress(tab.onPress)}
                                            >
                                                <View style={styles.rowLeft}>
                                                    {tab.icon}
                                                    <Text style={styles.rowLabel}>{tab.label}</Text>
                                                </View>
                                                <ChevronRight size={18} color={colors.text3} strokeWidth={1.5} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Settings & Customize */}
                                <View style={styles.section}>
                                    <TouchableOpacity
                                        style={styles.row}
                                        onPress={() => handleRowPress(onNavigateToSettings)}
                                    >
                                        <View style={styles.rowLeft}>
                                            <Settings size={20} color={colors.text2} strokeWidth={1.5} />
                                            <Text style={styles.rowLabel}>Settings</Text>
                                        </View>
                                        <ChevronRight size={18} color={colors.text3} strokeWidth={1.5} />
                                    </TouchableOpacity>

                                    <View style={styles.divider} />

                                    <TouchableOpacity
                                        style={styles.row}
                                        onPress={() => handleRowPress(onOpenCustomize)}
                                    >
                                        <View style={styles.rowLeft}>
                                            <Sliders size={20} color={colors.text2} strokeWidth={1.5} />
                                            <Text style={styles.rowLabel}>Customize Tabs</Text>
                                        </View>
                                        <ChevronRight size={18} color={colors.text3} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </SheetBackground>
                    </Animated.View>
                </View>
            </Modal>
        );
    }
);

MoreSheet.displayName = 'MoreSheet';

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropTouchable: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetContainer: {
        maxHeight: '70%',
    },
    sheet: {
        borderTopLeftRadius: radius['2xl'],
        borderTopRightRadius: radius['2xl'],
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.separator,
        alignSelf: 'center',
        marginTop: spacing[2],
        marginBottom: spacing[3],
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
    },
    section: {
        marginBottom: spacing[5],
    },
    sectionTitle: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        color: colors.text3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing[3],
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    quickAction: {
        flex: 1,
        backgroundColor: colors.surface2,
        borderRadius: radius.lg,
        padding: spacing[3],
        alignItems: 'center',
        gap: spacing[2],
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.chipBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing[3],
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    rowLabel: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.lg,
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.separator,
    },
});
