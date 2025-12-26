import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import Card from '../../components/common/Card';
import { colors, typography, spacing } from '../../theme';
import { privacyAPI } from '../../services/api/privacy';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Custom Picker Component
const CustomPicker = ({ label, value, options, onValueChange }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View style={styles.pickerContainer}>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.pickerText}>{selectedOption?.label || 'Select'}</Text>
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
        { label: 'Public', value: 'public' },
        { label: 'Friends Only', value: 'friends_only' },
        { label: 'Private', value: 'private' },
    ];

    const reportPrivacyOptions = [
        { label: 'Public', value: 'public' },
        { label: 'Anonymous', value: 'anonymous' },
        { label: 'Private', value: 'private' },
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
            Alert.alert('Error', 'Failed to load privacy settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await privacyAPI.updatePrivacySettings(settings);
            Alert.alert('Success', 'Privacy settings saved successfully');
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            Alert.alert('Error', 'Failed to save privacy settings');
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
                <Text style={styles.loadingText}>Loading privacy settings...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Privacy Settings</Text>
            </View>

            {/* Profile Visibility Section */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Profile Visibility</Text>
                <Text style={styles.sectionDescription}>
                    Control who can see your profile and activity
                </Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Profile Visibility</Text>
                    <CustomPicker
                        label="Profile Visibility"
                        value={settings.profile_visibility}
                        options={visibilityOptions}
                        onValueChange={(value) => updateSetting('profile_visibility', value)}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Show Location in Posts</Text>
                        <Text style={styles.settingHint}>Display your location with reports</Text>
                    </View>
                    <Switch
                        value={settings.show_location}
                        onValueChange={(value) => updateSetting('show_location', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Show My Reports Publicly</Text>
                        <Text style={styles.settingHint}>Others can see your reports</Text>
                    </View>
                    <Switch
                        value={settings.show_reports}
                        onValueChange={(value) => updateSetting('show_reports', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Show Achievements & Badges</Text>
                        <Text style={styles.settingHint}>Display earned achievements</Text>
                    </View>
                    <Switch
                        value={settings.show_achievements}
                        onValueChange={(value) => updateSetting('show_achievements', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Allow Comments on My Reports</Text>
                        <Text style={styles.settingHint}>Others can comment on your reports</Text>
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
                <Text style={styles.sectionTitle}>Report Privacy Defaults</Text>
                <Text style={styles.sectionDescription}>
                    Set default privacy level for new reports
                </Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Default Report Privacy</Text>
                    <CustomPicker
                        label="Default Report Privacy"
                        value={settings.default_report_privacy}
                        options={reportPrivacyOptions}
                        onValueChange={(value) => updateSetting('default_report_privacy', value)}
                    />
                </View>

                <View style={styles.infoCard}>
                    <Icon name="information-outline" size={20} color={colors.primary} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>Public:</Text> Anyone can see your report and profile
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>Anonymous:</Text> Report visible, but your identity is hidden
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>Private:</Text> Only you and admins can see the report
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Data & Privacy Section */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Data & Privacy</Text>
                <Text style={styles.sectionDescription}>
                    Control how your data is used
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Share Analytics Data</Text>
                        <Text style={styles.settingHint}>Help improve the app with usage data</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.analytics}
                        onValueChange={(value) => updateDataSharing('analytics', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Marketing Communications</Text>
                        <Text style={styles.settingHint}>Receive updates and promotional emails</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.marketing}
                        onValueChange={(value) => updateDataSharing('marketing', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Research Participation</Text>
                        <Text style={styles.settingHint}>Participate in research studies</Text>
                    </View>
                    <Switch
                        value={settings.data_sharing.research}
                        onValueChange={(value) => updateDataSharing('research', value)}
                        trackColor={{ false: colors.neutralLight, true: colors.primary }}
                    />
                </View>

                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="download" size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Download My Data</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
                    <Icon name="delete-forever" size={20} color={colors.error} />
                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                        Delete Account
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
                        <Text style={styles.saveButtonText}>Save Privacy Settings</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    // Custom Picker Styles
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
});

export default PrivacySettings;
