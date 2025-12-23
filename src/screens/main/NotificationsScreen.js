import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../../theme/colors';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

const getNotificationIcon = (type) => {
  if (type === 'comment') return 'comment-text-outline';
  if (type === 'incident' || type === 'nearby_incident') return 'alert-circle-outline';
  return 'newspaper-variant-outline';
};

export default function NotificationsScreen({ navigation }) {
  const { notifications, loadNotifications, markAsRead, refreshUnreadCount } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      refreshUnreadCount();
    }, [loadNotifications, refreshUnreadCount])
  );

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
    const timeText = item.created_at ? formatRelativeTime(item.created_at) : 'Just now';

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
            {item.title || 'Notification'}
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
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
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
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You will see new reports and comment updates here.
            </Text>
          </View>
        }
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.neutralDark,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
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
    color: colors.neutralDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleUnread: {
    color: colors.primary,
  },
  body: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginBottom: 6,
  },
  time: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
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
    color: colors.neutralDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutralMedium,
    textAlign: 'center',
  },
});
