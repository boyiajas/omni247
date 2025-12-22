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
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function AgencyDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

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
        <Text style={styles.statLabel}>Reports</Text>
        <Text style={styles.statSubLabel}>Last 24h</Text>
      </View>

      <View style={[styles.statCard, styles.highlightCard]}>
        <Text style={[styles.statNumber, styles.highlightNumber]}>
          {dashboardData?.stats.high_priority.last_24h || 0}
        </Text>
        <Text style={styles.statLabel}>High Priority</Text>
        <Text style={styles.statSubLabel}>Last 24h</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData?.stats.high_priority.pending || 0}</Text>
        <Text style={styles.statLabel}>Pending</Text>
        <Text style={styles.statSubLabel}>High Priority</Text>
      </View>
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.alertsSection}>
      <Text style={styles.sectionTitle}>High Priority Alerts</Text>
      {dashboardData?.alerts.map((alert) => (
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
                  {alert.urgency.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.alertLocation}>{alert.location}</Text>
            <View style={styles.alertMeta}>
              <View style={styles.metaItem}>
                <Icon name="map-marker-distance" size={14} color={colors.neutralMedium} />
                <Text style={styles.metaText}>{alert.distance}km away</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="clock-outline" size={14} color={colors.neutralMedium} />
                <Text style={styles.metaText}>{alert.time_ago}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="account-group" size={14} color={colors.neutralMedium} />
                <Text style={styles.metaText}>{alert.confirmations} confirmations</Text>
              </View>
            </View>
            <View style={styles.verificationBadge}>
              <Icon name="shield-check" size={14} color={colors.accent} />
              <Text style={styles.verificationText}>{alert.verification_score}% verified</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeatMap = () => (
    <View style={styles.mapSection}>
      <Text style={styles.sectionTitle}>Incident Heat Map</Text>
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
              title={`${point.intensity} reports`}
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
      new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })
    );
    const reportsData = dashboardData.trends.map(t => t.reports);
    const resolvedData = dashboardData.trends.map(t => t.resolved);

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>7-Day Trends</Text>
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
            color: (opacity = 1) => colors.neutralMedium,
            labelColor: (opacity = 1) => colors.neutralDark,
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
            <Text style={styles.legendText}>Total Reports</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>Resolved</Text>
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
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agency Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="export" size={20} color={colors.neutralDark} />
            <Text style={styles.headerButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="cog" size={20} color={colors.neutralDark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {['overview', 'analytics', 'reports', 'settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.tabActive,
            ]}
            onPress={() => setSelectedTab(tab)}>
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.tabTextActive,
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          <Text style={styles.sectionTitle}>Agency Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="office-building" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="map-marker-radius" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>Jurisdiction</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.jurisdiction}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="account-check" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>Verified Users</Text>
              <Text style={styles.infoValue}>{dashboardData?.agency.verified_users}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="timer" size={24} color={colors.primary} />
              <Text style={styles.infoLabel}>Avg. Response</Text>
              <Text style={styles.infoValue}>{dashboardData?.stats.response_time.average}m</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.neutralMedium,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutralDark,
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
    color: colors.neutralDark,
    marginLeft: 5,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: colors.neutralMedium,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  highlightCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}05`,
  },
  statNumber: {
    ...typography.h1,
    color: colors.neutralDark,
    fontSize: 32,
  },
  highlightNumber: {
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutralDark,
    fontWeight: '600',
    marginTop: 5,
  },
  statSubLabel: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  alertsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutralDark,
    marginBottom: 15,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutralLight,
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
    color: colors.neutralDark,
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
    color: colors.neutralMedium,
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
    color: colors.neutralMedium,
    marginLeft: 4,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verificationText: {
    ...typography.small,
    color: colors.accent,
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
    color: colors.neutralMedium,
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
    color: colors.neutralMedium,
    marginTop: 5,
  },
  infoValue: {
    ...typography.body,
    color: colors.neutralDark,
    fontWeight: '600',
  },
});