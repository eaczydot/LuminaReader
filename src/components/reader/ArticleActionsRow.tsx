/**
 * ArticleActionsRow Component
 * Compact action bar for article interactions
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { colors, spacing, radius, textStyles } from '../../theme/tokens';
import { Bookmark, FileText, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ArticleActionsRowProps {
    isSaved?: boolean;
    onSave?: () => void;
    onAddNote?: () => void;
    onShare?: () => void;
}

export function ArticleActionsRow({
    isSaved = false,
    onSave,
    onAddNote,
    onShare,
}: ArticleActionsRowProps) {
    const handleAction = (action?: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action?.();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                onPress={() => handleAction(onSave)}
            >
                <Bookmark
                    size={16}
                    color={isSaved ? colors.accent : colors.text2}
                    strokeWidth={1.5}
                    fill={isSaved ? colors.accent : 'transparent'}
                />
                <Typography
                    variant="caption"
                    color={isSaved ? colors.accent : colors.text2}
                    style={styles.actionLabel}
                >
                    {isSaved ? 'Saved' : 'Save'}
                </Typography>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(onAddNote)}
            >
                <FileText size={16} color={colors.text2} strokeWidth={1.5} />
                <Typography variant="caption" color={colors.text2} style={styles.actionLabel}>
                    Note
                </Typography>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(onShare)}
            >
                <Share2 size={16} color={colors.text2} strokeWidth={1.5} />
                <Typography variant="caption" color={colors.text2} style={styles.actionLabel}>
                    Share
                </Typography>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        gap: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1.5],
        paddingHorizontal: spacing[2.5],
        paddingVertical: spacing[1.5],
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionButtonActive: {
        backgroundColor: colors.accentMuted,
        borderColor: colors.accent,
    },
    actionLabel: {
        ...textStyles.labelSmall,
    },
});

