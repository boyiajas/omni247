import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../services/api/reports';

const STATUS_THEME = {
    pending: { label: 'Pending', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', icon: 'clock-outline' },
    investigating: { label: 'Investigating', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', icon: 'shield-search' },
    verified: { label: 'Verified', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', icon: 'check-circle' },
    resolved: { label: 'Resolved', color: '#6366f1', background: 'rgba(99, 102, 241, 0.15)', icon: 'check-decagram' },
    rejected: { label: 'Rejected', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', icon: 'close-circle' },
};

const MyReportCard = ({ report, onPress }) => {
    const theme = STATUS_THEME[report.status] || STATUS_THEME.pending;
    return (
        <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.reportHeader}>
                <View style={styles.reportCategory}>
                    <Icon name={report.category?.icon || 'alert-circle'} size={18} color={colors.primary} />
                    <Text style={styles.reportCategoryText}>{report.category?.name || 'Uncategorized'}</Text>
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
                #{report.reference_code || report.id} • {formatDate(report.created_at)}
            </Text>
            <View style={styles.reportFooter}>
                <InfoChip icon="map-marker" text={report.city || report.address || 'Unknown location'} />
                <InfoChip icon="comment" text={`${report.comments_count || 0} comments`} />
            </View>
        </TouchableOpacity>
    );
};

const InfoChip = ({ icon, text }) => (
    <View style={styles.infoChip}>
        <Icon name={icon} size={14} color={colors.neutralDark} />
        <Text style={styles.infoChipText} numberOfLines={1}>
            {text}
        </Text>
    </View>
);

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const SummaryCard = ({ label, value, icon, color, style: customStyle }) => (
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
    const routeUser = route?.params || {};
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

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
            setError('Unable to fetch your reports right now.');
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
                    <Text style={styles.loaderText}>Loading your reports…</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorCard}>
                    <Icon name="wifi-off" size={32} color={colors.secondary} />
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorSubtitle}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadReports()}>
                        <Text style={styles.retryText}>Try again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (reports.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="file-document-outline" size={48} color={colors.neutralMedium} />
                    <Text style={styles.emptyTitle}>No reports yet</Text>
                    <Text style={styles.emptySubtitle}>Submit your first report to see it here.</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ReportFlow')}>
                        <Text style={styles.primaryButtonText}>Create a report</Text>
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
                        <Text style={styles.heroEyebrow}>My Reports</Text>
                        <Text style={styles.heroTitle}>{routeUser?.name || user?.name || 'Your profile'}</Text>
                        <Text style={styles.heroSubtitle}>{routeUser?.email || user?.email || ''}</Text>
                    </View>
                    <View style={styles.heroMeta}>
                        <Icon name="clipboard-text" size={18} color={colors.white} />
                        <Text style={styles.heroMetaText}>{summary.total} total</Text>
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    {[
                        { label: 'Total', value: summary.total, icon: 'file-multiple', color: '#3b82f6' },
                        { label: 'Verified', value: summary.verified, icon: 'shield-check', color: '#10b981' },
                        { label: 'Resolved', value: summary.resolved, icon: 'check-circle', color: '#8b5cf6' },
                        { label: 'Pending', value: summary.pending, icon: 'progress-clock', color: '#f97316' },
                    ].map((card, index, arr) => (
                        <SummaryCard
                            key={card.label}
                            {...card}
                            style={index < arr.length - 1 ? styles.summarySpacing : null}
                        />
                    ))}
                </View>

                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    heroCard: {
        backgroundColor: colors.primary,
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
        color: colors.white,
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
        color: colors.white,
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
        backgroundColor: colors.white,
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
        color: colors.neutralDark,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.neutralMedium,
    },
    reportList: {},
    reportCard: {
        backgroundColor: colors.white,
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
        color: colors.neutralDark,
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
        color: colors.neutralDark,
        marginBottom: 6,
    },
    reportMeta: {
        color: colors.neutralMedium,
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
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 10,
        marginBottom: 8,
    },
    infoChipText: {
        fontSize: 12,
        color: colors.neutralDark,
        maxWidth: 140,
        marginLeft: 6,
    },
    loader: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    loaderText: {
        marginTop: spacing.md,
        color: colors.neutralMedium,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyTitle: {
        marginTop: spacing.md,
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutralDark,
    },
    emptySubtitle: {
        color: colors.neutralMedium,
        marginTop: 4,
        marginBottom: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    errorCard: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.lg,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutralDark,
        marginTop: spacing.sm,
    },
    errorSubtitle: {
        color: colors.neutralMedium,
        textAlign: 'center',
        marginTop: 4,
    },
    retryButton: {
        marginTop: spacing.sm,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    retryText: {
        color: colors.secondary,
        fontWeight: '600',
    },
});

export default UserProfileScreen;
