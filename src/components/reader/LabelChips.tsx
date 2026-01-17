/**
 * LabelChips Component
 * Linear-style label chips for tags and entity paths
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { Entity } from '../../store/useStore';
import { User, Building2, Hash } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface LabelChipsProps {
    entities?: Entity[];
    tags?: string[];
    onEntityPress?: (entity: Entity) => void;
    onTagPress?: (tag: string) => void;
    maxVisible?: number;
}

export function LabelChips({
    entities = [],
    tags = [],
    onEntityPress,
    onTagPress,
    maxVisible = 5,
}: LabelChipsProps) {
    const getEntityIcon = (type: Entity['type']) => {
        const iconSize = 12;
        const iconColor = colors.text3;

        switch (type) {
            case 'person':
                return <User size={iconSize} color={iconColor} strokeWidth={1.5} />;
            case 'company':
                return <Building2 size={iconSize} color={iconColor} strokeWidth={1.5} />;
            case 'topic':
                return <Hash size={iconSize} color={iconColor} strokeWidth={1.5} />;
        }
    };

    const allItems = [
        ...entities.map((e) => ({ type: 'entity' as const, data: e })),
        ...tags.map((t) => ({ type: 'tag' as const, data: t })),
    ];

    const visibleItems = allItems.slice(0, maxVisible);
    const overflowCount = allItems.length - maxVisible;

    return (
        <View style={styles.container}>
            {visibleItems.map((item, index) => {
                if (item.type === 'entity') {
                    const entity = item.data as Entity;
                    return (
                        <TouchableOpacity
                            key={`entity-${entity.id}`}
                            style={styles.chip}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onEntityPress?.(entity);
                            }}
                        >
                            <View style={styles.chipContent}>
                                {getEntityIcon(entity.type)}
                                <Typography variant="caption" style={styles.chipText}>
                                    {entity.name}
                                </Typography>
                            </View>
                        </TouchableOpacity>
                    );
                } else {
                    const tag = item.data as string;
                    return (
                        <TouchableOpacity
                            key={`tag-${tag}`}
                            style={styles.chip}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onTagPress?.(tag);
                            }}
                        >
                            <Typography variant="caption" style={styles.chipText}>
                                {tag}
                            </Typography>
                        </TouchableOpacity>
                    );
                }
            })}

            {overflowCount > 0 && (
                <View style={[styles.chip, styles.overflowChip]}>
                    <Typography variant="caption" style={styles.chipText}>
                        +{overflowCount}
                    </Typography>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    chip: {
        backgroundColor: colors.chipBg,
        borderWidth: 1,
        borderColor: colors.chipBorder,
        borderRadius: radius.sm,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    chipText: {
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.xs,
        color: colors.chipText,
    },
    overflowChip: {
        backgroundColor: colors.surface,
    },
});
