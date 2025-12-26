import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock data for alerts
const mockAlertsData = [
  {
    title: 'HIGH PRIORITY',
    data: [
      {
        id: '1',
        type: 'emergency',
        title: 'Armed Robbery Reported',
        description: 'Avoid the area, police responding',
        location: 'Financial District, New York',
        distance: '1.2 km away',
        timeAgo: '5 minutes ago',
        priority: 'high',
        isRead: false,
        actionRequired: true,
      },
      {
        id: '2',
        type: 'emergency',
        title: 'Major Fire - Residential Building',
        description: 'Multiple units responding, avoid smoke area',
        location: 'Downtown, New York',
        distance: '3.4 km away',
        timeAgo: '15 minutes ago',
        priority: 'high',
        isRead: true,
        actionRequired: true,
      },
    ],
  },
  {
    title: 'TRENDING',
    data: [
      {
        id: '3',
        type: 'trending',
        title: 'Building Fire - Downtown',
        description: 'Fire department on scene, traffic diverted',
        location: 'Midtown, New York',
        distance: '3.4 km away',
        timeAgo: '15 minutes ago',
        priority: 'medium',
        isRead: true,
        actionRequired: false,
      },
      {
        id: '4',
        type: 'trending',
        title: 'Political Rally Announcement',
        description: 'Expected crowd: 5,000+',
        location: 'City Hall, New York',
        timeAgo: '2 hours ago',
        priority: 'low',
        isRead: true,
        actionRequired: false,
      },
    ],
  },
  {
    title: 'NEWS',
    data: [
      {
        id: '5',
        type: 'news',
        title: 'Community Cleanup Event',
        description: 'Volunteers needed for park cleanup this weekend',
        location: 'Central Park, New York',
        timeAgo: '3 hours ago',
        priority: 'low',
        isRead: true,
        actionRequired: false,
      },
      {
        id: '6',
        type: 'news',
        title: 'Road Construction Update',
        description: 'Main Street closed for repairs until Friday',
        location: 'Upper East Side, New York',
        timeAgo: '5 hours ago',
        priority: 'low',
        isRead: true,
        actionRequired: false,
      },
    ],
  },
  {
    title: 'POSITIVE',
    data: [
      {
        id: '7',
        type: 'positive',
        title: 'Missing Person Found Safe',
        description: 'Elderly man reunited with family',
        location: 'Brooklyn, New York',
        timeAgo: '1 hour ago',
        priority: 'low',
        isRead: true,
        actionRequired: false,
      },
      {
        id: '8',
        type: 'positive',
        title: 'Community Garden Opening',
        description: 'New community garden opens this weekend',
        location: 'Queens, New York',
        timeAgo: '4 hours ago',
        priority: 'low',
        isRead: true,
        actionRequired: false,
      },
    ],
  },
];

const alertTypeIcons = {
  emergency: 'alert-octagon',
  trending: 'fire',
  news: 'newspaper-variant',
  positive: 'heart',
};

const alertTypeColors = {
  emergency: colors.secondary,
  trending: colors.warning,
  news: colors.info,
  positive: colors.accent,
};

export default function AlertsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [alertsData, setAlertsData] = useState(mockAlertsData);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    // In production, fetch from API
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleAlertPress = (alert) => {
    // Mark as read
    const updatedAlerts = alertsData.map(section => ({
      ...section,
      data: section.data.map(item =>
        item.id === alert.id ? { ...item, isRead: true } : item
      ),
    }));
    setAlertsData(updatedAlerts);

    // Navigate to alert details or relevant screen
    if (alert.actionRequired) {
      navigation.navigate('EmergencyAlert', { alertId: alert.id });
    } else {
      navigation.navigate('ReportDetail', { reportId: alert.id });
    }
  };

  const markAllAsRead = () => {
    const updatedAlerts = alertsData.map(section => ({
      ...section,
      data: section.data.map(item => ({ ...item, isRead: true })),
    }));
    setAlertsData(updatedAlerts);
  };

  const getUnreadCount = () => {
    let count = 0;
    alertsData.forEach(section => {
      section.data.forEach(item => {
        if (!item.isRead) count++;
      });
    });
    return count;
  };

  const renderAlertItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.alertItem, !item.isRead && styles.alertItemUnread]}
      onPress={() => handleAlertPress(item)}>
      <View style={styles.alertIconContainer}>
        <View style={[
          styles.alertIconBackground,
          { backgroundColor: `${alertTypeColors[item.type]}20` }
        ]}>
          <Icon
            name={alertTypeIcons[item.type]}
            size={24}
            color={alertTypeColors[item.type]}
          />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.actionRequired && (
            <View style={styles.actionRequiredBadge}>
              <Text style={styles.actionRequiredText}>Action Required</Text>
            </View>
          )}
        </View>

        <Text style={styles.alertDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.alertMeta}>
          {item.location && (
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={12} color={colors.neutralMedium} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.metaItem}>
              <Icon name="map-marker-distance" size={12} color={colors.neutralMedium} />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Icon name="clock-outline" size={12} color={colors.neutralMedium} />
            <Text style={styles.metaText}>{item.timeAgo}</Text>
          </View>
        </View>

        {item.actionRequired && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acknowledgeButton}>
              <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.title === 'HIGH PRIORITY' && getUnreadCount() > 0 && (
        <View style={styles.unreadCountBadge}>
          <Text style={styles.unreadCountText}>{getUnreadCount()}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={markAllAsRead}>
            <Icon name="check-all" size={20} color={colors.neutralDark} />
            <Text style={styles.headerButtonText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('NotificationSettings')}>
            <Icon name="cog-outline" size={20} color={colors.neutralDark} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={alertsData}
        renderItem={renderAlertItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.alertsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="bell-off-outline" size={80} color={colors.neutralLight} />
            <Text style={styles.emptyStateTitle}>No Alerts</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! No new alerts at the moment.
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 21,
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
  alertsList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.neutralDark,
    fontWeight: '600',
  },
  unreadCountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  unreadCountText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  alertItemUnread: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  alertIconContainer: {
    marginRight: 15,
    position: 'relative',
  },
  alertIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  alertContent: {
    flex: 1,
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
  actionRequiredBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionRequiredText: {
    ...typography.small,
    color: colors.secondary,
    fontWeight: '600',
  },
  alertDescription: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginBottom: 12,
    lineHeight: 18,
  },
  alertMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  acknowledgeButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsButtonText: {
    ...typography.caption,
    color: colors.neutralDark,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.neutralMedium,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.neutralMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
});
