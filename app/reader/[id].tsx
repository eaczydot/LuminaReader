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
} from '../../src/components/reader';
import { ContextActionBar, Action } from '../../src/components/nav';
import { Bookmark, FileText, Share2 } from 'lucide-react-native';
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
                <ArticleHeader
                    title={article.title}
                    source={article.source}
                    publishedAt={article.publishedAt}
                    readTime={article.readTime}
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

                    {/* Separator line for content if summary exists */}
                    {article.summary && <View style={styles.contentSeparator} />}

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

            {/* Contextual Action Bar */}
            <ContextActionBar
                actions={[
                    {
                        id: 'save',
                        icon: Bookmark,
                        label: article.isSaved ? 'Saved' : 'Save',
                        isActive: article.isSaved,
                        onPress: handleSave,
                    },
                    {
                        id: 'note',
                        icon: FileText,
                        label: 'Note',
                        onPress: () => console.log('Add note'),
                    },
                    {
                        id: 'share',
                        icon: Share2,
                        label: 'Share',
                        onPress: () => console.log('Share'),
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
        marginBottom: spacing[4],
    },
    summaryLabel: {
        ...textStyles.labelSmall,
        color: colors.text3,
        marginBottom: spacing[1.5],
    },
    summaryText: {
        ...textStyles.bodyLarge, // Premium serif for the AI summary
        color: colors.text,
        fontSize: typography.sizes.lg,
        lineHeight: typography.sizes.lg * 1.5,
    },
    contentSeparator: {
        height: 1,
        backgroundColor: colors.separator,
        marginVertical: spacing[5],
    },
});

