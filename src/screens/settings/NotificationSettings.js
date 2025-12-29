import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import Card from '../../components/common/Card';
import { typography, spacing } from '../../theme';
import { authAPI } from '../../services/api/auth';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const NotificationSettings = () => {
    const { updateUser } = useAuth();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const [nearbyIncidents, setNearbyIncidents] = useState(true);
    const [reportUpdates, setReportUpdates] = useState(true);
    const [achievements, setAchievements] = useState(true);
    const [agencyResponses, setAgencyResponses] = useState(true);
    const [alertSettings, setAlertSettings] = useState({
        emergencyAlerts: true,
        crimeReports: true,
        disasterAlerts: true,
        celebrations: true,
        politicalEvents: true,
        allNotifications: true,
    });
    const [isLoading, setIsLoading] = useState(true);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: spacing.md,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.bold,
        },
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            fontFamily: typography.families.bold,
        },
        setting: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastSetting: {
            borderBottomWidth: 0,
        },
        settingInfo: {
            flex: 1,
            marginRight: spacing.md,
        },
        settingTitle: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            fontFamily: typography.families.semibold,
        },
        settingDescription: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            fontFamily: typography.families.regular,
        },
        alertGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: spacing.md,
            marginHorizontal: -4,
        },
        alertToggle: {
            width: '50%',
            paddingHorizontal: 4,
            marginBottom: spacing.md,
        },
        alertToggleLabel: {
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            fontFamily: typography.families.medium,
        },
    }), [colors]);

    const defaults = {
        nearbyIncidents: true,
        reportUpdates: true,
        achievements: true,
        agencyResponses: true,
        alertAll: true,
        alertEmergency: true,
        alertCrime: true,
        alertDisaster: true,
        alertCelebrations: true,
        alertPolitical: true,
    };

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await authAPI.getNotificationSettings();
                const settings = response.data?.notification_settings || {};
                const merged = { ...defaults, ...settings };

                setNearbyIncidents(merged.nearbyIncidents);
                setReportUpdates(merged.reportUpdates);
                setAchievements(merged.achievements);
                setAgencyResponses(merged.agencyResponses);
                setAlertSettings({
                    allNotifications: merged.alertAll,
                    emergencyAlerts: merged.alertEmergency,
                    crimeReports: merged.alertCrime,
                    disasterAlerts: merged.alertDisaster,
                    celebrations: merged.alertCelebrations,
                    politicalEvents: merged.alertPolitical,
                });
                updateUser({ notification_settings: merged });
            } catch (error) {
                // Keep defaults if loading fails.
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const persistSettings = async (nextGeneral, nextAlerts) => {
        if (isLoading) {
            return;
        }
        const payload = {
            nearbyIncidents: nextGeneral.nearbyIncidents,
            reportUpdates: nextGeneral.reportUpdates,
            achievements: nextGeneral.achievements,
            agencyResponses: nextGeneral.agencyResponses,
            alertAll: nextAlerts.allNotifications,
            alertEmergency: nextAlerts.emergencyAlerts,
            alertCrime: nextAlerts.crimeReports,
            alertDisaster: nextAlerts.disasterAlerts,
            alertCelebrations: nextAlerts.celebrations,
            alertPolitical: nextAlerts.politicalEvents,
        };

        try {
            const response = await authAPI.updateNotificationSettings(payload);
            updateUser({ notification_settings: response.data?.notification_settings || payload });
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('notificationSettings.saveError'));
        }
    };

    const handleAlertSettingChange = (setting) => {
        if (setting === 'allNotifications') {
            const newValue = !alertSettings.allNotifications;
            const nextAlerts = {
                emergencyAlerts: newValue,
                crimeReports: newValue,
                disasterAlerts: newValue,
                celebrations: newValue,
                politicalEvents: newValue,
                allNotifications: newValue,
            };
            setAlertSettings(nextAlerts);
            persistSettings(
                { nearbyIncidents, reportUpdates, achievements, agencyResponses },
                nextAlerts
            );
            return;
        }

        setAlertSettings((prev) => {
            const nextAlerts = { ...prev, [setting]: !prev[setting] };
            persistSettings(
                { nearbyIncidents, reportUpdates, achievements, agencyResponses },
                nextAlerts
            );
            return nextAlerts;
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('notificationSettings.title')}</Text>

            <Card>
                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{t('notificationSettings.nearby')}</Text>
                        <Text style={styles.settingDescription}>
                            {t('notificationSettings.nearbyDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={nearbyIncidents}
                        onValueChange={(value) => {
                            setNearbyIncidents(value);
                            persistSettings(
                                { nearbyIncidents: value, reportUpdates, achievements, agencyResponses },
                                alertSettings
                            );
                        }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{t('notificationSettings.reportUpdates')}</Text>
                        <Text style={styles.settingDescription}>
                            {t('notificationSettings.reportUpdatesDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={reportUpdates}
                        onValueChange={(value) => {
                            setReportUpdates(value);
                            persistSettings(
                                { nearbyIncidents, reportUpdates: value, achievements, agencyResponses },
                                alertSettings
                            );
                        }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{t('notificationSettings.achievements')}</Text>
                        <Text style={styles.settingDescription}>
                            {t('notificationSettings.achievementsDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={achievements}
                        onValueChange={(value) => {
                            setAchievements(value);
                            persistSettings(
                                { nearbyIncidents, reportUpdates, achievements: value, agencyResponses },
                                alertSettings
                            );
                        }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={[styles.setting, styles.lastSetting]}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{t('notificationSettings.agencyResponses')}</Text>
                        <Text style={styles.settingDescription}>
                            {t('notificationSettings.agencyResponsesDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={agencyResponses}
                        onValueChange={(value) => {
                            setAgencyResponses(value);
                            persistSettings(
                                { nearbyIncidents, reportUpdates, achievements, agencyResponses: value },
                                alertSettings
                            );
                        }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>
            </Card>

            <Text style={styles.sectionTitle}>{t('notificationSettings.alerts')}</Text>
            <Card>
                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{t('notificationSettings.all')}</Text>
                        <Text style={styles.settingDescription}>
                            {t('notificationSettings.allDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={alertSettings.allNotifications}
                        onValueChange={() => handleAlertSettingChange('allNotifications')}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={styles.alertGrid}>
                    <View style={styles.alertToggle}>
                        <Text style={styles.alertToggleLabel}>{t('notificationSettings.emergency')}</Text>
                        <Switch
                            value={alertSettings.emergencyAlerts}
                            onValueChange={() => handleAlertSettingChange('emergencyAlerts')}
                            trackColor={{ false: colors.border, true: colors.secondary }}
                            disabled={!alertSettings.allNotifications}
                        />
                    </View>

                    <View style={styles.alertToggle}>
                        <Text style={styles.alertToggleLabel}>{t('notificationSettings.crime')}</Text>
                        <Switch
                            value={alertSettings.crimeReports}
                            onValueChange={() => handleAlertSettingChange('crimeReports')}
                            trackColor={{ false: colors.border, true: colors.secondary }}
                            disabled={!alertSettings.allNotifications}
                        />
                    </View>

                    <View style={styles.alertToggle}>
                        <Text style={styles.alertToggleLabel}>{t('notificationSettings.disaster')}</Text>
                        <Switch
                            value={alertSettings.disasterAlerts}
                            onValueChange={() => handleAlertSettingChange('disasterAlerts')}
                            trackColor={{ false: colors.border, true: colors.warning }}
                            disabled={!alertSettings.allNotifications}
                        />
                    </View>

                    <View style={styles.alertToggle}>
                        <Text style={styles.alertToggleLabel}>{t('notificationSettings.celebrations')}</Text>
                        <Switch
                            value={alertSettings.celebrations}
                            onValueChange={() => handleAlertSettingChange('celebrations')}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            disabled={!alertSettings.allNotifications}
                        />
                    </View>

                    <View style={styles.alertToggle}>
                        <Text style={styles.alertToggleLabel}>{t('notificationSettings.political')}</Text>
                        <Switch
                            value={alertSettings.politicalEvents}
                            onValueChange={() => handleAlertSettingChange('politicalEvents')}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            disabled={!alertSettings.allNotifications}
                        />
                    </View>
                </View>
            </Card>
        </ScrollView>
    );
};

export default NotificationSettings;
