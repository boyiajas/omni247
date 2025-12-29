import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const buttonStyles = useMemo(() => StyleSheet.create({
        base: {
            borderRadius: 12,
            overflow: 'hidden',
        },
        gradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
        },
        small: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
        },
        large: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
        },
        outline: {
            borderWidth: 2,
            borderColor: colors.primary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        disabled: {
            opacity: 0.5,
        },
        text: {
            color: colors.white,
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            fontFamily: typography.families.medium,
        },
        textSmall: {
            fontSize: typography.sizes.sm,
        },
        textLarge: {
            fontSize: typography.sizes.lg,
        },
        textOutline: {
            color: colors.primary,
        },
        textDisabled: {
            color: colors.textSecondary,
        },
    }), [colors]);
    const getButtonStyles = () => {
        const styles = [buttonStyles.base];

        if (size === 'small') styles.push(buttonStyles.small);
        if (size === 'large') styles.push(buttonStyles.large);
        if (disabled) styles.push(buttonStyles.disabled);

        return styles;
    };

    const getTextStyles = () => {
        const styles = [buttonStyles.text];

        if (size === 'small') styles.push(buttonStyles.textSmall);
        if (size === 'large') styles.push(buttonStyles.textLarge);
        if (variant === 'outline') styles.push(buttonStyles.textOutline);
        if (disabled) styles.push(buttonStyles.textDisabled);

        return styles;
    };

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[...getButtonStyles(), style]}
                activeOpacity={0.8}>
                <LinearGradient
                    colors={disabled ? [colors.disabled, colors.disabled] : [colors.primary, colors.primaryDark]}
                    style={buttonStyles.gradient}>
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            {icon}
                            <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'outline') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[...getButtonStyles(), buttonStyles.outline, style]}
                activeOpacity={0.8}>
                {loading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <>
                        {icon}
                        <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
                    </>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[...getButtonStyles(), buttonStyles.text, style]}
            activeOpacity={0.8}>
            {loading ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                <>
                    {icon}
                    <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default Button;
