import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    SectionList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rewardsAPI } from '../../services/api/rewards';
import { useLanguage } from '../../contexts/LanguageContext';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const AchievementsScreen = ({ navigation }) => {
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
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        headerSpacer: {
            width: 24,
            height: 24,
        },
        title: {
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.semibold,
            color: palette.textPrimary,
            fontFamily: typography.families.bold,
        },
        content: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
        },
        summaryCard: {
            backgroundColor: palette.white,
            borderRadius: 14,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: palette.border,
        },
        summaryTitle: {
            ...typography.caption,
            color: palette.textSecondary,
            marginBottom: 6,
        },
        summaryValue: {
            ...typography.bodyLarge,
            color: palette.textPrimary,
        },
        sectionTitle: {
            ...typography.caption,
            color: palette.textSecondary,
            marginBottom: spacing.sm,
            marginTop: spacing.sm,
            textTransform: 'uppercase',
        },
        card: {
            flexDirection: 'row',
            backgroundColor: palette.white,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.sm,
            borderWidth: 1,
            borderColor: palette.border,
        },
        iconWrap: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
        },
        cardBody: {
            flex: 1,
        },
        cardTitle: {
            ...typography.bodyLarge,
            color: palette.textPrimary,
            marginBottom: 4,
        },
        cardDesc: {
            ...typography.caption,
            color: palette.textSecondary,
            marginBottom: 6,
        },
        cardMeta: {
            ...typography.small,
        },
        earnedText: {
            color: palette.success,
            fontFamily: typography.families.medium,
        },
        lockedText: {
            color: palette.textSecondary,
            fontFamily: typography.families.medium,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: spacing.xl,
        },
        loadingText: {
            marginTop: spacing.sm,
            color: palette.textSecondary,
            ...typography.body,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.lg,
        },
        emptyTitle: {
            marginTop: spacing.md,
            ...typography.bodyLarge,
            color: palette.textPrimary,
        },
        emptyCaption: {
            marginTop: spacing.xs,
            ...typography.caption,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        errorText: {
            ...typography.caption,
            color: palette.error,
            textAlign: 'center',
            marginTop: spacing.md,
        },
    }));
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadAchievements = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await rewardsAPI.getUserAchievements();
            setAchievements(response?.data?.achievements || []);
            setError(null);
        } catch (err) {
            setError('Failed to load achievements');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAchievements();
    }, []);

    const sections = useMemo(() => {
        const earned = achievements.filter((item) => item.earned);
        const locked = achievements.filter((item) => !item.earned);
        return [
            { title: t('achievements.earned'), data: earned },
            { title: t('achievements.locked'), data: locked },
        ];
    }, [achievements, t]);

    const earnedCount = achievements.filter((item) => item.earned).length;

    const renderItem = ({ item }) => {
        const iconName = item.icon || 'trophy';
        const iconColor = item.earned ? item.color : colors.textSecondary;
        const iconBg = item.earned ? `${item.color}20` : colors.neutralLight;
        return (
            <View style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                    <Icon name={iconName} size={24} color={iconColor} />
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                    <Text style={[styles.cardMeta, item.earned ? styles.earnedText : styles.lockedText]}>
                        {item.earned ? t('achievements.earned') : t('achievements.locked')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Icon name="arrow-left" size={24} color={colors.textPrimary} onPress={() => navigation.goBack()} />
                <Text style={styles.title}>{t('achievements.title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('achievements.loading')}</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => `${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadAchievements(true)}
                            colors={[colors.primary]}
                        />
                    }
                    ListHeaderComponent={
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>{t('achievements.progress')}</Text>
                            <Text style={styles.summaryValue}>
                                {earnedCount} / {achievements.length || 0} achievements earned
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="trophy-outline" size={40} color={colors.textSecondary} />
                            <Text style={styles.emptyTitle}>{t('achievements.emptyTitle')}</Text>
                            <Text style={styles.emptyCaption}>
                                {t('achievements.emptyCaption')}
                            </Text>
                        </View>
                    }
                    renderSectionHeader={({ section }) => (
                        section.data.length ? (
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        ) : null
                    )}
                    ListFooterComponent={
                        error ? <Text style={styles.errorText}>{error}</Text> : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default AchievementsScreen;
