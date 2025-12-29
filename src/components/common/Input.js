import React, { useMemo, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    multiline = false,
    numberOfLines = 1,
    style,
    disabled = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const { theme } = useTheme();
    const colors = theme.colors;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: spacing.md,
        },
        label: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            fontFamily: typography.families.medium,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
        },
        inputContainerFocused: {
            borderColor: colors.primary,
            borderWidth: 2,
        },
        inputContainerError: {
            borderColor: colors.error,
        },
        inputContainerDisabled: {
            backgroundColor: colors.disabled,
            opacity: 0.6,
        },
        input: {
            flex: 1,
            fontSize: typography.sizes.md,
            color: colors.textPrimary,
            paddingVertical: spacing.md,
            fontFamily: typography.families.regular,
        },
        inputMultiline: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        inputWithLeftIcon: {
            marginLeft: spacing.sm,
        },
        inputWithRightIcon: {
            marginRight: spacing.sm,
        },
        leftIcon: {
            marginRight: spacing.xs,
        },
        rightIcon: {
            padding: spacing.xs,
        },
        errorText: {
            fontSize: typography.sizes.xs,
            color: colors.error,
            marginTop: spacing.xs,
            fontFamily: typography.families.regular,
        },
    }), [colors]);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    disabled && styles.inputContainerDisabled,
                ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        leftIcon && styles.inputWithLeftIcon,
                        (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={!disabled}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
                        <Icon
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

export default Input;
