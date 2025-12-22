import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const Badge = ({
    text,
    variant = 'default',
    size = 'medium',
    style,
}) => {
    const getBadgeColor = () => {
        switch (variant) {
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            case 'warning':
                return colors.warning;
            case 'info':
                return colors.info;
            default:
                return colors.textSecondary;
        }
    };

    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: getBadgeColor() },
                size === 'small' && styles.badgeSmall,
                style,
            ]}>
            <Text
                style={[
                    styles.text,
                    size === 'small' && styles.textSmall,
                ]}>
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeSmall: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: 8,
    },
    text: {
        color: colors.white,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.families.semibold,
    },
    textSmall: {
        fontSize: 10,
    },
});

export default Badge;
