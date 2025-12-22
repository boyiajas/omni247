import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const ProgressBar = ({
    progress = 0,
    height = 8,
    color = colors.primary,
    backgroundColor = colors.border,
    showLabel = false,
    style,
}) => {
    const progressPercentage = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={style}>
            <View style={[styles.container, { height, backgroundColor }]}>
                <View
                    style={[
                        styles.progress,
                        {
                            width: `${progressPercentage}%`,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>

            {showLabel && (
                <Text style={styles.label}>{progressPercentage}%</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 4,
    },
    label: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
        fontFamily: typography.families.medium,
    },
});

export default ProgressBar;
