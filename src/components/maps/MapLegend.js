import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { REPORT_CATEGORIES } from '../../utils/constants';
import { colors, typography, spacing } from '../../theme';

const MapLegend = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Categories</Text>
            {Object.values(REPORT_CATEGORIES).map((category) => (
                <View key={category.id} style={styles.item}>
                    <View
                        style={[styles.dot, { backgroundColor: category.color }]}
                    />
                    <Text style={styles.text}>{category.name}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        fontFamily: typography.families.bold,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    text: {
        fontSize: typography.sizes.xs,
        color: colors.textPrimary,
        fontFamily: typography.families.regular,
    },
});

export default MapLegend;
