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
  const palette = colors;
  const alertTypeColors = getAlertTypeColors(colors);
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 18,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
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
      padding: 4,
    },
    headerButtonText: {
      fontSize: 14,
      color: palette.textSecondary,
      marginLeft: 5,
      fontWeight: '500',
    },
    alertsList: {
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      color: palette.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    unreadCountBadge: {
      backgroundColor: palette.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 10,
    },
    unreadCountText: {
      fontSize: 11,
      color: palette.white,
      fontWeight: '700',
    },
    alertItem: {
      flexDirection: 'row',
      backgroundColor: palette.white,
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.border,
      // Status bar style
      borderLeftWidth: 3,
      position: 'relative',
    },
    alertItemUnread: {
      backgroundColor: `${palette.primary}05`,
      borderColor: palette.border,
    },
    alertIconContainer: {
      marginRight: 10,
      justifyContent: 'center',
    },
    alertIconBackground: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
    unreadDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: palette.primary,
      borderWidth: 2,
      borderColor: palette.white,
    },
    alertContent: {
      flex: 1,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    alertTitle: {
      fontSize: 15,
      color: palette.textPrimary,
      fontWeight: '700',
      flex: 1,
      marginRight: 10,
      lineHeight: 20,
    },
    actionRequiredBadge: {
      backgroundColor: `${palette.secondary}15`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    actionRequiredText: {
      fontSize: 10,
      color: palette.secondary,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    alertDescription: {
      fontSize: 13,
      color: palette.textSecondary,
      lineHeight: 18,
      marginBottom: 6,
    },
    alertMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 2,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      marginBottom: 4,
    },
    metaText: {
      fontSize: 11,
      color: palette.textSecondary,
      marginLeft: 4,
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 10,
    },
    acknowledgeButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginRight: 8,
    },
    acknowledgeButtonText: {
      fontSize: 12,
      color: palette.white,
      fontWeight: '600',
    },
    detailsButton: {
      backgroundColor: palette.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: palette.border,
    },
    detailsButtonText: {
      fontSize: 12,
      color: palette.textPrimary,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      marginTop: 60,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: palette.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
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
      alertsAPI.dismissAlert(alert.reportId, alert.section).catch(() => { });
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
        style={[
          styles.alertItem,
          !item.isRead && styles.alertItemUnread,
          { borderLeftColor: alertTypeColors[item.type] || palette.primary }
        ]}
        onPress={() => handleAlertPress(item)}>
        <View style={styles.alertIconContainer}>
          <View style={[
            styles.alertIconBackground,
            { backgroundColor: `${alertTypeColors[item.type]}15` }
          ]}>
            <Icon
              name={alertTypeIcons[item.type]}
              size={22}
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
                <Icon name="map-marker" size={12} color={palette.textSecondary} />
                <Text style={styles.metaText}>{item.location}</Text>
              </View>
            )}
            {item.distance && (
              <View style={styles.metaItem}>
                <Icon name="map-marker-distance" size={12} color={palette.textSecondary} />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={12} color={palette.textSecondary} />
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
        <View style={[styles.emptySection, { padding: 16, alignItems: 'center', opacity: 0.6 }]}>
          <Icon name="information-outline" size={18} color={palette.textSecondary} />
          <Text style={[styles.emptySectionText, { color: palette.textSecondary, marginTop: 4, fontSize: 13 }]}>{t('alerts.emptySection')}</Text>
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
