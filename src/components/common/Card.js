import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, shadows } from '../../theme';

const Card = ({
    children,
    onPress,
    style,
    elevated = true,
    padding = true,
}) => {
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

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    noPadding: {
        padding: 0,
    },
});

export default Card;
