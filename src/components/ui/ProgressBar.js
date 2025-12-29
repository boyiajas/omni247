import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const ProgressBar = ({
    progress = 0,
    height = 8,
    color,
    backgroundColor,
    showLabel = false,
    style,
}) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useMemo(() => StyleSheet.create({
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
    }), [colors]);

    const progressPercentage = Math.min(Math.max(progress, 0), 100);
    const resolvedColor = color || colors.primary;
    const resolvedBackground = backgroundColor || colors.border;

    return (
        <View style={style}>
            <View style={[styles.container, { height, backgroundColor: resolvedBackground }]}>
                <View
                    style={[
                        styles.progress,
                        {
                            width: `${progressPercentage}%`,
                            backgroundColor: resolvedColor,
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

export default ProgressBar;
