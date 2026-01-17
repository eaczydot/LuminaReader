import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { SPACING, PALETTE, RADIUS } from '../../src/constants/theme';
import { useStore, Article } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { MotiView } from 'moti';

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
                    <Typography variant="display" style={{ fontSize: 32 }}>Discover</Typography>
                    <Typography variant="body" color={PALETTE.textTertiary}>
                        {articles.length} articles from {feeds.length} sources
                    </Typography>
                </View>
                <TouchableOpacity onPress={() => setShowAddFeed(!showAddFeed)} style={styles.headerAction}>
                    {showAddFeed ? <X color={PALETTE.textPrimary} size={24} strokeWidth={1.5} /> : <Plus color={PALETTE.textPrimary} size={24} strokeWidth={1.5} />}
                </TouchableOpacity>
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
                        placeholderTextColor={PALETTE.textTertiary}
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
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: SPACING.xl,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    headerAction: {
        padding: SPACING.xs,
    },
    addFeedContainer: {
        marginTop: SPACING.lg,
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: PALETTE.elementBackground,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: PALETTE.textPrimary,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    addConfirmButton: {
        backgroundColor: PALETTE.accent,
        paddingHorizontal: SPACING.lg,
        justifyContent: 'center',
        borderRadius: RADIUS.md,
    }
});
