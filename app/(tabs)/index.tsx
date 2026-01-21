import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { useStore, Article } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { Plus, X, Search, Filter } from 'lucide-react-native';
import { MotiView } from 'moti';
import { colors, spacing, radius, textStyles } from '../../src/theme/tokens';
import { ContextActionBar } from '../../src/components/nav';

export default function FeedScreen() {
    const { articles, feeds, refreshAllFeeds, addFeed, saveArticle } = useStore();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [showAddFeed, setShowAddFeed] = useState(false);
    const [newFeedUrl, setNewFeedUrl] = useState('');

    useEffect(() => {
        if (feeds.length === 0) {
            // Add a default feed for demo purposes
            addFeed({
                id: 'https://www.theverge.com/rss/index.xml',
                url: 'https://www.theverge.com/rss/index.xml',
                title: 'The Verge',
            });
        } else {
            // Initial load
            refreshAllFeeds();
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshAllFeeds();
        setRefreshing(false);
    };

    const handleAddFeed = async () => {
        if (!newFeedUrl) return;
        try {
            await addFeed({
                id: newFeedUrl,
                url: newFeedUrl,
                title: 'New Feed'
            });
            setNewFeedUrl('');
            setShowAddFeed(false);
        } catch (e) {
            alert('Failed to add feed');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Typography variant="displayMedium">Discover</Typography>
                    <Typography variant="bodySmall" color={colors.text3}>
                        {articles.length} articles from {feeds.length} sources
                    </Typography>
                </View>
            </View>

            {showAddFeed && (
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={styles.addFeedContainer}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Enter RSS URL..."
                        placeholderTextColor={colors.text3}
                        value={newFeedUrl}
                        onChangeText={setNewFeedUrl}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={handleAddFeed} style={styles.addConfirmButton}>
                        <Typography variant="bodyMedium" color="white">Add</Typography>
                    </TouchableOpacity>
                </MotiView>
            )}
        </View>
    );

    return (
        <Screen style={styles.container}>
            <FlashList
                data={articles}
                renderItem={({ item }: { item: Article }) => (
                    <FeedCard
                        article={item}
                        onPress={() => router.push(`/reader/${encodeURIComponent(item.id)}`)}
                        onSave={() => saveArticle(item)}
                    />
                )}
                estimatedItemSize={200}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: spacing[24] }}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />

            {/* Navigation Context Action Bar */}
            <ContextActionBar
                style={{ bottom: spacing[20] + 16 }} // Positioned above the tab bar
                actions={[
                    {
                        id: 'add',
                        icon: showAddFeed ? X : Plus,
                        label: showAddFeed ? 'Close' : 'Add Feed',
                        onPress: () => setShowAddFeed(!showAddFeed),
                        isActive: showAddFeed,
                    },
                    {
                        id: 'filter',
                        icon: Filter,
                        label: 'Filter',
                        onPress: () => console.log('Filter pressed'),
                    },
                ]}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        paddingTop: spacing[6],
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    headerAction: {
        padding: spacing[1],
    },
    addFeedContainer: {
        marginTop: spacing[4],
        flexDirection: 'row',
        gap: spacing[2],
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing[3],
        color: colors.text,
        fontFamily: typography.fonts.sans,
        fontSize: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addConfirmButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing[4],
        justifyContent: 'center',
        borderRadius: radius.md,
    }
});
