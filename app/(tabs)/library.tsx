import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { FeedCard } from '../../src/components/FeedCard';
import { SPACING, PALETTE } from '../../src/constants/theme';
import { useStore, Article } from '../../src/store/useStore';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
    const { savedArticles, unsaveArticle } = useStore();
    const router = useRouter();

    const renderHeader = () => (
        <View style={styles.header}>
            <Typography variant="h1">Library</Typography>
            <Typography variant="body" color={PALETTE.textSecondary}>
                {savedArticles.length} saved articles
            </Typography>
        </View>
    );

    return (
        <Screen style={styles.container}>
            <FlashList
                data={savedArticles}
                renderItem={({ item }: { item: Article }) => (
                    <FeedCard
                        article={item}
                        onPress={() => router.push(`/reader/${encodeURIComponent(item.id)}`)}
                        onSave={() => unsaveArticle(item.id)} // Toggle save (remove from library)
                    />
                )}
                estimatedItemSize={200}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Typography color={PALETTE.textTertiary}>No saved articles yet.</Typography>
                    </View>
                )}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    empty: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    }
});
