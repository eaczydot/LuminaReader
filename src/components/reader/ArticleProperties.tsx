/**
 * ArticleProperties Component
 * Properties panel with entity chips and tags
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { LabelChips } from './LabelChips';
import { colors, typography, spacing } from '../../theme/tokens';
import { Entity } from '../../store/useStore';

interface ArticlePropertiesProps {
    entities?: Entity[];
    tags?: string[];
    onEntityPress?: (entity: Entity) => void;
    onTagPress?: (tag: string) => void;
}

export function ArticleProperties({
    entities = [],
    tags = [],
    onEntityPress,
    onTagPress,
}: ArticlePropertiesProps) {
    if (entities.length === 0 && tags.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {entities.length > 0 && (
                <View style={styles.section}>
                    <Typography variant="caption" style={styles.sectionLabel}>
                        ENTITIES
                    </Typography>
                    <LabelChips
                        entities={entities}
                        onEntityPress={onEntityPress}
                        maxVisible={6}
                    />
                </View>
            )}

            {tags.length > 0 && (
                <View style={styles.section}>
                    <Typography variant="caption" style={styles.sectionLabel}>
                        TAGS
                    </Typography>
                    <LabelChips
                        tags={tags}
                        onTagPress={onTagPress}
                        maxVisible={6}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        gap: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    section: {
        gap: spacing[2],
    },
    sectionLabel: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        color: colors.text3,
        letterSpacing: 0.5,
    },
});
