import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/common/Button';
import { typography, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const WelcomeScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles(() => ({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
        },
        logo: {
            width: 120,
            height: 120,
            marginBottom: spacing.xl,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: colors.white,
            textAlign: 'center',
            marginBottom: spacing.md,
            fontFamily: typography.families.bold,
        },
        subtitle: {
            fontSize: typography.sizes.md,
            color: colors.white,
            textAlign: 'center',
            opacity: 0.9,
            fontFamily: typography.families.regular,
        },
        footer: {
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xl,
        },
        button: {
            marginBottom: spacing.md,
        },
        buttonText: {
            color: colors.white,
        },
        anonymousButton: {
            marginTop: spacing.md,
        },
        anonymousText: {
            color: colors.white,
        },
    }));
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.container}>
                <View style={styles.content}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{t('welcome.title')}</Text>
                    <Text style={styles.subtitle}>
                        {t('welcome.subtitle')}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        title={t('welcome.signIn')}
                        variant="outline"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.button}
                        textStyle={styles.buttonText}
                    />
                    <Button
                        title={t('welcome.createAccount')}
                        onPress={() => navigation.navigate('Register')}
                        style={styles.button}
                    />
                    <Button
                        title={t('welcome.continueAnon')}
                        variant="text"
                        onPress={() => navigation.navigate('AnonymousLogin')}
                        style={styles.anonymousButton}
                        textStyle={styles.anonymousText}
                    />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default WelcomeScreen;
