import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Card from '../../components/common/Card';
import { typography, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import useThemedStyles from '../../theme/useThemedStyles';

const AgencySettingsScreen = () => {
    const { t } = useLanguage();
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
            padding: spacing.md,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.bold,
        },
    }));
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('agency.settingsTitle')}</Text>
            <Card>
                <Text>{t('agency.settingsComingSoon')}</Text>
            </Card>
        </ScrollView>
    );
};
export default AgencySettingsScreen;
