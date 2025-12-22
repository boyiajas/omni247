import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import Card from '../../components/common/Card';
import { colors, typography, spacing } from '../../theme';

const NotificationSettings = () => {
    const [nearbyIncidents, setNearbyIncidents] = useState(true);
    const [reportUpdates, setReportUpdates] = useState(true);
    const [achievements, setAchievements] = useState(true);
    const [agencyResponses, setAgencyResponses] = useState(true);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Notification Settings</Text>

            <Card>
                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Nearby Incidents</Text>
                        <Text style={styles.settingDescription}>
                            Get notified about incidents happening near you
                        </Text>
                    </View>
                    <Switch
                        value={nearbyIncidents}
                        onValueChange={setNearbyIncidents}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Report Updates</Text>
                        <Text style={styles.settingDescription}>
                            Updates on your submitted reports
                        </Text>
                    </View>
                    <Switch
                        value={reportUpdates}
                        onValueChange={setReportUpdates}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={styles.setting}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Achievements</Text>
                        <Text style={styles.settingDescription}>
                            When you unlock new achievements
                        </Text>
                    </View>
                    <Switch
                        value={achievements}
                        onValueChange={setAchievements}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={[styles.setting, styles.lastSetting]}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Agency Responses</Text>
                        <Text style={styles.settingDescription}>
                            When agencies respond to reports
                        </Text>
                    </View>
                    <Switch
                        value={agencyResponses}
                        onValueChange={setAgencyResponses}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
});

export default NotificationSettings;
