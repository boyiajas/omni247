import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { alertsAPI } from '../../services/api/alerts';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const alertTypeIcons = {
  emergency: 'alert-octagon',
  trending: 'fire',
  news: 'newspaper-variant',
  positive: 'heart',
};

const getAlertTypeColors = (colors) => ({
  emergency: colors.secondary,
  trending: colors.warning,
  news: colors.info,
  positive: colors.accent,
});

export default function AlertsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [alertsData, setAlertsData] = useState([]);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const alertTypeColors = getAlertTypeColors(colors);
  const styles = useThemedStyles(() => ({
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
      paddingBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      marginBottom: 8,
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
      padding: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.neutralLight,
    },
    alertItemUnread: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    alertIconContainer: {
      marginRight: 10,
      position: 'relative',
    },
    alertIconBackground: {
      width: 42,
      height: 42,
      borderRadius: 21,
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
      marginBottom: 6,
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
      marginBottom: 8,
      lineHeight: 18,
    },
    alertMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
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
    emptySection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    emptySectionText: {
      ...typography.caption,
      color: colors.neutralMedium,
      marginLeft: 6,
    },
  }));

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t('alerts.timeJustNow');
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return t('alerts.timeJustNow');
    if (diffMinutes < 60) return t('alerts.timeMinutes', { count: diffMinutes });
    if (diffHours < 24) return t('alerts.timeHours', { count: diffHours });
    return t('alerts.timeDays', { count: diffDays });
  };

  const mapReportToAlert = (report, type) => {
    return {
      id: String(report.id),
      type,
      section: type === 'emergency' ? 'high_priority' : type,
      title: report.title || t('alerts.untitled'),
      description: report.description || '',
      location: report.address || report.city || report.country || t('alerts.unknownLocation'),
      timeAgo: formatTimeAgo(report.created_at),
      priority: report.priority || (type === 'emergency' ? 'high' : 'low'),
      isRead: false,
      actionRequired: type === 'emergency',
      reportId: report.id,
    };
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await alertsAPI.getAlerts();
      const payload = response.data || {};
      const sections = [
        {
          key: 'high_priority',
          title: t('alerts.highPriority'),
          data: (payload.high_priority || []).map((report) => mapReportToAlert(report, 'emergency')),
        },
        {
          key: 'trending',
          title: t('alerts.trending'),
          data: (payload.trending || []).map((report) => mapReportToAlert(report, 'trending')),
        },
        {
          key: 'news',
          title: t('alerts.news'),
          data: (payload.news || []).map((report) => mapReportToAlert(report, 'news')),
        },
      ];
      setAlertsData(sections);
    } catch (error) {
      setAlertsData([]);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleAlertPress = (alert) => {
    setAlertsData((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.filter((item) => item.id !== alert.id),
      }))
    );

    if (alert?.reportId) {
      alertsAPI.dismissAlert(alert.reportId, alert.section).catch(() => {});
    }

    navigation.navigate('ReportDetail', { reportId: alert.reportId || alert.id });
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

  const renderAlertItem = ({ item }) => {
    return (
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
                <Text style={styles.actionRequiredText}>{t('alerts.actionRequired')}</Text>
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
                <Text style={styles.acknowledgeButtonText}>{t('alerts.acknowledge')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>{t('alerts.viewDetails')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => {
    const count = section.data.length;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.key !== 'positive' && count > 0 && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{count}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSectionFooter = ({ section }) => {
    if (section.key === 'positive' && section.data.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Icon name="information-outline" size={18} color={colors.neutralMedium} />
          <Text style={styles.emptySectionText}>{t('alerts.emptySection')}</Text>
        </View>
      );
    }
    return null;
  };

  const displaySections = [
    ...alertsData,
    { key: 'positive', title: t('alerts.positive'), data: [] },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('alerts.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={markAllAsRead}>
            <Icon name="check-all" size={20} color={colors.neutralDark} />
            <Text style={styles.headerButtonText}>{t('alerts.markAllRead')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('NotificationSettings')}>
            <Icon name="cog-outline" size={20} color={colors.neutralDark} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={displaySections}
        renderItem={renderAlertItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
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
            <Text style={styles.emptyStateTitle}>{t('alerts.emptyTitle')}</Text>
            <Text style={styles.emptyStateText}>
              {t('alerts.emptyBody')}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}
