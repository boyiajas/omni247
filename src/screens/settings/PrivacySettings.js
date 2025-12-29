import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Switch,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import Card from '../../components/common/Card';
import { typography, spacing } from '../../theme';
import { privacyAPI } from '../../services/api/privacy';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

// Custom Picker Component
const CustomPicker = ({ label, value, options, onValueChange, t, styles, colors }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View style={styles.pickerContainer}>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.pickerText}>{selectedOption?.label || t('privacy.select')}</Text>
                <Icon name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalOption,
                                        item.value === value && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onValueChange(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            item.value === value && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Icon name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const PrivacySettings = ({ navigation }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles(() => ({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        loadingText: {
            marginTop: spacing.md,
            fontSize: typography.sizes.md,
            color: colors.textSecondary,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            paddingTop: spacing.xl,
        },
        backButton: {
            marginRight: spacing.md,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            fontFamily: typography.families.bold,
        },
        card: {
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
            padding: spacing.lg,
        },
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        sectionDescription: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutralLight,
        },
        settingTextContainer: {
            flex: 1,
            marginRight: spacing.md,
        },
        settingLabel: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.xxs,
        },
        settingHint: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        pickerContainer: {
            width: 150,
        },
        pickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.neutralLight,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 8,
        },
        pickerText: {
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: spacing.xl,
            maxHeight: '50%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutralLight,
        },
        modalTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
        },
        modalOption: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutralLight,
        },
        modalOptionSelected: {
            backgroundColor: colors.primaryLight,
        },
        modalOptionText: {
            fontSize: typography.sizes.md,
            color: colors.textPrimary,
        },
        modalOptionTextSelected: {
            fontWeight: typography.weights.bold,
            color: colors.primary,
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: colors.primaryLight,
            padding: spacing.md,
            borderRadius: 8,
            marginTop: spacing.md,
        },
        infoTextContainer: {
            flex: 1,
            marginLeft: spacing.sm,
        },
        infoText: {
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        infoBold: {
            fontWeight: typography.weights.bold,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.primary,
            marginTop: spacing.md,
        },
        actionButtonText: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: colors.primary,
            marginLeft: spacing.sm,
        },
        dangerButton: {
            borderColor: colors.error,
        },
        dangerButtonText: {
            color: colors.error,
        },
        saveButton: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.primary,
            padding: spacing.lg,
            borderRadius: 12,
            marginHorizontal: spacing.md,
            marginTop: spacing.lg,
        },
        saveButtonDisabled: {
            opacity: 0.6,
        },
        saveButtonText: {
            color: colors.white,
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.bold,
            marginLeft: spacing.sm,
        },
        bottomSpacer: {
            height: spacing.xl,
        },
    }));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        profile_visibility: 'public',
        show_location: true,
        show_reports: true,
        show_achievements: true,
        allow_comments: true,
        default_report_privacy: 'public',
        data_sharing: {
            analytics: true,
            marketing: false,
            research: false,
        },
    });

    const visibilityOptions = [
        { label: t('privacy.public'), value: 'public' },
        { label: t('privacy.friendsOnly'), value: 'friends_only' },
        { label: t('privacy.private'), value: 'private' },
    ];

    const reportPrivacyOptions = [
        { label: t('privacy.public'), value: 'public' },
        { label: t('privacy.anonymous'), value: 'anonymous' },
        { label: t('privacy.private'), value: 'private' },
    ];

    useEffect(() => {
        loadPrivacySettings();
    }, []);

    const loadPrivacySettings = async () => {
        try {
            setLoading(true);
            const response = await privacyAPI.getPrivacySettings();
            if (response.data?.privacy_settings) {
                setSettings(response.data.privacy_settings);
            }
        } catch (error) {
            console.error('Error loading privacy settings:', error);
            Alert.alert(t('reportFlow.addressErrorTitle'), t('privacy.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await privacyAPI.updatePrivacySettings(settings);
            Alert.alert(t('common.success'), t('privacy.saveSuccess'));
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            Alert.alert(t('reportFlow.addressErrorTitle'), t('privacy.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateDataSharing = (key, value) => {
        setSettings(prev => ({
            ...prev,
            data_sharing: {
                ...prev.data_sharing,
                [key]: value,
            },
        }));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('privacy.loading')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('privacy.title')}</Text>
            </View>

            {/* Profile Visibility Section */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>{t('privacy.profileVisibility')}</Text>
                <Text style={styles.sectionDescription}>
                    {t('privacy.profileVisibilityDesc')}
                </Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t('privacy.profileVisibility')}</Text>
                    <CustomPicker
                        label={t('privacy.profileVisibility')}
                        value={settings.profile_visibility}
                        options={visibilityOptions}
                        t={t}
                        styles={styles}
                        colors={colors}
                        onValueChange={(value) => updateSetting('profile_visibility', value)}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.showLocation')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.showLocationDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.show_location}
                        onValueChange={(value) => updateSetting('show_location', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.showReports')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.showReportsDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.show_reports}
                        onValueChange={(value) => updateSetting('show_reports', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.showAchievements')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.showAchievementsDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.show_achievements}
                        onValueChange={(value) => updateSetting('show_achievements', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.allowComments')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.allowCommentsDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.allow_comments}
                        onValueChange={(value) => updateSetting('allow_comments', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>
            </Card>

            {/* Report Privacy Defaults Section */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>{t('privacy.defaultReportPrivacy')}</Text>
                <Text style={styles.sectionDescription}>
                    {t('privacy.defaultReportPrivacyDesc')}
                </Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t('privacy.defaultReportPrivacy')}</Text>
                    <CustomPicker
                        label={t('privacy.defaultReportPrivacy')}
                        value={settings.default_report_privacy}
                        options={reportPrivacyOptions}
                        t={t}
                        styles={styles}
                        colors={colors}
                        onValueChange={(value) => updateSetting('default_report_privacy', value)}
                    />
                </View>

                <View style={styles.infoCard}>
                    <Icon name="information-outline" size={20} color={colors.primary} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>{t('privacy.public')}:</Text> {t('privacy.publicDesc')}
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>{t('privacy.anonymous')}:</Text> {t('privacy.anonymousDesc')}
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>{t('privacy.private')}:</Text> {t('privacy.privateDesc')}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Data & Privacy Section */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>{t('privacy.dataSharing')}</Text>
                <Text style={styles.sectionDescription}>
                    {t('privacy.dataSharingDesc')}
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.analytics')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.analyticsDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.analytics}
                        onValueChange={(value) => updateDataSharing('analytics', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.marketing')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.marketingDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.marketing}
                        onValueChange={(value) => updateDataSharing('marketing', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{t('privacy.research')}</Text>
                        <Text style={styles.settingHint}>{t('privacy.researchDesc')}</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.research}
                        onValueChange={(value) => updateDataSharing('research', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="download" size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>{t('privacy.downloadData')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
                    <Icon name="delete-forever" size={20} color={colors.error} />
                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                        {t('privacy.deleteAccount')}
                    </Text>
                </TouchableOpacity>
            </Card>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <>
                        <Icon name="content-save" size={20} color={colors.white} />
                        <Text style={styles.saveButtonText}>{t('privacy.save')}</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

export default PrivacySettings;
