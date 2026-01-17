import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from './Typography';
import { PALETTE, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { Article } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Share2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface Props {
    article: Article;
    onPress: () => void;
    onSave: () => void;
}

export const FeedCard: React.FC<Props> = ({ article, onPress, onSave }) => {
    const handleSave = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSave();
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
        >
            <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.content}>
                <Typography variant="body" color={PALETTE.textSecondary} numberOfLines={2} style={styles.summaryTop}>
                    {article.summary}
                </Typography>

                <Typography variant="h2" style={styles.title}>
                    {article.title}
                </Typography>

                <View style={styles.footer}>
                    <View style={styles.meta}>
                        <Image
                            source={{ uri: `https://www.google.com/s2/favicons?domain=${article.feedId ? new URL(article.feedId).hostname : 'rss.com'}&sz=32` }}
                            style={styles.favicon}
                        />
                        <Typography variant="caption" color={PALETTE.textTertiary}>
                            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        </Typography>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                            <Bookmark size={16} color={article.isSaved ? PALETTE.accent : PALETTE.textTertiary} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Share2 size={16} color={PALETTE.textTertiary} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.divider} />
        </MotiView>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    summaryTop: {
        marginBottom: SPACING.xs,
        fontSize: 15,
        lineHeight: 20,
        fontFamily: TYPOGRAPHY.fonts.body,
    },
    title: {
        marginBottom: SPACING.sm,
        fontSize: 20,
        lineHeight: 26,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favicon: {
        width: 14,
        height: 14,
        borderRadius: 2,
        marginRight: SPACING.sm,
        backgroundColor: PALETTE.elementBackground,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: PALETTE.border,
        marginHorizontal: SPACING.md,
    }
});
