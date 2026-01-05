import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutralLight,
    },
    backButton: {
      padding: 5,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.neutralDark,
      textAlign: 'center',
      flex: 1,
    },
    headerSpacer: {
      width: 34,
    },
    logoContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    logo: {
      width: 100,
      height: 100,
    },
    form: {
      paddingHorizontal: 20,
      paddingVertical: 30,
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
      ...typography.body,
      color: colors.neutralDark,
    },
    passwordHint: {
      ...typography.small,
      color: colors.neutralMedium,
      marginBottom: 15,
      lineHeight: 18,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 25,
      paddingHorizontal: 5,
    },
    checkbox: {
      marginRight: 10,
      marginTop: 2,
    },
    checkboxBox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: colors.neutralLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.neutralMedium,
    },
    checkboxBoxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    termsText: {
      ...typography.caption,
      color: colors.neutralMedium,
      flex: 1,
      lineHeight: 20,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    registerButtonDisabled: {
      opacity: 0.7,
    },
    registerButtonText: {
      ...typography.body,
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
      ...typography.body,
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
      ...typography.body,
      color: colors.white,
      marginLeft: 10,
      fontWeight: '500',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    loginText: {
      ...typography.body,
      color: colors.neutralMedium,
    },
    loginLink: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
  }));
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationFullName'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationInvalidEmail'));
      return false;
    }

    if (password.length < 8) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationPasswordLength'));
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationPasswordMatch'));
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert(t('auth.validationTitle'), t('auth.validationAgreeTerms'));
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Use AuthContext register method
      const result = await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        Alert.alert(
          t('common.success'),
          t('auth.registerSuccess'),
          [{ text: t('common.ok') }]
        );
        // Navigation will be handled automatically by AppNavigator
      } else {
        Alert.alert(t('auth.registerFailedTitle'), result.error || t('auth.registerFailedBody'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('auth.errorTitle'), t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const navigateToTerms = () => {
    // TODO: Navigate to Terms of Service screen
    Alert.alert(t('auth.termsTitle'), t('auth.termsBody'));
  };

  const navigateToPrivacy = () => {
    // TODO: Navigate to Privacy Policy screen
    Alert.alert(t('auth.privacyTitle'), t('auth.privacyBody'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors.neutralDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('auth.createAccount')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.fullNamePlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.neutralMedium}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordHint}>
              {t('auth.passwordHint1')}{'\n'}
              {t('auth.passwordHint2')}{'\n'}
              {t('auth.passwordHint3')}
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                placeholderTextColor={colors.neutralMedium}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.neutralMedium}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreeToTerms(!agreeToTerms)}>
                <View style={[
                  styles.checkboxBox,
                  agreeToTerms && styles.checkboxBoxChecked
                ]}>
                  {agreeToTerms && (
                    <Icon name="check" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                {t('auth.termsPrefix')}{' '}
                <Text style={styles.termsLink} onPress={navigateToTerms}>
                  {t('auth.termsLink')}
                </Text>{' '}
                {t('auth.termsAnd')}{' '}
                <Text style={styles.termsLink} onPress={navigateToPrivacy}>
                  {t('auth.privacyLink')}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.createAccount')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Icon name="google" size={20} color={colors.neutralDark} />
              <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.anonymousButton}
              onPress={() => navigation.navigate('MainTabs')}>
              <Icon name="incognito" size={20} color={colors.white} />
              <Text style={styles.anonymousButtonText}>{t('auth.continueAnonymously')}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('auth.haveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
