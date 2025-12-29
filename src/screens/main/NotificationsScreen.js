import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography } from '../../theme/colors';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const getNotificationIcon = (type) => {
  if (type === 'comment') return 'comment-text-outline';
  if (type === 'incident' || type === 'nearby_incident') return 'alert-circle-outline';
  return 'newspaper-variant-outline';
};

export default function NotificationsScreen({ navigation }) {
  const { notifications, loadNotifications, markAsRead, refreshUnreadCount } = useNotifications();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      ...typography.h3,
      color: palette.textPrimary,
    },
    list: {
      padding: 16,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.white,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.border,
    },
    cardUnread: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}1A`,
    },
    iconWrap: {
      marginRight: 12,
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
      marginBottom: 4,
    },
    titleUnread: {
      color: palette.primary,
    },
    body: {
      ...typography.caption,
      color: palette.textSecondary,
      marginBottom: 6,
    },
    time: {
      ...typography.small,
      color: palette.textSecondary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: palette.primary,
      marginLeft: 8,
      marginTop: 6,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 80,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      ...typography.h3,
      color: palette.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      ...typography.body,
      color: palette.textSecondary,
      textAlign: 'center',
    },
    showMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.white,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: palette.primary,
    },
    showMoreText: {
      ...typography.body,
      color: palette.primary,
      fontWeight: '600',
      marginRight: 8,
    },
  }));
  const [displayCount, setDisplayCount] = useState(10);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      refreshUnreadCount();
      setDisplayCount(10); // Reset to 10 when screen is focused
    }, [loadNotifications, refreshUnreadCount])
  );

  // Get the notifications to display based on displayCount
  const displayedNotifications = useMemo(() => {
    return notifications.slice(0, displayCount);
  }, [notifications, displayCount]);

  // Check if there are more notifications to show
  const hasMore = notifications.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const handleNotificationPress = async (item) => {
    if (item.id && !item.read_at) {
      await markAsRead(item.id);
    }

    const reportId = item.data?.report_id;
    if (reportId) {
      navigation.navigate('ReportDetail', { reportId });
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = item.is_unread ?? !item.read_at;
    const timeText = item.created_at ? formatRelativeTime(item.created_at) : t('notifications.justNow');

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconWrap}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={22}
            color={isUnread ? colors.primary : colors.neutralMedium}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, isUnread && styles.titleUnread]}>
            {item.title || t('notifications.defaultTitle')}
          </Text>
          {item.body ? (
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
          ) : null}
          <Text style={styles.time}>{timeText}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
      </View>

      <FlatList
        data={displayedNotifications}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadNotifications}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="bell-outline" size={72} color={colors.neutralLight} />
            <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('notifications.emptyBody')}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMore}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>{t('notifications.showMore')}</Text>
              <Icon name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
