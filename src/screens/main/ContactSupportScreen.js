import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supportTicketsAPI } from '../../services/api/supportTickets';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const contactMethods = (t) => [
    {
        id: '1',
        title: t('contactSupport.emailSupport'),
        subtitle: 'support@omni247.com',
        icon: 'email',
        color: '#3b82f6',
        action: () => Linking.openURL('mailto:support@omni247.com'),
    },
    {
        id: '2',
        title: t('contactSupport.phoneSupport'),
        subtitle: '+1 (555) 247-0247',
        icon: 'phone',
        color: '#22c55e',
        action: () => Linking.openURL('tel:+15552470247'),
    },
    {
        id: '3',
        title: t('contactSupport.liveChat'),
        subtitle: t('contactSupport.liveChatSubtitle'),
        icon: 'chat',
        color: '#8b5cf6',
        action: () => Alert.alert(t('contactSupport.liveChat'), t('contactSupport.liveChatSoon')),
    },
    {
        id: '4',
        title: t('contactSupport.helpCenter'),
        subtitle: t('contactSupport.helpCenterSubtitle'),
        icon: 'book-open-variant',
        color: '#f59e0b',
        action: (navigation) => navigation.navigate('FAQ'),
    },
];

export default function ContactSupportScreen({ navigation }) {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
            backgroundColor: palette.white,
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            ...typography.h2,
            color: palette.textPrimary,
        },
        placeholder: {
            width: 40,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 32,
        },
        heroSection: {
            alignItems: 'center',
            padding: 32,
            backgroundColor: palette.white,
            marginBottom: 16,
        },
        heroTitle: {
            ...typography.h2,
            color: palette.textPrimary,
            marginTop: 16,
            marginBottom: 8,
        },
        heroSubtitle: {
            ...typography.body,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        methodsSection: {
            paddingHorizontal: 20,
            marginBottom: 24,
        },
        sectionTitle: {
            ...typography.h3,
            color: palette.textPrimary,
            marginBottom: 16,
        },
        methodCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: palette.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        methodIcon: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        methodInfo: {
            flex: 1,
        },
        methodTitle: {
            ...typography.body,
            fontWeight: '600',
            color: palette.textPrimary,
            marginBottom: 4,
        },
        methodSubtitle: {
            ...typography.caption,
            color: palette.textSecondary,
        },
        formSection: {
            paddingHorizontal: 20,
            marginBottom: 24,
        },
        formCard: {
            backgroundColor: palette.white,
            borderRadius: 12,
            padding: 20,
            shadowColor: palette.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        inputGroup: {
            marginBottom: 20,
        },
        inputLabel: {
            ...typography.body,
            fontWeight: '600',
            color: palette.textPrimary,
            marginBottom: 8,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.neutralLight,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 50,
        },
        textAreaContainer: {
            height: 120,
            alignItems: 'flex-start',
            paddingVertical: 12,
        },
        input: {
            flex: 1,
            ...typography.body,
            color: palette.textPrimary,
            marginLeft: 12,
        },
        textArea: {
            marginLeft: 0,
            height: '100%',
        },
        submitButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: palette.primary,
            borderRadius: 12,
            paddingVertical: 16,
            gap: 8,
        },
        submitButtonDisabled: {
            opacity: 0.6,
        },
        submitButtonText: {
            ...typography.body,
            fontWeight: '600',
            color: palette.white,
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: `${palette.info}20`,
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: palette.info,
        },
        infoContent: {
            flex: 1,
            marginLeft: 12,
        },
        infoTitle: {
            ...typography.body,
            fontWeight: '600',
            color: palette.textPrimary,
            marginBottom: 4,
        },
        infoText: {
            ...typography.caption,
            color: palette.textSecondary,
            lineHeight: 18,
        },
    }));
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validate form
        if (!form.name || !form.email || !form.subject || !form.message) {
            Alert.alert(t('contactSupport.missingInfoTitle'), t('contactSupport.missingInfoBody'));
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert(t('contactSupport.invalidEmailTitle'), t('contactSupport.invalidEmailBody'));
            return;
        }

        setSubmitting(true);

        try {
            console.log('=== SUPPORT TICKET SUBMISSION ===');
            console.log('Form data:', form);
            const response = await supportTicketsAPI.submit(form);
            const data = response.data || {};

            if (data.success || response.status === 201) {
                Alert.alert(
                    t('contactSupport.successTitle'),
                    t('contactSupport.successBody'),
                    [
                        {
                            text: t('common.ok'),
                            onPress: () => {
                                setForm({ name: '', email: '', subject: '', message: '' });
                                navigation.goBack();
                            },
                        },
                    ]
                );
            } else {
                console.error('Failed to submit:', data);
                Alert.alert(t('reportFlow.addressErrorTitle'), data.message || JSON.stringify(data.errors || t('contactSupport.submitError')));
            }
        } catch (error) {
            console.error('Error submitting ticket:', error);
            Alert.alert(t('reportFlow.addressErrorTitle'), `${t('contactSupport.submitError')}: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const renderContactMethod = (method) => (
        <TouchableOpacity
            key={method.id}
            style={styles.methodCard}
            onPress={() => typeof method.action === 'function' ? method.action(navigation) : null}
            activeOpacity={0.7}
        >
            <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                <Icon name={method.icon} size={28} color={method.color} />
            </View>
            <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.border} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('contactSupport.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <Icon name="headset" size={64} color={colors.primary} />
                    <Text style={styles.heroTitle}>{t('contactSupport.heroTitle')}</Text>
                    <Text style={styles.heroSubtitle}>
                        {t('contactSupport.heroSubtitle')}
                    </Text>
                </View>

                <View style={styles.methodsSection}>
                    <Text style={styles.sectionTitle}>{t('contactSupport.methodsTitle')}</Text>
                    {contactMethods(t).map(renderContactMethod)}
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>{t('contactSupport.formTitle')}</Text>
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('contactSupport.nameLabel')}</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="account" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    value={form.name}
                                    onChangeText={(text) => setForm({ ...form, name: text })}
                                    placeholder={t('contactSupport.namePlaceholder')}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('contactSupport.emailLabel')}</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="email" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    value={form.email}
                                    onChangeText={(text) => setForm({ ...form, email: text })}
                                    placeholder={t('contactSupport.emailPlaceholder')}
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('contactSupport.subjectLabel')}</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="format-title" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    value={form.subject}
                                    onChangeText={(text) => setForm({ ...form, subject: text })}
                                    placeholder={t('contactSupport.subjectPlaceholder')}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{t('contactSupport.messageLabel')}</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={form.message}
                                    onChangeText={(text) => setForm({ ...form, message: text })}
                                    placeholder={t('contactSupport.messagePlaceholder')}
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            {submitting ? (
                                <Text style={styles.submitButtonText}>{t('contactSupport.sending')}</Text>
                            ) : (
                                <>
                                    <Icon name="send" size={20} color={colors.white} />
                                    <Text style={styles.submitButtonText}>{t('contactSupport.submit')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Icon name="information" size={24} color={colors.info} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>{t('contactSupport.responseTitle')}</Text>
                        <Text style={styles.infoText}>
                            {t('contactSupport.responseBody')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
