import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, textStyles } from '../theme/tokens';
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
                <Typography variant="body" color={colors.text2} numberOfLines={2} style={styles.summaryTop}>
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
                        <Typography variant="caption" color={colors.text3}>
                            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        </Typography>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                            <Bookmark size={16} color={article.isSaved ? colors.accent : colors.text3} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Share2 size={16} color={colors.text3} strokeWidth={2} />
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
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[3],
    },
    summaryTop: {
        marginBottom: spacing[1],
        ...textStyles.bodySmall,
        color: colors.text2,
    },
    title: {
        marginBottom: spacing[2],
        ...textStyles.h2,
        color: colors.text,
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
        marginRight: spacing[2],
        backgroundColor: colors.surface,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing[4],
    },
    actionButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.separator,
        marginHorizontal: spacing[4],
    }
});
