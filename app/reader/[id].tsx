/**
 * Article Detail Screen
 * Linear issue-detail inspired layout with properties and actions
 */

import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import {
    ArticleHeader,
    ArticleProperties,
    ArticleActionsRow,
} from '../../src/components/reader';
import { useStore } from '../../src/store/useStore';
import { colors, typography, spacing, textStyles } from '../../src/theme/tokens';
import RenderHtml from 'react-native-render-html';
import * as Haptics from 'expo-haptics';

export default function ReaderScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { articles, saveArticle, unsaveArticle, getEntitiesForArticle } = useStore();
    const { width } = useWindowDimensions();

    const article = articles.find((a) => a.id === decodeURIComponent(id as string));
    const entities = article ? getEntitiesForArticle(article.id) : [];

    if (!article) {
        return (
            <Screen style={styles.center}>
                <Typography variant="h3" color={colors.text2}>
                    Article not found
                </Typography>
            </Screen>
        );
    }

    const handleSave = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (article.isSaved) {
            unsaveArticle(article.id);
        } else {
            saveArticle(article);
        }
    };

    const handleEntityPress = (entity: any) => {
        router.push(`/entity/${entity.id}`);
    };

    // HTML rendering styles
    const htmlStyles = {
        body: {
            color: colors.text,
            fontFamily: typography.fonts.serifRegular,
            fontSize: typography.sizes.lg,
            lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
        },
        p: {
            marginBottom: spacing[4],
        },
        h1: {
            fontFamily: typography.fonts.serifBold,
            fontSize: typography.sizes['2xl'],
            color: colors.text,
            marginTop: spacing[5],
            marginBottom: spacing[2],
        },
        h2: {
            fontFamily: typography.fonts.serifBold,
            fontSize: typography.sizes.xl,
            color: colors.text,
            marginTop: spacing[4],
            marginBottom: spacing[2],
        },
        a: {
            color: colors.accent,
            textDecorationLine: 'none',
        },
    };

    return (
        <Screen safe={false} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Article Header */}
                <ArticleHeader
                    title={article.title}
                    source={article.source}
                    publishedAt={article.publishedAt}
                    readTime={article.readTime}
                />

                {/* Actions Row */}
                <ArticleActionsRow
                    isSaved={article.isSaved}
                    onSave={handleSave}
                    onAddNote={() => console.log('Add note')}
                    onShare={() => console.log('Share')}
                />

                {/* Properties (Entities & Tags) */}
                <ArticleProperties
                    entities={entities}
                    tags={article.tags}
                    onEntityPress={handleEntityPress}
                    onTagPress={(tag) => console.log('Tag pressed:', tag)}
                />

                {/* Article Content */}
                <View style={styles.contentContainer}>
                    {/* Summary Section */}
                    {article.summary && (
                        <View style={styles.summarySection}>
                            <Text style={styles.summaryLabel}>SUMMARY</Text>
                            <Text style={styles.summaryText}>{article.summary}</Text>
                        </View>
                    )}

                    {/* Article Body */}
                    <RenderHtml
                        contentWidth={width - spacing[3] * 2}
                        source={{
                            html: article.content || article.summary || '<p>No content available</p>',
                        }}
                        tagsStyles={htmlStyles as any}
                        systemFonts={[
                            typography.fonts.serifRegular,
                            typography.fonts.serifBold,
                            typography.fonts.sans,
                        ]}
                    />
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
        paddingBottom: spacing[12],
    },
    contentContainer: {
        paddingHorizontal: spacing[3],
        paddingTop: spacing[4],
    },
    summarySection: {
        marginBottom: spacing[5],
    },
    summaryLabel: {
        ...textStyles.labelSmall,
        color: colors.text3,
        marginBottom: spacing[2],
    },
    summaryText: {
        ...textStyles.bodyMedium,
        color: colors.text2,
        lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
});

