import React from 'react';
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme/tokens';

type TypographyVariant = keyof typeof textStyles;

interface Props extends TextProps {
    variant?: TypographyVariant;
    color?: string;
}

export const Typography: React.FC<Props> = ({
    children,
    variant = 'bodyMedium',
    color,
    style,
    ...props
}) => {
    // Determine the base style from tokens
    const baseStyle = textStyles[variant] || textStyles.bodyMedium;

    // Default color based on variant if not provided
    const defaultColor = variant.startsWith('display') || variant.startsWith('h')
        ? colors.text
        : variant.startsWith('label') || variant === 'caption'
            ? colors.text3
            : colors.text2;

    return (
        <Text
            style={[
                baseStyle,
                { color: color || defaultColor },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

