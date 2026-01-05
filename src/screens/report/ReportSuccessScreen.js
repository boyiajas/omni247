import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/common/Button';
import { typography, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const ReportSuccessScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
        },
        iconContainer: {
            marginBottom: spacing.xl,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
            marginBottom: spacing.md,
            fontFamily: typography.families.bold,
        },
        message: {
            fontSize: typography.sizes.md,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
            fontFamily: typography.families.regular,
            lineHeight: 22,
        },
        info: {
            alignSelf: 'stretch',
            marginBottom: spacing.xl,
        },
        infoText: {
            fontSize: typography.sizes.md,
            color: palette.textPrimary,
            marginBottom: spacing.sm,
            fontFamily: typography.families.regular,
        },
        button: {
            width: '100%',
            marginBottom: spacing.md,
        },
    }));
    const handleViewReport = () => {
        navigation.navigate('MainTabs', { screen: 'NewsFeed' });
    };

    const handleCreateAnother = () => {
        navigation.navigate('ReportCategory');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="checkmark-circle" size={100} color={colors.success} />
                </View>

                <Text style={styles.title}>{t('reportSuccess.title')}</Text>
                <Text style={styles.message}>
                    {t('reportSuccess.body')}
                </Text>

                <View style={styles.info}>
                    <Text style={styles.infoText}>
                        {t('reportSuccess.infoReceived')}
                    </Text>
                    <Text style={styles.infoText}>
                        {t('reportSuccess.infoVerifying')}
                    </Text>
                    <Text style={styles.infoText}>
                        {t('reportSuccess.infoNotify')}
                    </Text>
                </View>

                <Button
                    title={t('reportSuccess.viewReport')}
                    onPress={handleViewReport}
                    style={styles.button}
                />

                <Button
                    title={t('reportSuccess.submitAnother')}
                    variant="outline"
                    onPress={handleCreateAnother}
                    style={styles.button}
                />
                </View>
            </View>
        </SafeAreaView>
    );
};
export default ReportSuccessScreen;
