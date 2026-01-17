/**
 * Updates Screen (Inbox analog)
 * Shows unread/new articles, feed refresh status, and highlights
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { useStore, Article } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { Bell, RefreshCw, Sparkles } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../src/theme/tokens';
import { formatDistanceToNow } from 'date-fns';

type SectionType = 'new' | 'today' | 'earlier';

interface Section {
    type: SectionType;
    title: string;
    data: Article[];
}

export default function UpdatesScreen() {
    const { articles, savedArticles, refreshAllFeeds, saveArticle, markAsRead } = useStore();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    // Separate articles into sections
    const sections = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

        const unread = articles.filter((a) => !a.isRead);
        const today = unread.filter((a) => new Date(a.publishedAt) >= todayStart);
        const earlier = unread.filter((a) => new Date(a.publishedAt) < todayStart);

        const result: Section[] = [];

        if (today.length > 0) {
            result.push({ type: 'today', title: 'Today', data: today });
        }
        if (earlier.length > 0) {
            result.push({ type: 'earlier', title: 'Earlier', data: earlier });
        }

        return result;
    }, [articles]);

    // Flatten for FlashList
    const flatData = useMemo(() => {
        const items: (Article | { type: 'header'; title: string })[] = [];
        sections.forEach((section) => {
            items.push({ type: 'header', title: section.title });
            items.push(...section.data);
        });
        return items;
    }, [sections]);

    const unreadCount = articles.filter((a) => !a.isRead).length;

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshAllFeeds();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: Article | { type: 'header'; title: string } }) => {
        if ('type' in item && item.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Typography
                        variant="caption"
                        style={styles.sectionTitle}
                    >
                        {item.title.toUpperCase()}
                    </Typography>
                </View>
            );
        }

        const article = item as Article;
        return (
            <FeedCard
                article={article}
                onPress={() => {
                    markAsRead(article.id);
                    router.push(`/reader/${encodeURIComponent(article.id)}`);
                }}
                onSave={() => saveArticle(article)}
            />
        );
    };

    const ListHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.headerTitleRow}>
                    <Bell size={24} color={colors.text} strokeWidth={1.5} />
                    <Typography variant="display" style={styles.headerTitle}>
                        Updates
                    </Typography>
                </View>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <RefreshCw
                        size={20}
                        color={colors.text2}
                        strokeWidth={1.5}
                    />
                </TouchableOpacity>
            </View>
            <Typography variant="body" color={colors.text2} style={styles.subtitle}>
                {unreadCount > 0
                    ? `${unreadCount} unread article${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up!'}
            </Typography>

            {/* Quick stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Sparkles size={16} color={colors.accent} strokeWidth={1.5} />
                    <Typography variant="bodyMedium" style={styles.statValue}>
                        {savedArticles.length}
                    </Typography>
                    <Typography variant="caption" color={colors.text3}>
                        Saved
                    </Typography>
                </View>
                <View style={styles.statCard}>
                    <Bell size={16} color={colors.entityTopic} strokeWidth={1.5} />
                    <Typography variant="bodyMedium" style={styles.statValue}>
                        {articles.length}
                    </Typography>
                    <Typography variant="caption" color={colors.text3}>
                        Total
                    </Typography>
                </View>
            </View>
        </View>
    );

    const ListEmpty = () => (
        <View style={styles.emptyState}>
            <Bell size={48} color={colors.muted} strokeWidth={1} />
            <Typography variant="h3" color={colors.text2} style={styles.emptyTitle}>
                No new updates
            </Typography>
            <Typography variant="body" color={colors.text3} style={styles.emptyDescription}>
                Add feeds to start seeing articles here
            </Typography>
        </View>
    );

    return (
        <Screen style={styles.container}>
            <FlashList
                data={flatData}
                renderItem={renderItem}
                estimatedItemSize={120}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.text2}
                    />
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    listContent: {
        paddingBottom: 100,
    },
    header: {
        paddingTop: spacing[10],
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[5],
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    headerTitle: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes['3xl'],
        color: colors.text,
    },
    refreshButton: {
        padding: spacing[2],
    },
    subtitle: {
        marginTop: spacing[1],
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing[3],
        marginTop: spacing[5],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing[4],
        alignItems: 'center',
        gap: spacing[1],
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: typography.sizes['2xl'],
        color: colors.text,
    },
    sectionHeader: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[5],
        paddingBottom: spacing[2],
    },
    sectionTitle: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        color: colors.text3,
        letterSpacing: 0.5,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[16],
        paddingHorizontal: spacing[8],
    },
    emptyTitle: {
        marginTop: spacing[4],
        marginBottom: spacing[2],
    },
    emptyDescription: {
        textAlign: 'center',
    },
});
