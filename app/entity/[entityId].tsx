/**
 * Entity Detail Screen
 * Shows entity information, parent paths, and articles grouped by context
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { useStore } from '../../src/store/useStore';
import { colors, typography, spacing, radius, textStyles } from '../../src/theme/tokens';
import { User, Building2, Hash, ChevronDown, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EntityDetailScreen() {
    const { entityId } = useLocalSearchParams();
    const router = useRouter();
    const {
        getEntity,
        getEntityPaths,
        getArticlesGroupedByContext,
        saveArticle,
        markAsRead,
        entities,
    } = useStore();

    const insets = useSafeAreaInsets();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const entity = getEntity(entityId as string);
    const paths = entity ? getEntityPaths(entity.id) : [];
    const groupedArticles = entity ? getArticlesGroupedByContext(entity.id) : {};

    if (!entity) {
        return (
            <Screen style={styles.center}>
                <Typography variant="h3" color={colors.text2}>
                    Entity not found
                </Typography>
            </Screen>
        );
    }

    const getEntityIcon = (type: typeof entity.type, size = 16) => {
        const iconColor = colors.text;
        switch (type) {
            case 'person':
                return <User size={size} color={iconColor} strokeWidth={1.5} />;
            case 'company':
                return <Building2 size={size} color={iconColor} strokeWidth={1.5} />;
            case 'topic':
                return <Hash size={size} color={iconColor} strokeWidth={1.5} />;
        }
    };

    const toggleSection = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Screen style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing[4]) }]}>
                    <View style={styles.headerTop}>
                        {entity.type === 'company' && entity.favicon ? (
                            <Image source={{ uri: entity.favicon }} style={styles.headerFavicon} />
                        ) : (
                            <View style={styles.headerIconContainer}>
                                {getEntityIcon(entity.type, 18)}
                            </View>
                        )}
                        <Typography variant="labelSmall" color={colors.text3} style={styles.entityLabel}>
                            {entity.type.toUpperCase()}
                        </Typography>
                    </View>
                    <Typography variant="displayMedium" style={styles.title}>
                        {entity.name}
                    </Typography>
                </View>

                {/* Paths Section */}
                {paths.length > 0 && (
                    <View style={styles.section}>
                        <Typography variant="caption" style={styles.sectionLabel}>
                            PATHS
                        </Typography>
                        <View style={styles.pathsContainer}>
                            {paths.map((path, index) => (
                                <View key={index} style={styles.pathChip}>
                                    <Typography variant="caption" style={styles.pathText}>
                                        {path.join(' › ')}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Articles Grouped by Context */}
                <View style={styles.section}>
                    <Typography variant="caption" style={styles.sectionLabel}>
                        ARTICLES
                    </Typography>

                    {Object.entries(groupedArticles).map(([contextKey, articles]) => {
                        const isExpanded = expandedSections[contextKey] !== false; // Default to expanded
                        const contextEntity =
                            contextKey !== '_general' ? entities[contextKey] : null;
                        const sectionTitle = contextEntity
                            ? `In context of ${contextEntity.name}`
                            : 'General';

                        return (
                            <View key={contextKey} style={styles.contextSection}>
                                <TouchableOpacity
                                    style={styles.contextHeader}
                                    onPress={() => toggleSection(contextKey)}
                                >
                                    {isExpanded ? (
                                        <ChevronDown
                                            size={16}
                                            color={colors.text3}
                                            strokeWidth={1.5}
                                        />
                                    ) : (
                                        <ChevronRight
                                            size={16}
                                            color={colors.text3}
                                            strokeWidth={1.5}
                                        />
                                    )}
                                    <Typography variant="bodyMedium" color={colors.text2}>
                                        {sectionTitle}
                                    </Typography>
                                    <Typography variant="caption" color={colors.text3}>
                                        ({articles.length})
                                    </Typography>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.articlesList}>
                                        {articles.map((article) => (
                                            <FeedCard
                                                key={article.id}
                                                article={article}
                                                onPress={() => {
                                                    markAsRead(article.id);
                                                    router.push(
                                                        `/reader/${encodeURIComponent(article.id)}`
                                                    );
                                                }}
                                                onSave={() => saveArticle(article)}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {Object.keys(groupedArticles).length === 0 && (
                        <View style={styles.emptyState}>
                            <Typography variant="body" color={colors.text3}>
                                No articles found for this entity
                            </Typography>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: spacing[16],
    },
    header: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    headerIconContainer: {
        width: 24,
        height: 24,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerFavicon: {
        width: 24,
        height: 24,
        borderRadius: radius.sm,
    },
    entityLabel: {
        letterSpacing: 1,
    },
    title: {
        ...textStyles.displayMedium,
        color: colors.text,
    },
    section: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[6],
        gap: spacing[3],
    },
    sectionLabel: {
        ...textStyles.labelSmall,
        color: colors.text3,
    },
    pathsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    pathChip: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
    },
    pathText: {
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.sm,
        color: colors.text2,
    },
    contextSection: {
        marginTop: spacing[4],
    },
    contextHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingVertical: spacing[2],
    },
    articlesList: {
        marginTop: spacing[2],
    },
    emptyState: {
        paddingVertical: spacing[8],
        alignItems: 'center',
    },
});
