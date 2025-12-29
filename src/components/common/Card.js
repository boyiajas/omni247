import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
    children,
    onPress,
    style,
    elevated = true,
    padding = true,
}) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useMemo(() => StyleSheet.create({
        card: {
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        noPadding: {
            padding: 0,
        },
    }), [colors]);
    const cardStyles = [
        styles.card,
        elevated && shadows.medium,
        !padding && styles.noPadding,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={cardStyles}
                activeOpacity={0.8}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
};

export default Card;
