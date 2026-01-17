import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { TYPOGRAPHY, PALETTE } from '../constants/theme';

type TypographyVariant =
    | 'h1' | 'h2' | 'h3'
    | 'body' | 'bodyMedium' | 'bodyBold'
    | 'caption' | 'display';

interface Props extends TextProps {
    variant?: TypographyVariant;
    color?: string;
}

export const Typography: React.FC<Props> = ({
    children,
    variant = 'body',
    color = PALETTE.textPrimary,
    style,
    ...props
}) => {
    return (
        <Text style={[styles[variant], { color }, style]} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontFamily: TYPOGRAPHY.fonts.serif,
        fontSize: TYPOGRAPHY.sizes.xxl,
        lineHeight: TYPOGRAPHY.sizes.xxl * 1.2,
        letterSpacing: -0.5,
    },
    h2: {
        fontFamily: TYPOGRAPHY.fonts.serif,
        fontSize: TYPOGRAPHY.sizes.xl,
        lineHeight: TYPOGRAPHY.sizes.xl * 1.3,
        letterSpacing: -0.3,
    },
    h3: {
        fontFamily: TYPOGRAPHY.fonts.serif,
        fontSize: TYPOGRAPHY.sizes.lg,
        lineHeight: TYPOGRAPHY.sizes.lg * 1.3,
    },
    body: {
        fontFamily: TYPOGRAPHY.fonts.body,
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: TYPOGRAPHY.sizes.base * 1.5,
    },
    bodyMedium: {
        fontFamily: TYPOGRAPHY.fonts.bodyMedium,
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: TYPOGRAPHY.sizes.base * 1.5,
    },
    bodyBold: {
        fontFamily: TYPOGRAPHY.fonts.bodyBold,
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: TYPOGRAPHY.sizes.base * 1.5,
    },
    caption: {
        fontFamily: TYPOGRAPHY.fonts.body,
        fontSize: TYPOGRAPHY.sizes.xs,
        lineHeight: TYPOGRAPHY.sizes.xs * 1.4,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
    },
    display: {
        fontFamily: TYPOGRAPHY.fonts.display,
        fontSize: TYPOGRAPHY.sizes.display,
        lineHeight: TYPOGRAPHY.sizes.display * 1.1,
        letterSpacing: -1,
    },
});
