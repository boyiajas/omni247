import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const { width } = Dimensions.get('window');

export default function AgencyDashboardScreen() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...typography.body,
      color: palette.textSecondary,
      marginTop: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      ...typography.h2,
      color: palette.textPrimary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
    },
    headerButtonText: {
      ...typography.caption,
      color: palette.textPrimary,
      marginLeft: 5,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
    },
    tabActive: {
      backgroundColor: palette.primary,
    },
    tabText: {
      ...typography.caption,
      color: palette.textSecondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: palette.white,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    statCard: {
      flex: 1,
      backgroundColor: palette.white,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 5,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    highlightCard: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}05`,
    },
    statNumber: {
      ...typography.h1,
      color: palette.textPrimary,
      fontSize: 32,
    },
    highlightNumber: {
      color: palette.primary,
    },
    statLabel: {
      ...typography.caption,
      color: palette.textPrimary,
      fontWeight: '600',
      marginTop: 5,
    },
    statSubLabel: {
      ...typography.small,
      color: palette.textSecondary,
    },
    alertsSection: {
      marginBottom: 25,
    },
    sectionTitle: {
      ...typography.h3,
      color: palette.textPrimary,
      marginBottom: 15,
    },
    alertCard: {
      flexDirection: 'row',
      backgroundColor: palette.white,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
    },
    urgencyIndicator: {
      width: 6,
      height: '100%',
    },
    alertContent: {
      flex: 1,
      padding: 15,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    alertTitle: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
      flex: 1,
      marginRight: 10,
    },
    urgencyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    urgencyText: {
      ...typography.small,
      fontWeight: '600',
    },
    alertLocation: {
      ...typography.caption,
      color: palette.textSecondary,
      marginBottom: 12,
    },
    alertMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
      marginBottom: 5,
    },
    metaText: {
      ...typography.small,
      color: palette.textSecondary,
      marginLeft: 4,
    },
    verificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: `${palette.accent}20`,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    verificationText: {
      ...typography.small,
      color: palette.accent,
      marginLeft: 5,
      fontWeight: '600',
    },
    mapSection: {
      marginBottom: 25,
    },
    mapContainer: {
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    heatPoint: {
      borderRadius: 50,
      opacity: 0.7,
    },
    chartSection: {
      marginBottom: 25,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 15,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    legendText: {
      ...typography.caption,
      color: palette.textSecondary,
    },
    agencyInfo: {
      marginBottom: 20,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
    },
    infoItem: {
      width: '50%',
      padding: 10,
    },
    infoLabel: {
      ...typography.caption,
      color: palette.textSecondary,
      marginTop: 5,
    },
    infoValue: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
    },
  }));
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const locale = language === 'yo' ? 'yo-NG' : 'en-US';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      const mockData = {
        stats: {
          total_reports: { last_24h: 47 },
          high_priority: { last_24h: 15, pending: 3 },
          categories: [
            { name: 'Crime', count: 18 },
            { name: 'Accident', count: 12 },
            { name: 'Environment', count: 8 },
            { name: 'Politics', count: 5 },
            { name: 'Infrastructure', count: 4 },
          ],
          response_time: { average: 28, best: 12 },
        },
        alerts: [
          {
            id: '1',
            title: 'Armed Robbery – Financial District',
            category: 'Crime',
            urgency: 'critical',
            distance: '1.2',
            time_ago: '5 min ago',
            confirmations: 12,
            location: 'Financial District, New York',
            verification_score: 92,
          },
          {
            id: '2',
            title: 'Major Fire – Residential Building',
            category: 'Accident',
            urgency: 'high',
            distance: '3.4',
            time_ago: '15 min ago',
            confirmations: 8,
            location: 'Downtown, New York',
            verification_score: 88,
          },
        ],
        heatmap: [
          { lat: 40.7128, lng: -74.0060, intensity: 10, max_urgency: 'critical' },
          { lat: 40.7589, lng: -73.9851, intensity: 8, max_urgency: 'high' },
          { lat: 40.7831, lng: -73.9712, intensity: 6, max_urgency: 'medium' },
        ],
        trends: [
          { date: '2024-01-01', reports: 42, resolved: 38, high_priority: 8 },
          { date: '2024-01-02', reports: 45, resolved: 40, high_priority: 10 },
          { date: '2024-01-03', reports: 38, resolved: 35, high_priority: 7 },
          { date: '2024-01-04', reports: 52, resolved: 45, high_priority: 12 },
          { date: '2024-01-05', reports: 47, resolved: 42, high_priority: 9 },
          { date: '2024-01-06', reports: 41, resolved: 38, high_priority: 8 },
          { date: '2024-01-07', reports: 39, resolved: 36, high_priority: 6 },
        ],
        agency: {
          name: 'NYC Emergency Services',
          jurisdiction: 'New York City',
          verified_users: 145,
        },
      };

      setTimeout(() => {
        setDashboardData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData?.stats.total_reports.last_24h || 0}</Text>
        <Text style={styles.statLabel}>{t('agency.statsReports')}</Text>
        <Text style={styles.statSubLabel}>{t('agency.last24Hours')}</Text>
      </View>

      <View style={[styles.statCard, styles.highlightCard]}>
        <Text style={[styles.statNumber, styles.highlightNumber]}>
          {dashboardData?.stats.high_priority.last_24h || 0}
        </Text>
        <Text style={styles.statLabel}>{t('agency.statsHighPriority')}</Text>
        <Text style={styles.statSubLabel}>{t('agency.last24Hours')}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData?.stats.high_priority.pending || 0}</Text>
        <Text style={styles.statLabel}>{t('agency.statsPending')}</Text>
        <Text style={styles.statSubLabel}>{t('agency.statsHighPriority')}</Text>
      </View>
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.alertsSection}>
      <Text style={styles.sectionTitle}>{t('agency.highPriorityAlerts')}</Text>
      {dashboardData?.alerts.map((alert) => {
        const urgencyLabel = t(`agency.urgency.${alert.urgency}`);
        return (
        <TouchableOpacity key={alert.id} style={styles.alertCard}>
          <View style={[
            styles.urgencyIndicator,
            { backgroundColor: alert.urgency === 'critical' ? colors.secondary : colors.warning }
          ]} />
          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View style={[
                styles.urgencyBadge,
                { backgroundColor: alert.urgency === 'critical' ? `${colors.secondary}20` : `${colors.warning}20` }
              ]}>
                <Text style={[
                  styles.urgencyText,
                  { color: alert.urgency === 'critical' ? colors.secondary : colors.warning }
                ]}>
                  {urgencyLabel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.alertLocation}>{alert.location}</Text>
            <View style={styles.alertMeta}>
              <View style={styles.metaItem}>
                <Icon name="map-marker-distance" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{t('agency.kmAway', { count: alert.distance })}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="clock-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{alert.time_ago}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="account-group" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{t('agency.confirmations', { count: alert.confirmations })}</Text>
              </View>
            </View>
            <View style={styles.verificationBadge}>
              <Icon name="shield-check" size={14} color={colors.accent} />
              <Text style={styles.verificationText}>{t('agency.verifiedPercent', { count: alert.verification_score })}</Text>
            </View>
          </View>
        </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHeatMap = () => (
    <View style={styles.mapSection}>
      <Text style={styles.sectionTitle}>{t('agency.heatMapTitle')}</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 40.7128,
            longitude: -74.0060,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {dashboardData?.heatmap.map((point, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              title={t('agency.reportCount', { count: point.intensity })}
            >
              <View style={[
                styles.heatPoint,
                { 
                  width: point.intensity * 8,
                  height: point.intensity * 8,
                  backgroundColor: point.max_urgency === 'critical' ? 
                    `${colors.secondary}80` : 
                    `${colors.warning}80`,
                }
              ]} />
            </Marker>
          ))}
        </MapView>
      </View>
    </View>
  );

  const renderTrendsChart = () => {
    if (!dashboardData?.trends) return null;

    const labels = dashboardData.trends.map(t => 
      new Date(t.date).toLocaleDateString(locale, { weekday: 'short' })
    );
    const reportsData = dashboardData.trends.map(t => t.reports);
    const resolvedData = dashboardData.trends.map(t => t.resolved);

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>{t('agency.trendsTitle')}</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: reportsData,
                color: (opacity = 1) => colors.primary,
                strokeWidth: 2,
              },
              {
                data: resolvedData,
                color: (opacity = 1) => colors.accent,
                strokeWidth: 2,
              },
            ],
          }}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: colors.white,
            backgroundGradientFrom: colors.white,
            backgroundGradientTo: colors.white,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.textSecondary,
            labelColor: (opacity = 1) => colors.textPrimary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.white,
            },
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>{t('agency.legendTotal')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>{t('agency.legendResolved')}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('agency.loadingDashboard')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('agency.dashboardTitle')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="export" size={20} color={colors.textPrimary} />
            <Text style={styles.headerButtonText}>{t('agency.export')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="cog" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'overview', label: t('agency.tabs.overview') },
          { key: 'analytics', label: t('agency.tabs.analytics') },
          { key: 'reports', label: t('agency.tabs.reports') },
          { key: 'settings', label: t('agency.tabs.settings') },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setSelectedTab(tab.key)}>
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderStatsCards()}
        {renderAlerts()}
        {renderHeatMap()}
        {renderTrendsChart()}

        <View style={styles.agencyInfo}>
          <Text style={styles.sectionTitle}>{t('agency.infoTitle')}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="office-building" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>{t('agency.infoName')}</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="map-marker-radius" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>{t('agency.infoJurisdiction')}</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.jurisdiction}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="account-check" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>{t('agency.infoVerifiedUsers')}</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.verified_users}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="timer" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>{t('agency.infoAvgResponse')}</Text>
              <Text style={styles.infoValue}>{t('agency.minutesValue', { count: dashboardData?.stats.response_time.average })}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
