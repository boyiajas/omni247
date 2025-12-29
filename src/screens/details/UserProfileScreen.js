import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../services/api/reports';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const getStatusTheme = (t) => ({
    pending: { label: t('userProfile.statusPending'), color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', icon: 'clock-outline' },
    investigating: { label: t('userProfile.statusInvestigating'), color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', icon: 'shield-search' },
    verified: { label: t('userProfile.statusVerified'), color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', icon: 'check-circle' },
    resolved: { label: t('userProfile.statusResolved'), color: '#6366f1', background: 'rgba(99, 102, 241, 0.15)', icon: 'check-decagram' },
    rejected: { label: t('userProfile.statusRejected'), color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', icon: 'close-circle' },
});

const MyReportCard = ({ report, onPress, statusTheme, t, locale, styles, colors }) => {
    const theme = statusTheme[report.status] || statusTheme.pending;
    return (
        <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.reportHeader}>
                <View style={styles.reportCategory}>
                    <Icon name={report.category?.icon || 'alert-circle'} size={18} color={colors.primary} />
                    <Text style={styles.reportCategoryText}>{report.category?.name || t('userProfile.uncategorized')}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: theme.background }]}>
                    <Icon name={theme.icon} size={14} color={theme.color} />
                    <Text style={[styles.statusPillText, { color: theme.color }]}>{theme.label}</Text>
                </View>
            </View>
            <Text style={styles.reportTitle} numberOfLines={2}>
                {report.title}
            </Text>
            <Text style={styles.reportMeta}>
                #{report.reference_code || report.id} • {formatDate(report.created_at, locale, t)}
            </Text>
            <View style={styles.reportFooter}>
                <InfoChip icon="map-marker" text={report.city || report.address || t('userProfile.unknownLocation')} styles={styles} colors={colors} />
                <InfoChip icon="comment" text={t('userProfile.commentsCount', { count: report.comments_count || 0 })} styles={styles} colors={colors} />
            </View>
        </TouchableOpacity>
    );
};

const InfoChip = ({ icon, text, styles, colors }) => (
    <View style={styles.infoChip}>
        <Icon name={icon} size={14} color={colors.textPrimary} />
        <Text style={styles.infoChipText} numberOfLines={1}>
            {text}
        </Text>
    </View>
);

const formatDate = (dateString, locale, t) => {
    if (!dateString) return t('userProfile.unknownDate');
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const SummaryCard = ({ label, value, icon, color, style: customStyle, styles }) => (
    <View style={[styles.summaryCard, customStyle]}>
        <View style={[styles.summaryIcon, { backgroundColor: `${color}15` }]}>
            <Icon name={icon} size={18} color={color} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const UserProfileScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        safeArea: {
            flex: 1,
            backgroundColor: palette.background,
        },
        container: {
            flex: 1,
        },
        scrollContent: {
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
        },
        heroCard: {
            backgroundColor: palette.primary,
            borderRadius: 20,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        heroEyebrow: {
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: 12,
        },
        heroTitle: {
            color: palette.white,
            fontSize: 22,
            fontWeight: '700',
            marginTop: 4,
        },
        heroSubtitle: {
            color: 'rgba(255,255,255,0.85)',
            marginTop: 6,
        },
        heroMeta: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
        },
        heroMetaText: {
            color: palette.white,
            fontWeight: '600',
            marginLeft: 8,
        },
        summaryRow: {
            flexDirection: 'row',
            marginBottom: spacing.lg,
            justifyContent: 'space-between',
        },
        summaryCard: {
            flex: 1,
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.md,
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
        },
        summarySpacing: {
            marginRight: 10,
        },
        summaryIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        summaryValue: {
            fontSize: 18,
            fontWeight: '700',
            color: palette.textPrimary,
        },
        summaryLabel: {
            fontSize: 12,
            color: palette.textSecondary,
        },
        reportList: {},
        reportCard: {
            backgroundColor: palette.white,
            padding: spacing.md,
            borderRadius: 18,
            shadowColor: '#0f172a',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 2,
            marginBottom: 12,
        },
        reportHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        reportCategory: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        reportCategoryText: {
            fontWeight: '600',
            color: palette.textPrimary,
            marginLeft: 6,
        },
        statusPill: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
        },
        statusPillText: {
            fontSize: 12,
            fontWeight: '600',
            marginLeft: 6,
        },
        reportTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: palette.textPrimary,
            marginBottom: 6,
        },
        reportMeta: {
            color: palette.textSecondary,
            fontSize: 13,
            marginBottom: 10,
        },
        reportFooter: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        infoChip: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            backgroundColor: palette.neutralLight,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginRight: 10,
            marginBottom: 8,
        },
        infoChipText: {
            fontSize: 12,
            color: palette.textPrimary,
            maxWidth: 140,
            marginLeft: 6,
        },
        loader: {
            alignItems: 'center',
            paddingVertical: spacing.xl,
        },
        loaderText: {
            marginTop: spacing.md,
            color: palette.textSecondary,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: spacing.xl,
        },
        emptyTitle: {
            marginTop: spacing.md,
            fontSize: 18,
            fontWeight: '700',
            color: palette.textPrimary,
        },
        emptySubtitle: {
            color: palette.textSecondary,
            marginTop: 4,
            marginBottom: spacing.md,
        },
        primaryButton: {
            backgroundColor: palette.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 999,
        },
        primaryButtonText: {
            color: palette.white,
            fontWeight: '600',
        },
        errorCard: {
            alignItems: 'center',
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.lg,
        },
        errorTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: palette.textPrimary,
            marginTop: spacing.sm,
        },
        errorSubtitle: {
            color: palette.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },
        retryButton: {
            marginTop: spacing.sm,
            paddingHorizontal: 18,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: palette.secondary,
        },
        retryText: {
            color: palette.secondary,
            fontWeight: '600',
        },
    }));
    const routeUser = route?.params || {};
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const locale = language === 'yo' ? 'yo-NG' : 'en-US';
    const statusTheme = useMemo(() => getStatusTheme(t), [t]);

    const loadReports = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await reportsAPI.getUserReports();
            const payload = response.data?.data ?? response.data ?? [];
            setReports(payload);
            setError(null);
        } catch (err) {
            console.error('Unable to load reports', err);
            setError(t('userProfile.errorSubtitle'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const summary = useMemo(() => {
        const total = reports.length;
        const resolved = reports.filter((r) => r.status === 'resolved').length;
        const verified = reports.filter((r) => ['verified', 'investigating'].includes(r.status)).length;
        const pending = total - (resolved + verified);
        return { total, resolved, verified, pending: pending < 0 ? 0 : pending };
    }, [reports]);

    const onRefresh = () => loadReports(true);

    const renderContent = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loaderText}>{t('userProfile.loading')}</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorCard}>
                    <Icon name="wifi-off" size={32} color={colors.secondary} />
                    <Text style={styles.errorTitle}>{t('userProfile.errorTitle')}</Text>
                    <Text style={styles.errorSubtitle}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadReports()}>
                        <Text style={styles.retryText}>{t('userProfile.retry')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (reports.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="file-document-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>{t('userProfile.emptyTitle')}</Text>
                    <Text style={styles.emptySubtitle}>{t('userProfile.emptySubtitle')}</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ReportFlow')}>
                        <Text style={styles.primaryButtonText}>{t('userProfile.createReport')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.reportList}>
                {reports.map((report) => (
                    <MyReportCard
                        key={report.id}
                        report={report}
                        onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
                        statusTheme={statusTheme}
                        t={t}
                        locale={locale}
                        styles={styles}
                        colors={colors}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}>
                <View style={styles.heroCard}>
                    <View>
                        <Text style={styles.heroEyebrow}>{t('userProfile.title')}</Text>
                        <Text style={styles.heroTitle}>{routeUser?.name || user?.name || t('userProfile.profileFallback')}</Text>
                        <Text style={styles.heroSubtitle}>{routeUser?.email || user?.email || ''}</Text>
                    </View>
                <View style={styles.heroMeta}>
                    <Icon name="clipboard-text" size={18} color={colors.white} />
                    <Text style={styles.heroMetaText}>{t('userProfile.totalReports', { count: summary.total })}</Text>
                </View>
            </View>

                <View style={styles.summaryRow}>
                    {[
                        { label: t('userProfile.summaryTotal'), value: summary.total, icon: 'file-multiple', color: '#3b82f6' },
                        { label: t('userProfile.summaryVerified'), value: summary.verified, icon: 'shield-check', color: '#10b981' },
                        { label: t('userProfile.summaryResolved'), value: summary.resolved, icon: 'check-circle', color: '#8b5cf6' },
                        { label: t('userProfile.summaryPending'), value: summary.pending, icon: 'progress-clock', color: '#f97316' },
                    ].map((card, index, arr) => (
                        <SummaryCard
                            key={card.label}
                            {...card}
                            style={index < arr.length - 1 ? styles.summarySpacing : null}
                            styles={styles}
                        />
                    ))}
                </View>

                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};
export default UserProfileScreen;
