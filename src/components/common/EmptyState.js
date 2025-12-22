import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';

const EmptyState = ({
    icon = 'file-tray-outline',
    title = 'No data',
    message = 'Nothing to show here',
    action,
}) => {
    return (
        <View style={styles.container}>
            <Icon name={icon} size={64} color={colors.textSecondary} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {action && <View style={styles.action}>{action}</View>}
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
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginTop: spacing.md,
        fontFamily: typography.families.bold,
    },
    message: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
        fontFamily: typography.families.regular,
    },
    action: {
        marginTop: spacing.lg,
    },
});

export default EmptyState;
