/**
 * Search Screen
 * Global search across articles and entities
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { useStore, Article, Entity } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import {
    Search as SearchIcon,
    X,
    User,
    Building2,
    Hash,
    TrendingUp,
} from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../src/theme/tokens';
import * as Haptics from 'expo-haptics';

type ResultType = 'article' | 'entity';

interface SearchResult {
    type: ResultType;
    item: Article | Entity;
}

export default function SearchScreen() {
    const { articles, entities, saveArticle } = useStore();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Search results
    const results = useMemo(() => {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // Search articles
        articles.forEach((article) => {
            const titleMatch = article.title.toLowerCase().includes(lowerQuery);
            const summaryMatch = article.summary?.toLowerCase().includes(lowerQuery);
            const tagMatch = article.tags.some((tag) =>
                tag.toLowerCase().includes(lowerQuery)
            );

            if (titleMatch || summaryMatch || tagMatch) {
                searchResults.push({ type: 'article', item: article });
            }
        });

        // Search entities
        Object.values(entities).forEach((entity) => {
            const nameMatch = entity.name.toLowerCase().includes(lowerQuery);
            if (nameMatch) {
                searchResults.push({ type: 'entity', item: entity });
            }
        });

        return searchResults;
    }, [query, articles, entities]);

    // Recent/suggested entities for empty state
    const suggestedEntities = useMemo(() => {
        return Object.values(entities)
            .filter((e) => e.type === 'person' || e.type === 'company')
            .slice(0, 6);
    }, [entities]);

    const handleClear = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuery('');
    }, []);

    const handleEntityPress = useCallback(
        (entity: Entity) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Keyboard.dismiss();
            router.push(`/entity/${entity.id}`);
        },
        [router]
    );

    const getEntityIcon = (type: Entity['type']) => {
        switch (type) {
            case 'person':
                return <User size={16} color={colors.entityPerson} strokeWidth={1.5} />;
            case 'company':
                return <Building2 size={16} color={colors.entityCompany} strokeWidth={1.5} />;
            case 'topic':
                return <Hash size={16} color={colors.entityTopic} strokeWidth={1.5} />;
        }
    };

    const renderResult = ({ item }: { item: SearchResult }) => {
        if (item.type === 'article') {
            const article = item.item as Article;
            return (
                <FeedCard
                    article={article}
                    onPress={() => {
                        Keyboard.dismiss();
                        router.push(`/reader/${encodeURIComponent(article.id)}`);
                    }}
                    onSave={() => saveArticle(article)}
                />
            );
        }

        const entity = item.item as Entity;
        return (
            <TouchableOpacity
                style={styles.entityResult}
                onPress={() => handleEntityPress(entity)}
            >
                <View style={styles.entityIcon}>{getEntityIcon(entity.type)}</View>
                <View style={styles.entityInfo}>
                    <Typography variant="bodyMedium" style={styles.entityName}>
                        {entity.name}
                    </Typography>
                    <Typography variant="caption" color={colors.text3}>
                        {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                    </Typography>
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View style={styles.header}>
            <Typography variant="display" style={styles.headerTitle}>
                Search
            </Typography>

            {/* Search input */}
            <View
                style={[
                    styles.searchContainer,
                    isFocused && styles.searchContainerFocused,
                ]}
            >
                <SearchIcon size={20} color={colors.text3} strokeWidth={1.5} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Articles, people, topics..."
                    placeholderTextColor={colors.text3}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <X size={18} color={colors.text3} strokeWidth={1.5} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            {query.length === 0 ? (
                <>
                    {/* Suggested entities */}
                    <View style={styles.suggestedSection}>
                        <View style={styles.suggestedHeader}>
                            <TrendingUp size={16} color={colors.text3} strokeWidth={1.5} />
                            <Typography variant="caption" color={colors.text3} style={styles.suggestedLabel}>
                                SUGGESTED
                            </Typography>
                        </View>
                        <View style={styles.suggestedGrid}>
                            {suggestedEntities.map((entity) => (
                                <TouchableOpacity
                                    key={entity.id}
                                    style={styles.suggestedChip}
                                    onPress={() => handleEntityPress(entity)}
                                >
                                    {getEntityIcon(entity.type)}
                                    <Typography variant="body" style={styles.suggestedChipText}>
                                        {entity.name}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.noResults}>
                    <SearchIcon size={48} color={colors.muted} strokeWidth={1} />
                    <Typography variant="h3" color={colors.text2} style={styles.noResultsTitle}>
                        No results
                    </Typography>
                    <Typography variant="body" color={colors.text3}>
                        Try a different search term
                    </Typography>
                </View>
            )}
        </View>
    );

    return (
        <Screen style={styles.container}>
            <FlashList
                data={results}
                renderItem={renderResult}
                estimatedItemSize={100}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={EmptyState}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
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
        paddingBottom: spacing[4],
    },
    headerTitle: {
        fontFamily: typography.fonts.displayBold,
        fontSize: typography.sizes['3xl'],
        color: colors.text,
        marginBottom: spacing[4],
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[3],
        gap: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchContainerFocused: {
        borderColor: colors.accent,
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.lg,
        color: colors.text,
        padding: 0,
    },
    clearButton: {
        padding: spacing[1],
    },
    emptyState: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[6],
    },
    suggestedSection: {
        gap: spacing[3],
    },
    suggestedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    suggestedLabel: {
        letterSpacing: 0.5,
    },
    suggestedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    suggestedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        backgroundColor: colors.surface,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    suggestedChipText: {
        color: colors.text,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: spacing[16],
    },
    noResultsTitle: {
        marginTop: spacing[4],
        marginBottom: spacing[2],
    },
    entityResult: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        gap: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    entityIcon: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    entityInfo: {
        flex: 1,
    },
    entityName: {
        color: colors.text,
    },
});
