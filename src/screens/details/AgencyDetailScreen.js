import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Card from '../../components/common/Card';
import { colors, typography, spacing } from '../../theme';

const AgencyDetailScreen = ({ route }) => {
    const { agencyId } = route.params;

    return (
        <ScrollView style={styles.container}>
            <Card>
                <Text style={styles.title}>Agency Details</Text>
                <Text style={styles.subtitle}>Agency ID: {agencyId}</Text>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        fontFamily: typography.families.bold,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        fontFamily: typography.families.regular,
    },
});

export default AgencyDetailScreen;
