/**
 * ArticleHeader Component
 * Linear issue-title analog for article detail screen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { colors, typography, spacing, textStyles } from '../../theme/tokens';
import { formatDistanceToNow } from 'date-fns';

interface ArticleHeaderProps {
    title: string;
    source?: string;
    publishedAt: string;
    readTime?: number;
}

export function ArticleHeader({
    title,
    source,
    publishedAt,
    readTime,
}: ArticleHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Article Title */}
            <Typography variant="display" style={styles.title}>
                {title}
            </Typography>

            {/* Metadata Row */}
            <View style={styles.metaRow}>
                {source && (
                    <>
                        <Typography variant="body" color={colors.text2} style={styles.metaText}>
                            {source}
                        </Typography>
                        <Typography variant="body" color={colors.text3} style={styles.metaText}>
                            {' • '}
                        </Typography>
                    </>
                )}
                <Typography variant="body" color={colors.text2} style={styles.metaText}>
                    {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
                </Typography>
                {readTime && (
                    <>
                        <Typography variant="body" color={colors.text3} style={styles.metaText}>
                            {' • '}
                        </Typography>
                        <Typography variant="body" color={colors.text2} style={styles.metaText}>
                            {readTime} min read
                        </Typography>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing[3],
        paddingTop: spacing[4],
        paddingBottom: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    title: {
        ...textStyles.displayMedium,
        color: colors.text,
        marginBottom: spacing[1.5],
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    metaText: {
        ...textStyles.bodySmall,
    },
});

