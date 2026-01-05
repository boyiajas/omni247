import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { reportsAPI } from '../../services/api/reports';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useThemedStyles from '../../theme/useThemedStyles';

const STAR_LEVELS = [5, 4, 3, 2, 1];

const ReportRatingScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = theme.colors;
    const initialReport = route.params?.report || null;
    const reportId = route.params?.reportId || initialReport?.id;

    const [report, setReport] = useState(initialReport);
    const [loading, setLoading] = useState(!initialReport);
    const [filter, setFilter] = useState('all');

    const styles = useThemedStyles((palette) => ({
        container: { flex: 1, backgroundColor: palette.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        headerTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: palette.textPrimary,
            fontFamily: typography.families.semibold,
        },
        headerSpacer: { width: 24, height: 24 },
        content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
        summaryCard: {
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: palette.border,
            marginBottom: spacing.lg,
        },
        summaryTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        averageText: {
            fontSize: 36,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
        },
        starsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.xs,
        },
        totalReviews: {
            color: palette.textSecondary,
            marginTop: spacing.xs,
            fontSize: typography.sizes.sm,
        },
        breakdown: {
            marginTop: spacing.md,
            gap: 8,
        },
        breakdownRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        breakdownLabel: {
            width: 24,
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
            textAlign: 'right',
        },
        barTrack: {
            flex: 1,
            height: 6,
            backgroundColor: palette.neutralLight,
            borderRadius: 999,
            overflow: 'hidden',
        },
        barFill: {
            height: 6,
            borderRadius: 999,
        },
        breakdownCount: {
            width: 28,
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
            textAlign: 'right',
        },
        filterCard: {
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: palette.border,
            marginBottom: spacing.lg,
        },
        filterTitle: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: palette.textPrimary,
            marginBottom: spacing.sm,
        },
        filterOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 6,
        },
        filterLabel: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
        },
        listCard: {
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: palette.border,
        },
        reviewItem: {
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        reviewTitle: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: palette.textPrimary,
            marginBottom: spacing.xs,
        },
        reviewMeta: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
            marginBottom: spacing.xs,
        },
        reviewBody: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
        },
        emptyState: {
            paddingVertical: spacing.lg,
            textAlign: 'center',
            color: palette.textSecondary,
        },
        loading: {
            paddingVertical: spacing.xl,
            alignItems: 'center',
        },
        actionRow: {
            marginTop: spacing.md,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        actionButton: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: 12,
            backgroundColor: palette.primary,
        },
        actionText: {
            color: palette.white,
            fontWeight: typography.weights.semibold,
            fontSize: typography.sizes.sm,
        },
    }));

    useEffect(() => {
        if (!reportId) {
            setLoading(false);
            return;
        }

        const fetchReport = async () => {
            try {
                setLoading(true);
                const response = await reportsAPI.getReportDetail(reportId);
                setReport(response.data);
            } catch (error) {
                setReport(initialReport || null);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId, initialReport]);

    const ratings = report?.ratings || [];
    const averageRating = Number(report?.average_rating || 0);
    const totalReviews = ratings.length;

    const breakdown = useMemo(() => {
        const counts = STAR_LEVELS.reduce((acc, level) => {
            acc[level] = ratings.filter((r) => Number(r.rating) === level).length;
            return acc;
        }, {});

        return counts;
    }, [ratings]);

    const filteredReviews = useMemo(() => {
        if (filter === 'all') return ratings;
        return ratings.filter((r) => Number(r.rating) === Number(filter));
    }, [ratings, filter]);

    const renderStars = (value, size = 16) => {
        const rounded = Math.round(value);
        return (
            <View style={styles.starsRow}>
                {STAR_LEVELS.slice().reverse().map((level) => (
                    <Icon
                        key={level}
                        name={level <= rounded ? 'star' : 'star-outline'}
                        size={size}
                        color={level <= rounded ? colors.warning : colors.textSecondary}
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('reportDetail.ratingDetailsTitle') || 'Report Reviews'}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                        <View>
                            <Text style={styles.averageText}>{averageRating.toFixed(1)}</Text>
                            {renderStars(averageRating, 18)}
                            <Text style={styles.totalReviews}>
                                {totalReviews} {t('reportDetail.reviewsLabel') || 'Reviews'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.reviewTitle}>{report?.title || t('reportDetail.titleFallback')}</Text>
                            <Text style={styles.reviewMeta}>
                                {t('reportDetail.reviewsSummary', { count: totalReviews }) || `1 to ${Math.min(10, totalReviews)} of ${totalReviews} Reviews`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.breakdown}>
                        {STAR_LEVELS.map((level) => {
                            const count = breakdown[level] || 0;
                            const ratio = totalReviews ? count / totalReviews : 0;
                            return (
                                <View key={level} style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>{level}</Text>
                                    <Icon name="star" size={14} color={colors.warning} />
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={styles.breakdownCount}>{count}</Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.actionText}>{t('reportDetail.writeReview') || 'Rate this report'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.filterCard}>
                    <Text style={styles.filterTitle}>{t('reportDetail.filterByRating') || 'Filter by rating'}</Text>
                    <TouchableOpacity style={styles.filterOption} onPress={() => setFilter('all')}>
                        <Text style={styles.filterLabel}>{t('reportDetail.filterAll') || 'All ratings'}</Text>
                        <Icon
                            name={filter === 'all' ? 'radiobox-marked' : 'radiobox-blank'}
                            size={18}
                            color={filter === 'all' ? colors.primary : colors.textSecondary}
                        />
                    </TouchableOpacity>
                    {STAR_LEVELS.map((level) => (
                        <TouchableOpacity key={level} style={styles.filterOption} onPress={() => setFilter(level)}>
                            <Text style={styles.filterLabel}>{level} {t('reportDetail.starsLabel') || 'stars'}</Text>
                            <Icon
                                name={filter === level ? 'radiobox-marked' : 'radiobox-blank'}
                                size={18}
                                color={filter === level ? colors.primary : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.listCard}>
                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : filteredReviews.length === 0 ? (
                        <Text style={styles.emptyState}>{t('reportDetail.noReviews') || 'No reviews yet.'}</Text>
                    ) : (
                        filteredReviews.map((review, index) => (
                            <View
                                key={review.id || index}
                                style={[
                                    styles.reviewItem,
                                    index === filteredReviews.length - 1 && { borderBottomWidth: 0 },
                                ]}
                            >
                                {renderStars(Number(review.rating), 16)}
                                <Text style={styles.reviewTitle}>{review.title || t('reportDetail.reviewTitleFallback') || report?.title}</Text>
                                <Text style={styles.reviewMeta}>
                                    {(review.user?.name || t('profile.anonymous')) + ' • ' + new Date(review.created_at).toLocaleDateString()}
                                </Text>
                                <Text style={styles.reviewBody}>
                                    {review.comment || t('reportDetail.reviewNoComment') || 'No comment provided.'}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ReportRatingScreen;
