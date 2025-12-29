import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const AnonymousLoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { anonymousLogin } = useAuth();
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
        message: {
            fontSize: typography.sizes.md,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.regular,
            lineHeight: 24,
        },
        features: {
            marginBottom: spacing.xl,
        },
        featureItem: {
            fontSize: typography.sizes.md,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
            fontFamily: typography.families.regular,
        },
        button: {
            marginBottom: spacing.md,
        },
    }));

    const handleContinue = async () => {
        setLoading(true);
        const result = await anonymousLogin();
        setLoading(false);

        if (result.success) {
            // Navigation will be handled by AppNavigator
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{t('auth.anonymousTitle')}</Text>
                <Text style={styles.message}>
                    {t('auth.anonymousMessage')}
                </Text>

                <View style={styles.features}>
                    <Text style={styles.featureItem}>{t('auth.anonymousFeature1')}</Text>
                    <Text style={styles.featureItem}>{t('auth.anonymousFeature2')}</Text>
                    <Text style={styles.featureItem}>{t('auth.anonymousFeature3')}</Text>
                </View>

                <Button
                    title={t('auth.continueAnonymously')}
                    onPress={handleContinue}
                    loading={loading}
                    style={styles.button}
                />

                <Button
                    title={t('auth.createAccountInstead')}
                    variant="outline"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.button}
                />
            </View>
        </View>
    );
};

export default AnonymousLoginScreen;
