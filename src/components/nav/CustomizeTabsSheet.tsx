/**
 * CustomizeTabsSheet Component
 * Sheet for reordering tabs, toggling visibility, and pinning quick actions
 */

import React, {
    useCallback,
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    ScrollView,
    Platform,
    Switch,
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
    GripVertical,
    Check,
    X,
    Home,
    Bell,
    Bookmark,
    Search,
    Settings,
    LucideIcon,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, blur, animation } from '../../theme/tokens';
import { useStore } from '../../store/useStore';

export interface CustomizeTabsSheetRef {
    open: () => void;
    close: () => void;
}

interface TabConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    required?: boolean; // Cannot be hidden
}

const ALL_TABS: TabConfig[] = [
    { id: 'index', label: 'Discover', icon: Home, required: true },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'library', label: 'Library', icon: Bookmark, required: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
];

interface CustomizeTabsSheetProps {
    onSave?: () => void;
}

export const CustomizeTabsSheet = forwardRef<CustomizeTabsSheetRef, CustomizeTabsSheetProps>(
    ({ onSave }, ref) => {
        const [visible, setVisible] = useState(false);
        const translateY = useSharedValue(500);
        const backdropOpacity = useSharedValue(0);

        const {
            tabPreferences,
            setTabOrder,
            toggleTabVisibility,
        } = useStore();

        const [localOrder, setLocalOrder] = useState<string[]>(tabPreferences.order);
        const [localVisible, setLocalVisible] = useState<Record<string, boolean>>(
            tabPreferences.visible
        );

        // Sync with store when opening
        useEffect(() => {
            if (visible) {
                setLocalOrder(tabPreferences.order);
                setLocalVisible(tabPreferences.visible);
            }
        }, [visible, tabPreferences]);

        const open = useCallback(() => {
            setVisible(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            backdropOpacity.value = withTiming(1, { duration: animation.duration.normal });
            translateY.value = withSpring(0, animation.spring.snappy);
        }, []);

        const close = useCallback(() => {
            backdropOpacity.value = withTiming(0, { duration: animation.duration.fast });
            translateY.value = withSpring(500, animation.spring.snappy, () => {
                runOnJS(setVisible)(false);
            });
        }, []);

        useImperativeHandle(ref, () => ({ open, close }), [open, close]);

        const handleSave = useCallback(() => {
            // Save to store
            setTabOrder(localOrder);
            Object.entries(localVisible).forEach(([tabId, isVisible]) => {
                if (tabPreferences.visible[tabId] !== isVisible) {
                    toggleTabVisibility(tabId);
                }
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            close();
            onSave?.();
        }, [localOrder, localVisible, setTabOrder, toggleTabVisibility, close, onSave, tabPreferences.visible]);

        const handleCancel = useCallback(() => {
            close();
        }, [close]);

        const handleToggleVisibility = useCallback((tabId: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLocalVisible((prev) => ({
                ...prev,
                [tabId]: !prev[tabId],
            }));
        }, []);

        const moveTab = useCallback((tabId: string, direction: 'up' | 'down') => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLocalOrder((prev) => {
                const index = prev.indexOf(tabId);
                if (index === -1) return prev;

                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex < 0 || newIndex >= prev.length) return prev;

                const newOrder = [...prev];
                [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
                return newOrder;
            });
        }, []);

        const animatedSheetStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
        }));

        const animatedBackdropStyle = useAnimatedStyle(() => ({
            opacity: backdropOpacity.value,
        }));

        if (!visible) return null;

        const SheetBackground = blur.isSupported ? BlurView : View;
        const sheetBgProps = blur.isSupported
            ? { intensity: blur.medium, tint: blur.tint }
            : {};

        // Sort tabs by current order
        const sortedTabs = [...ALL_TABS].sort((a, b) => {
            const indexA = localOrder.indexOf(a.id);
            const indexB = localOrder.indexOf(b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return (
            <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
                <View style={styles.backdrop}>
                    <Animated.View style={[StyleSheet.absoluteFill, animatedBackdropStyle]}>
                        <Pressable style={styles.backdropTouchable} onPress={handleCancel} />
                    </Animated.View>

                    <Animated.View style={[styles.sheetContainer, animatedSheetStyle]}>
                        <SheetBackground
                            style={[
                                styles.sheet,
                                !blur.isSupported && { backgroundColor: colors.surface },
                            ]}
                            {...sheetBgProps}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                                    <X size={24} color={colors.text2} strokeWidth={1.5} />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Customize Tabs</Text>
                                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                                    <Check size={24} color={colors.accent} strokeWidth={2} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.content}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Tabs List */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Tab Order</Text>
                                    <Text style={styles.sectionDescription}>
                                        Toggle visibility and reorder tabs. First 4 visible tabs appear in the bar.
                                    </Text>

                                    {sortedTabs.map((tab, index) => {
                                        const isVisible = localVisible[tab.id] ?? true;
                                        const Icon = tab.icon;

                                        return (
                                            <View key={tab.id} style={styles.tabRow}>
                                                <View style={styles.tabRowLeft}>
                                                    <TouchableOpacity
                                                        style={styles.dragHandle}
                                                        onPress={() => moveTab(tab.id, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <GripVertical
                                                            size={18}
                                                            color={index === 0 ? colors.muted : colors.text3}
                                                            strokeWidth={1.5}
                                                        />
                                                    </TouchableOpacity>
                                                    <View
                                                        style={[
                                                            styles.tabIcon,
                                                            !isVisible && styles.tabIconDisabled,
                                                        ]}
                                                    >
                                                        <Icon
                                                            size={18}
                                                            color={isVisible ? colors.text : colors.muted}
                                                            strokeWidth={1.5}
                                                        />
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.tabLabel,
                                                            !isVisible && styles.tabLabelDisabled,
                                                        ]}
                                                    >
                                                        {tab.label}
                                                    </Text>
                                                    {tab.required && (
                                                        <View style={styles.requiredBadge}>
                                                            <Text style={styles.requiredText}>Required</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                {!tab.required && (
                                                    <Switch
                                                        value={isVisible}
                                                        onValueChange={() => handleToggleVisibility(tab.id)}
                                                        trackColor={{
                                                            false: colors.surface2,
                                                            true: colors.accent,
                                                        }}
                                                        thumbColor={colors.text}
                                                        ios_backgroundColor={colors.surface2}
                                                    />
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>

                                {/* Info */}
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        Tip: Long-press the tab bar to open this sheet quickly.
                                    </Text>
                                </View>
                            </ScrollView>
                        </SheetBackground>
                    </Animated.View>
                </View>
            </Modal>
        );
    }
);

CustomizeTabsSheet.displayName = 'CustomizeTabsSheet';

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
        maxHeight: '85%',
    },
    sheet: {
        borderTopLeftRadius: radius['2xl'],
        borderTopRightRadius: radius['2xl'],
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    headerButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.lg,
        color: colors.text,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing[4],
    },
    section: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.sm,
        color: colors.text3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing[1],
    },
    sectionDescription: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.base,
        color: colors.text2,
        marginBottom: spacing[4],
        lineHeight: 20,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    tabRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    dragHandle: {
        padding: spacing[1],
    },
    tabIcon: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.surface2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconDisabled: {
        backgroundColor: colors.surface,
    },
    tabLabel: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.lg,
        color: colors.text,
    },
    tabLabelDisabled: {
        color: colors.muted,
    },
    requiredBadge: {
        backgroundColor: colors.chipBg,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: radius.sm,
    },
    requiredText: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        color: colors.text3,
    },
    infoBox: {
        backgroundColor: colors.surface2,
        borderRadius: radius.lg,
        padding: spacing[4],
    },
    infoText: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.base,
        color: colors.text2,
        lineHeight: 20,
    },
});
