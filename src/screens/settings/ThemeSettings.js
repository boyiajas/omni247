import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import { typography, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSettings = () => {
    const { t } = useLanguage();
    const { theme, themeKey, setTheme, themes } = useTheme();
    const colors = theme.colors;

    const themeOptions = [
        { key: 'light', label: t('theme.light') },
        { key: 'dark', label: t('theme.dark') },
        { key: 'pink', label: t('theme.pink') },
        { key: 'grey', label: t('theme.grey') },
        { key: 'gold', label: t('theme.gold') },
        { key: 'emerald', label: t('theme.emerald') },
        { key: 'ocean', label: t('theme.ocean') },
        { key: 'violet', label: t('theme.violet') },
        { key: 'midnight', label: t('theme.midnight') },
        { key: 'charcoal', label: t('theme.charcoal') },
        { key: 'obsidian', label: t('theme.obsidian') },
        { key: 'slate', label: t('theme.slate') },
        { key: 'indigoNight', label: t('theme.indigoNight') },
        { key: 'amoled', label: t('theme.amoled') },
    ];

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
            marginBottom: spacing.xs,
            fontFamily: typography.families.bold,
        },
        subtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.regular,
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
        optionPreview: {
            width: 32,
            height: 32,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
        },
        optionSwatch: {
            width: 16,
            height: 16,
            borderRadius: 6,
        },
        optionRight: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    }), [colors]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('settings.theme')}</Text>
            <Text style={styles.subtitle}>{t('settings.themeSubtitle')}</Text>

            <Card>
                {themeOptions.map((option, index) => {
                    const preview = themes[option.key]?.primary || colors.primary;
                    const isSelected = themeKey === option.key;
                    return (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.optionRow,
                                index === themeOptions.length - 1 && styles.optionRowLast,
                            ]}
                            onPress={() => setTheme(option.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.optionTitle}>{option.label}</Text>
                            <View style={styles.optionRight}>
                                <View style={styles.optionPreview}>
                                    <View style={[styles.optionSwatch, { backgroundColor: preview }]} />
                                </View>
                                <Icon
                                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                                    size={22}
                                    color={isSelected ? colors.primary : colors.neutralMedium}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </Card>
        </ScrollView>
    );
};

export default ThemeSettings;
