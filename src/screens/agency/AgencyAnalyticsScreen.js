import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Card from '../../components/common/Card';
import { colors, typography, spacing } from '../../theme';

const AgencyAnalyticsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Analytics</Text>
            <Card>
                <Text>Agency analytics coming soon</Text>
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
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
        fontFamily: typography.families.bold,
    },
});

export default AgencyAnalyticsScreen;
