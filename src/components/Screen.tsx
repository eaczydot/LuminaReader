import React from 'react';
import { View, StyleSheet, ViewProps, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE } from '../constants/theme';

interface ScreenProps extends ViewProps {
    safe?: boolean;
    background?: string;
}

export const Screen: React.FC<ScreenProps> = ({
    children,
    safe = true,
    background = PALETTE.darkBackground,
    style,
    ...props
}) => {
    const Container = safe ? SafeAreaView : View;

    return (
        <Container
            style={[
                styles.container,
                { backgroundColor: background },
                style
            ]}
            {...props}
        >
            <StatusBar barStyle="light-content" backgroundColor={background} />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
