import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import { typography, spacing } from '../../theme';
import { authAPI } from '../../services/api/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const LanguageSettings = () => {
    const { language, setLanguage, t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const colors = theme.colors;

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
        optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        optionRowLast: {
            borderBottomWidth: 0,
        },
        optionTitle: {
            fontSize: typography.sizes.md,
            fontFamily: typography.families.semibold,
            color: colors.textPrimary,
        },
        optionSubtitle: {
            marginTop: 2,
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        optionIcon: {
            marginLeft: spacing.md,
        },
        loadingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
        },
        loadingText: {
            marginLeft: spacing.sm,
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
    }), [colors]);

    const options = [
        { key: 'en', label: t('language.english'), subtitle: t('language.englishSubtitle') },
        { key: 'yo', label: t('language.yoruba'), subtitle: t('language.yorubaSubtitle') },
    ];

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const response = await authAPI.getLanguageSettings();
                const selected = response?.data?.language || 'en';
                setLanguage(selected);
            } catch (error) {
                // Keep current language on failure.
            } finally {
                setLoading(false);
            }
        };

        loadLanguage();
    }, []);

    const handleSelect = async (key) => {
        if (key === language) {
            return;
        }
        const previous = language;
        setLanguage(key);
        try {
            const response = await authAPI.updateLanguageSettings({ language: key });
            setLanguage(response?.data?.language || key);
        } catch (error) {
            setLanguage(previous);
            Alert.alert('Error', t('language.updateError'));
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>{t('language.title')}</Text>

            <Card>
                {loading ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>{t('language.loading')}</Text>
                    </View>
                ) : (
                    options.map((option, index) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.optionRow,
                                index === options.length - 1 && styles.optionRowLast,
                            ]}
                            onPress={() => handleSelect(option.key)}
                            activeOpacity={0.8}
                        >
                            <View>
                                <Text style={styles.optionTitle}>{option.label}</Text>
                                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                            </View>
                            <View style={styles.optionIcon}>
                                {language === option.key ? (
                                    <Icon name="radiobox-marked" size={22} color={colors.primary} />
                                ) : (
                                    <Icon name="radiobox-blank" size={22} color={colors.neutralMedium} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LanguageSettings;
