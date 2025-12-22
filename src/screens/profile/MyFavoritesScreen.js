import React, { useCallback, useMemo, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { favoritesAPI } from '../../services/api/favorites';
import { colors } from '../../theme/colors';

const STATUS_THEME = {
    pending: { label: 'Pending', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', icon: 'clock-outline' },
    investigating: { label: 'Investigating', color: '#3b82f6', background: 'rgba(59,130,246,0.15)', icon: 'shield-search' },
    verified: { label: 'Verified', color: '#10b981', background: 'rgba(16,185,129,0.15)', icon: 'check-circle' },
    resolved: { label: 'Resolved', color: '#6366f1', background: 'rgba(99,102,241,0.15)', icon: 'check-decagram' },
    rejected: { label: 'Rejected', color: '#ef4444', background: 'rgba(239,68,68,0.15)', icon: 'close-circle' },
};

const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const SummaryCard = ({ label, value, icon, color, style }) => (
    <View style={[styles.summaryCard, style]}>
        <View style={[styles.summaryIcon, { backgroundColor: `${color}15` }]}>
            <Icon name={icon} size={18} color={color} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const InfoChip = ({ icon, text }) => (
    <View style={styles.infoChip}>
        <Icon name={icon} size={14} color={colors.neutralDark} />
        <Text style={styles.infoChipText} numberOfLines={1}>
            {text}
        </Text>
    </View>
);

const FavoriteCard = ({ report, onPress, onRemove }) => {
    const theme = STATUS_THEME[report.status] || STATUS_THEME.pending;

    return (
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.9} onPress={onPress}>
            <View style={styles.reportHeader}>
                <View style={styles.reportCategory}>
                    <Icon name={report.category?.icon || 'folder-star'} size={18} color={colors.primary} />
                    <Text style={styles.reportCategoryText}>{report.category?.name || 'General'}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: theme.background }]}>
                    <Icon name={theme.icon} size={14} color={theme.color} />
                    <Text style={[styles.statusPillText, { color: theme.color }]}>{theme.label}</Text>
                </View>
            </View>

            <Text style={styles.reportTitle} numberOfLines={2}>
                {report.title}
            </Text>
            {report.description ? (
                <Text style={styles.reportSummary} numberOfLines={2}>
                    {report.description}
                </Text>
            ) : null}

            <View style={styles.reportFooter}>
                <InfoChip icon="map-marker" text={report.city || report.address || 'Unknown location'} />
                <InfoChip icon="clock-outline" text={formatDate(report.created_at)} />
                <InfoChip icon="comment" text={`${report.comments_count || 0} comments`} />
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.linkButton} onPress={onPress}>
                    <Icon name="open-in-new" size={16} color={colors.primary} />
                    <Text style={styles.linkButtonText}>View details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton} onPress={onRemove}>
                    <Icon name="heart" size={16} color={colors.error} />
                    <Text style={[styles.linkButtonText, { color: colors.error }]}>Remove</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function MyFavoritesScreen({ navigation }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        try {
            const response = await favoritesAPI.getFavorites();
            setFavorites(response.data || []);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    const handleRemoveFavorite = async (reportId) => {
        try {
            await favoritesAPI.toggleFavorite(reportId);
            setFavorites((prev) => prev.filter((fav) => fav.id !== reportId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const summary = useMemo(() => {
        const total = favorites.length;
        const emergencies = favorites.filter((r) => r.priority === 'emergency' || r.is_emergency).length;
        const verified = favorites.filter((r) => ['verified', 'investigating'].includes(r.status)).length;
        const bookmarkedCities = new Set(
            favorites.map((r) => (r.city || r.address || '').toLowerCase()).filter(Boolean)
        ).size;

        return {
            total,
            emergencies,
            verified,
            locations: bookmarkedCities,
        };
    }, [favorites]);

    const renderContent = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loaderText}>Loading your favorites…</Text>
                </View>
            );
        }

        if (favorites.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="heart-outline" size={48} color={colors.neutralMedium} />
                    <Text style={styles.emptyTitle}>No favorites yet</Text>
                    <Text style={styles.emptySubtitle}>Save reports you care about to revisit them quickly.</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('NewsFeed')}>
                        <Text style={styles.primaryButtonText}>Browse reports</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return favorites.map((report) => (
            <FavoriteCard
                key={report.id}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
                onRemove={() => handleRemoveFavorite(report.id)}
            />
        ));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
            >
                <View style={styles.heroCard}>
                    <View>
                        <Text style={styles.heroEyebrow}>Saved cases</Text>
                        <Text style={styles.heroTitle}>{user?.name || 'Your favorites'}</Text>
                        <Text style={styles.heroSubtitle}>{user?.email || ''}</Text>
                    </View>
                    <View style={styles.heroMeta}>
                        <Icon name="heart" size={18} color={colors.white} />
                        <Text style={styles.heroMetaText}>{summary.total} saved</Text>
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    {[
                        { label: 'Favorites', value: summary.total, icon: 'heart-multiple', color: '#ec4899' },
                        { label: 'Verified', value: summary.verified, icon: 'shield-check', color: '#10b981' },
                        { label: 'Emergency', value: summary.emergencies, icon: 'alarm-light', color: '#ef4444' },
                        { label: 'Cities', value: summary.locations, icon: 'city-variant', color: '#6366f1' },
                    ].map((card, index, arr) => (
                        <SummaryCard
                            key={card.label}
                            {...card}
                            style={index < arr.length - 1 ? styles.summarySpacing : null}
                        />
                    ))}
                </View>

                <View>{renderContent()}</View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
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
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
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
    loader: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loaderText: {
        marginTop: 10,
        color: colors.neutralMedium,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutralDark,
    },
    emptySubtitle: {
        color: colors.neutralMedium,
        marginTop: 6,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    primaryButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    reportCard: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    },
    reportSummary: {
        color: colors.neutralMedium,
        marginTop: 6,
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
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginTop: 12,
        paddingTop: 12,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    linkButtonText: {
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 6,
    },
});
