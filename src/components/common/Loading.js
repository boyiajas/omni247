import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const Loading = ({ message = 'Loading...', size = 'large', overlay = false }) => {
    if (overlay) {
        return (
            <View style={styles.overlayContainer}>
                <View style={styles.overlayContent}>
                    <ActivityIndicator size={size} color={colors.primary} />
                    {message && <Text style={styles.overlayText}>{message}</Text>}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={colors.primary} />
            {message && <Text style={styles.text}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    text: {
        marginTop: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        fontFamily: typography.families.regular,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    overlayContent: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: 16,
        alignItems: 'center',
    },
    overlayText: {
        marginTop: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontFamily: typography.families.medium,
    },
});

export default Loading;
