import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { colors, typography, spacing, textStyles } from '../../theme/tokens';
import { formatDistanceToNow } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing[4]) }]}>
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
        paddingBottom: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    title: {
        ...textStyles.displaySmall, // Reduced size slightly for better fit
        color: colors.text,
        marginBottom: spacing[2],
        lineHeight: typography.sizes['2xl'] * 1.2, // More breathing room
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


