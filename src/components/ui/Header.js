import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({
    title,
    subtitle,
    leftIcon,
    onLeftPress,
    rightIcon,
    onRightPress,
    transparent = false,
}) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: colors.white,
        },
        transparent: {
            backgroundColor: 'transparent',
        },
        titleContainer: {
            flex: 1,
            alignItems: 'center',
        },
        title: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            fontFamily: typography.families.bold,
        },
        subtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            marginTop: spacing.xs,
            fontFamily: typography.families.regular,
        },
        iconButton: {
            padding: spacing.sm,
        },
    }), [colors]);
    return (
        <View style={[styles.container, transparent && styles.transparent]}>
            {leftIcon && (
                <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                    <Icon name={leftIcon} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            )}

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {rightIcon && (
                <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                    <Icon name={rightIcon} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Header;
