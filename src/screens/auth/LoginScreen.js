import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, anonymousLogin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
    },
    welcomeText: {
      color: colors.neutralDark,
      marginBottom: 10,
    },
    subtitle: {
      color: colors.neutralMedium,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutralLight,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.neutralLight,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: colors.neutralDark,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 25,
    },
    forgotPasswordText: {
      ...typography.caption,
      color: colors.primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonText: {
      color: colors.white,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.neutralLight,
    },
    dividerText: {
      ...typography.caption,
      color: colors.neutralMedium,
      marginHorizontal: 10,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.neutralLight,
      borderRadius: 12,
      height: 50,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.neutralLight,
    },
    googleButtonText: {
      color: colors.neutralDark,
      marginLeft: 10,
      fontWeight: '500',
    },
    anonymousButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.neutralDark,
      borderRadius: 12,
      height: 50,
      marginBottom: 30,
    },
    anonymousButtonText: {
      color: colors.white,
      marginLeft: 10,
      fontWeight: '500',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    registerText: {
      color: colors.neutralMedium,
    },
    registerLink: {
      color: colors.primary,
      fontWeight: '600',
    },
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationMissingCredentials'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationInvalidEmail'));
      return;
    }

    setLoading(true);
    try {
      // Use AuthContext login method
      const result = await login(email, password);

      if (result.success) {
        // Navigation will be handled automatically by AppNavigator
        console.log('Login successful');
      } else {
        Alert.alert(
          t('auth.loginFailedTitle'),
          result.error || t('auth.loginFailedBody'),
          [
            { text: t('common.ok') },
            {
              text: t('auth.useDemoAccount'),
              onPress: () => handleDemoLogin(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        t('auth.loginErrorTitle'),
        t('auth.loginErrorBody'),
        [
          { text: t('auth.retry'), onPress: () => handleLogin() },
          {
            text: t('auth.useDemoShort'),
            onPress: () => handleDemoLogin(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Demo user data
      const demoUser = {
        id: 'demo_123',
        name: t('auth.demoUserName'),
        email: 'demo@gireport.com',
        is_verified: true,
        is_anonymous: false,
        role: 'user',
        total_reports: 0,
        total_points: 0,
        reputation_score: 0,
      };
      const demoToken = 'demo_token_' + Date.now();

      // Use AuthContext login with demo credentials
      await login(demoUser, demoToken);

      Alert.alert(t('auth.demoModeTitle'), t('auth.demoModeBody'));
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert(t('auth.errorTitle'), t('auth.demoLoginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await anonymousLogin();
    } catch (error) {
      console.error('Anonymous login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('auth.signInSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.neutralMedium}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Icon name="google" size={20} color={colors.neutralDark} />
              <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.anonymousButton} onPress={handleAnonymousLogin}>
              <Icon name="incognito" size={20} color={colors.white} />
              <Text style={styles.anonymousButtonText}>{t('auth.continueAnonymously')}</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t('auth.noAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
