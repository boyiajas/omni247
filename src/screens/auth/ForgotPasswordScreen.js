import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles(() => ({
        container: {
            flex: 1,
            backgroundColor: colors.white,
        },
        content: {
            flex: 1,
            padding: spacing.xl,
            justifyContent: 'center',
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
            fontFamily: typography.families.bold,
        },
        subtitle: {
            fontSize: typography.sizes.md,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.regular,
        },
        message: {
            fontSize: typography.sizes.md,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
            fontFamily: typography.families.regular,
        },
        button: {
            marginTop: spacing.md,
        },
    }));

    const handleSend = async () => {
        setLoading(true);
        // TODO: Implement forgot password API call
        setTimeout(() => {
            setLoading(false);
            setEmailSent(true);
        }, 1500);
    };

    if (emailSent) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{t('auth.forgotCheckEmailTitle')}</Text>
                        <Text style={styles.message}>
                            {t('auth.forgotCheckEmailMessage', { email })}
                        </Text>
                        <Button
                            title={t('auth.backToLogin')}
                            onPress={() => navigation.navigate('Login')}
                            style={styles.button}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>{t('auth.resetPasswordTitle')}</Text>
                    <Text style={styles.subtitle}>{t('auth.resetPasswordSubtitle')}</Text>

                <Input
                    label={t('auth.emailLabel')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Button
                    title={t('auth.sendResetLink')}
                    onPress={handleSend}
                    loading={loading}
                    disabled={!email}
                    style={styles.button}
                />

                    <Button
                        title={t('auth.backToLogin')}
                        variant="text"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
