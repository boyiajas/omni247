import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { reportsAPI } from '../../services/api/reports';
import { API_BASE_URL } from '../../config/api';
import { commentsAPI } from '../../services/api/comments';
import { favoritesAPI } from '../../services/api/favorites';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import useCategories from '../../hooks/useCategories';
import { useLocation } from '../../hooks/useLocation';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

// Placeholder image for reports without media
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

const { width } = Dimensions.get('window');

// Category slug to display name mapping
const categorySlugToName = {
  1: 'crime',
  2: 'accident',
  3: 'event',
  4: 'environment',
  5: 'politics',
  6: 'infrastructure',
  7: 'other',
};

const HeaderNotificationsButton = ({ navigation, colors, styles }) => {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Icon name="bell-outline" size={24} color={colors.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Helper function to format time ago
const formatTimeAgo = (dateString, t) => {
  if (!dateString) return t('newsfeed.justNow');
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return t('newsfeed.justNow');
  if (diffMinutes < 60) return t('newsfeed.minutesAgo', { count: diffMinutes });
  if (diffHours < 24) return t('newsfeed.hoursAgo', { count: diffHours });
  return t('newsfeed.daysAgo', { count: diffDays });
};

const formatRatingValue = (value) => (Number(value) || 0).toFixed(1);
const API_HOST = API_BASE_URL.replace(/\/api\/?$/, '');

const isCoordinateLocation = (value) => {
  if (!value) return false;
  const trimmed = value.toString().trim();
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(trimmed);
};

const isPlaceholderLocation = (value, t) => {
  if (!value) return true;
  const normalized = value.toString().trim().toLowerCase();
  const unknownLabel = t('newsfeed.unknownLocation').toLowerCase();
  return (
    !normalized
    || normalized === unknownLabel
    || normalized === 'unknown location'
    || normalized === 'getting location...'
    || normalized === 'getting location…'
    || isCoordinateLocation(normalized)
  );
};

const normalizeLocation = (value, t) => {
  if (isPlaceholderLocation(value, t)) {
    return t('newsfeed.unknownLocation');
  }
  return value.toString().trim();
};

// Transform API report to feed format
const transformApiReport = (report, t) => {
  // Get first media URL if available
  let mediaUrl = null;
  if (report.media && report.media.length > 0) {
    // Media could have url or file_path property
    mediaUrl = report.media[0].url || report.media[0].file_path || null;

    console.log('[DEBUG] Original media URL:', mediaUrl);

    if (mediaUrl) {
      mediaUrl = mediaUrl
        .replace('http://127.0.0.1:8000', API_HOST)
        .replace('http://localhost:8000', API_HOST)
        .replace('http://localhost', API_HOST)
        .replace('http://10.0.2.2:8000', API_HOST);

      if (mediaUrl.startsWith('/storage/')) {
        mediaUrl = `${API_HOST}${mediaUrl}`;
      } else if (!mediaUrl.startsWith('http')) {
        mediaUrl = `${API_HOST}/storage/${mediaUrl}`;
      }

      console.log('[DEBUG] Fixed media URL:', mediaUrl);
    }
  }

  const rawLocation = report.address
    || report.location_address
    || [report.city, report.country].filter(Boolean).join(', ');

  return {
    id: `api-${report.id}`,
    userId: report.user_id, // For ownership checking
    title: report.title || t('newsfeed.untitled'),
    description: report.description || '',
    category: categorySlugToName[report.category_id] || 'other',
    location: normalizeLocation(rawLocation, t),
    latitude: report.latitude ? Number(report.latitude) : null,
    longitude: report.longitude ? Number(report.longitude) : null,
    distanceBadge: null,
    distanceValue: null,
    allowComments: report.allow_comments !== false,
    rating: parseFloat(report.average_rating) || 0,
    reportsCount: report.views_count || 1,
    commentsCount: report.comments_count || 0, // From withCount('comments')
    timeAgo: formatTimeAgo(report.created_at, t),
    user: {
      name: report.is_anonymous || report.privacy === 'anonymous' ? null : (report.user?.name || t('newsfeed.userFallback')),
      isVerified: report.user?.is_verified || false,
      avatar: report.user?.avatar_url || null,
    },
    media: mediaUrl,
    isTrending: report.is_trending || false,
    credibility: parseFloat(report.average_rating) >= 4 ? 'high' : parseFloat(report.average_rating) >= 2.5 ? 'medium' : 'low',
    isFromApi: true, // Flag to identify API reports
  };
};

export default function NewsFeedScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      ...typography.h2,
      color: palette.textPrimary,
    },
    searchButton: {
      padding: 5,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notificationButton: {
      position: 'relative',
      marginLeft: 12,
    },
    notificationBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: palette.secondary,
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadgeText: {
      ...typography.small,
      color: palette.white,
      fontSize: 10,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.neutralLight,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: palette.textPrimary,
      paddingVertical: 0,
    },
    searchCloseBtn: {
      marginLeft: 10,
    },
    searchCancelText: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    categoriesContainer: {
      paddingTop: 12,
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    categoriesScroll: {
      paddingHorizontal: 15,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.neutralLight,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 10,
    },
    categoryButtonActive: {
      backgroundColor: palette.primary,
    },
    categoryButtonText: {
      color: palette.textSecondary,
      marginLeft: 6,
      fontWeight: '500',
    },
    categoryButtonTextActive: {
      color: palette.white,
    },
    trendingSection: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    sectionTitle: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
      flex: 1,
    },
    sectionActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
      justifyContent: 'flex-end',
    },
    distanceFilterText: {
      color: palette.textSecondary,
      fontWeight: '500',
      marginRight: 0,
    },
    seeAllText: {
      color: palette.primary,
      fontWeight: '600',
    },
    trendingList: {
      paddingLeft: 20,
    },
    trendingCard: {
      width: width * 0.7,
      height: 180,
      borderRadius: 12,
      marginRight: 15,
      overflow: 'hidden',
      position: 'relative',
    },
    trendingImage: {
      width: '100%',
      height: '100%',
    },
    trendingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: 15,
      justifyContent: 'flex-end',
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.secondary,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 10,
    },
    trendingBadgeText: {
      ...typography.small,
      color: palette.white,
      fontWeight: '600',
      marginLeft: 4,
    },
    trendingTitle: {
      ...typography.h3,
      color: palette.white,
      marginBottom: 8,
    },
    trendingMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendingLocation: {
      color: palette.white,
      marginLeft: 4,
    },
    feedList: {
      paddingBottom: 0,
    },
    feedItem: {
      backgroundColor: palette.white,
      borderRadius: 10,
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: palette.border,
    },
    feedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
    },
    anonymousAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.neutralLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    userInfo: {
      flex: 1,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
      marginRight: 6,
    },
    reportTime: {
      ...typography.small,
      color: palette.textSecondary,
      marginTop: 2,
    },
    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    categoryText: {
      ...typography.small,
      color: palette.white,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    feedTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.textPrimary,
      marginBottom: 4,
    },
    feedDescription: {
      fontSize: 13,
      color: palette.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
    },
    feedImage: {
      width: '100%',
      height: 140,
      borderRadius: 8,
    },
    imageContainer: {
      position: 'relative',
      marginBottom: 0,
    },
    feedFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      paddingTop: 0,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationText: {
      color: palette.textPrimary,
      marginLeft: 6,
      marginRight: 8,
    },
    distanceText: {
      color: palette.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
    },
    statText: {
      color: palette.textPrimary,
      marginLeft: 4,
      fontWeight: '600',
    },
    credibilityWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${palette.secondary}10`,
      padding: 10,
      borderRadius: 8,
      marginTop: 12,
    },
    credibilityText: {
      color: palette.secondary,
      marginLeft: 8,
      fontWeight: '500',
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    actionButton: {
      padding: 4,
      marginRight: 10,
    },
    actionSpacer: {
      flex: 1,
    },
    commentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    commentCount: {
      color: palette.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 4,
    },
    replyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: palette.neutralLight,
      borderRadius: 16,
    },
    replyText: {
      color: palette.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 4,
    },
    replyPanel: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      paddingTop: 12,
    },
    replyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    replyHeaderText: {
      ...typography.caption,
      color: palette.textPrimary,
      fontWeight: '600',
    },
    replyHeaderHint: {
      ...typography.small,
      color: palette.textSecondary,
    },
    replyList: {
      maxHeight: 160,
      marginBottom: 10,
    },
    replyEmpty: {
      ...typography.small,
      color: palette.textSecondary,
    },
    replyItem: {
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    replyAuthor: {
      ...typography.small,
      color: palette.textPrimary,
      fontWeight: '600',
    },
    replyBody: {
      ...typography.small,
      color: palette.textSecondary,
      marginTop: 2,
    },
    replyComposer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.neutralLight,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    replyDisabled: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.neutralLight,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    replyDisabledText: {
      ...typography.caption,
      color: palette.textSecondary,
      marginLeft: 8,
    },
    replyInput: {
      flex: 1,
      color: palette.textPrimary,
      fontSize: 13,
      paddingVertical: 0,
    },
    replySend: {
      marginLeft: 8,
    },
    ownerBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    ownerBadgeText: {
      color: palette.white,
      fontSize: 10,
      fontWeight: '600',
      marginLeft: 4,
    },
    nearbyBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.accent,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
    },
    nearbyBadgeText: {
      color: palette.white,
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 4,
    },
    distanceSheetOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    distanceSheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    distanceSheet: {
      backgroundColor: palette.white,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingBottom: 16,
      paddingHorizontal: 20,
      paddingTop: 8,
      height: 260,
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 12,
    },
    distanceSheetHandle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.neutralLight,
      marginBottom: 8,
    },
    distanceSheetTitle: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
      marginBottom: 8,
    },
    distanceSheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    distanceSheetText: {
      ...typography.body,
      color: palette.textPrimary,
    },
    distanceSheetTextActive: {
      color: palette.primary,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateTitle: {
      ...typography.h3,
      color: palette.textSecondary,
      marginTop: 20,
      marginBottom: 10,
    },
    emptyStateText: {
      ...typography.body,
      color: palette.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    loadMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.neutralLight,
      paddingVertical: 15,
      borderRadius: 12,
      marginHorizontal: 20,
      marginTop: 10,
    },
    loadMoreText: {
      ...typography.body,
      color: palette.primary,
      fontWeight: '600',
      marginRight: 8,
    },
  }));
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set()); // Track favorited report IDs
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedReplyId, setExpandedReplyId] = useState(null);
  const [commentsByReport, setCommentsByReport] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentLoadingIds, setCommentLoadingIds] = useState(new Set());
  const [commentSubmittingIds, setCommentSubmittingIds] = useState(new Set());
  const [distanceRange, setDistanceRange] = useState(null);
  const [showDistanceSheet, setShowDistanceSheet] = useState(false);
  const { categories: fetchedCategories } = useCategories();
  const { location } = useLocation();

  // Get user's current coordinates
  const userLat = location?.latitude ?? user?.last_known_lat ?? null;
  const userLon = location?.longitude ?? user?.last_known_lng ?? null;

  const categoryColors = useMemo(
    () => ({
      crime: colors.secondary,
      event: colors.warning,
      accident: '#EA580C',
      environment: colors.accent,
      politics: '#7C3AED',
      infrastructure: '#4F46E5',
      other: colors.textSecondary,
    }),
    [colors]
  );

  const categories = useMemo(
    () => [
      { id: null, label: t('newsfeed.categoryAll'), icon: 'earth' },
      ...(fetchedCategories || []).map(cat => ({
        id: cat.slug,
        label: cat.label,
        icon: cat.icon || 'shape',
      })),
    ],
    [fetchedCategories, t]
  );

  // Calculate distance and add to feed data
  const feedDataWithDistance = useMemo(() => {
    console.log('[DISTANCE] User location:', userLat, userLon);

    if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) {
      console.log('[DISTANCE] No user location, returning original feedData');
      return feedData;
    }

    // Haversine formula to calculate distance between two points on Earth
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const updatedData = feedData.map(item => {
      const hasKnownLocation = !isPlaceholderLocation(item.location, t);
      const hasValidCoords =
        Number.isFinite(item.latitude)
        && Number.isFinite(item.longitude)
        && !(Number(item.latitude) === 0 && Number(item.longitude) === 0);
      if (hasKnownLocation && hasValidCoords) {
        const dist = calculateDistance(userLat, userLon, item.latitude, item.longitude);
        console.log(`[DISTANCE] Report "${item.title}": ${dist.toFixed(1)} km`);
        return {
          ...item,
          distanceBadge: `Nearby - ${dist.toFixed(1)} km`, // For green badge on image
          distanceValue: `${dist.toFixed(1)} km`, // For footer text (no "Nearby")
          distanceKm: dist,
        };
      }
      return { ...item, distanceKm: null };
    });

    console.log('[DISTANCE] Updated data sample:', updatedData[0]?.distance);
    return updatedData;
  }, [feedData, userLat, userLon]);

  // Check if current user owns the report
  const isUserReport = (item) => {
    if (!user || !item.isFromApi) return false;
    // Extract numeric ID from api-prefixed ID
    const reportId = item.id?.replace('api-', '');
    return item.userId === user.id || item.user?.name === user.name;
  };

  // Handle edit report
  const handleEditReport = (report) => {
    const reportId = report.id?.replace('api-', '');
    navigation.navigate('EditReport', {
      reportId,
      report,
      onUpdated: (updatedReport) => {
        if (!updatedReport) return;
        const updatedId = `api-${updatedReport.id}`;
        setFeedData((prev) =>
          prev.map((item) => {
            if (item.id === updatedId) {
              return {
                ...item,
                ...transformApiReport(updatedReport, t),
              };
            }
            return item;
          })
        );
      },
    });
  };

  // Handle delete report
  const handleDeleteReport = (report) => {
    Alert.alert(
      t('newsfeed.delete'),
      t('newsfeed.deleteReportConfirm'),
      [
        { text: t('newsfeed.cancel'), style: 'cancel' },
        {
          text: t('newsfeed.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const reportId = report.id?.replace('api-', '');
              await reportsAPI.deleteReport(reportId);
              // Remove from local state
              setFeedData(prev => prev.filter(item => item.id !== report.id));
              Alert.alert(t('newsfeed.reportDeleted'));
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('newsfeed.errorTitle'), t('newsfeed.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (item) => {
    const reportId = item.id?.replace('api-', '');

    // Optimistic UI update
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(reportId)) {
        newFavorites.delete(reportId);
      } else {
        newFavorites.add(reportId);
      }
      return newFavorites;
    });

    try {
      await favoritesAPI.toggleFavorite(reportId);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      // Revert on error
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(reportId)) {
          newFavorites.delete(reportId);
        } else {
          newFavorites.add(reportId);
        }
        return newFavorites;
      });
    }
  };

  // Show options menu for user's own reports
  const showReportOptions = (report) => {
    Alert.alert(
      t('newsfeed.reportOptionsTitle'),
      t('newsfeed.reportOptionsBody'),
      [
        { text: t('newsfeed.editReport'), onPress: () => handleEditReport(report) },
        { text: t('newsfeed.delete'), style: 'destructive', onPress: () => handleDeleteReport(report) },
        { text: t('newsfeed.cancel'), style: 'cancel' },
      ]
    );
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeedData();
    }, [])
  );

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports();
      const apiReports = response.data?.data || response.data || [];

      const verifiedReports = Array.isArray(apiReports)
        ? apiReports.filter(report => report.is_verified || report.status === 'verified')
        : [];

      // Transform verified API reports to feed format
      const transformedReports = verifiedReports.map((report) => transformApiReport(report, t));

      setFeedData(transformedReports);
    } catch (error) {
      console.warn('Error fetching reports:', error.message);
      setFeedData([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
      setVisibleCount(5);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedData();
  };

  const handleReportPress = (report) => {
    const reportId = report?.id?.toString().replace('api-', '');
    navigation.navigate('ReportDetail', {
      reportId,
      onCommentAdded: () => {
        if (!reportId) return;
        incrementReportCommentsCount(reportId);
      },
    });
  };

  const handleOpenRatings = (report) => {
    const reportId = report?.id?.toString().replace('api-', '');
    if (!reportId) return;
    navigation.navigate('ReportRatings', { reportId });
  };

  const loadCommentsForReport = async (reportId) => {
    if (!reportId) return;
    if (commentLoadingIds.has(reportId)) return;

    setCommentLoadingIds(prev => new Set(prev).add(reportId));
    try {
      const response = await commentsAPI.getComments(reportId);
      const commentsData = response.data || [];
      setCommentsByReport(prev => ({
        ...prev,
        [reportId]: commentsData,
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const handleToggleReply = (item) => {
    const reportId = item?.id?.toString().replace('api-', '');
    if (!reportId) return;

    setExpandedReplyId(prev => (prev === reportId ? null : reportId));
    if (expandedReplyId !== reportId && !commentsByReport[reportId]) {
      loadCommentsForReport(reportId);
    }
  };

  const handleSubmitComment = async (item) => {
    const reportId = item?.id?.toString().replace('api-', '');
    if (!reportId) return;
    if (item?.allowComments === false) {
      Alert.alert('Comments Disabled', 'Comments are disabled for this report.');
      return;
    }
    const draft = (commentDrafts[reportId] || '').trim();
    if (!draft) return;
    if (commentSubmittingIds.has(reportId)) return;

    setCommentSubmittingIds(prev => new Set(prev).add(reportId));
    try {
      const newComment = await commentsAPI.addComment(reportId, draft);
      setCommentsByReport(prev => {
        const existing = prev[reportId] || [];
        return {
          ...prev,
          [reportId]: [newComment, ...existing],
        };
      });
      setCommentDrafts(prev => ({ ...prev, [reportId]: '' }));
      incrementReportCommentsCount(reportId);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    } finally {
      setCommentSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const incrementReportCommentsCount = (reportId) => {
    setFeedData((prev) =>
      prev.map((item) => {
        const itemId = item?.id?.toString().replace('api-', '');
        if (itemId === reportId) {
          const nextCount = Number(item.commentsCount || 0) + 1;
          return { ...item, commentsCount: nextCount };
        }
        return item;
      })
    );
  };

  const renderTrendingSection = () => {
    const trendingItems = feedData.filter(item => item.isTrending);
    // Sort by views (reportsCount) descending - highest first
    const sortedByViews = [...feedData].sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0));
    const fallbackItems = trendingItems.length > 0
      ? trendingItems.sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0)).slice(0, 4)
      : sortedByViews.slice(0, 4);

    if (fallbackItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('newsfeed.trendingNow')}</Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity onPress={() => setShowDistanceSheet(true)}>
              <Text style={styles.distanceFilterText}>
                {t('newsfeed.filterByDistance')}{distanceRange ? ` • ${distanceRange} km` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}>
          {fallbackItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.trendingCard}
              onPress={() => handleReportPress(item)}>
              <Image
                source={{ uri: item.media || PLACEHOLDER_IMAGE }}
                style={styles.trendingImage}
                defaultSource={{ uri: PLACEHOLDER_IMAGE }}
              />
              <View style={styles.trendingOverlay}>
                <View style={styles.trendingBadge}>
                  <Icon name="fire" size={16} color={colors.white} />
                  <Text style={styles.trendingBadgeText}>{t('newsfeed.trendingBadge')}</Text>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.trendingMeta}>
                  <Icon name="map-marker" size={12} color={colors.white} />
                  <Text style={styles.trendingLocation} numberOfLines={2} ellipsizeMode="tail">
                    {item.location || t('newsfeed.unknownLocation')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFeedItem = ({ item }) => {
    const isOwner = isUserReport(item);
    const reportId = item?.id?.toString().replace('api-', '');
    const isReplyOpen = expandedReplyId === reportId;
    const reportComments = commentsByReport[reportId] || [];

    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => handleReportPress(item)}>
        <View style={styles.feedHeader}>
          {item.user?.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.anonymousAvatar}>
              <Icon name="incognito" size={20} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                {item.user?.name || t('profile.anonymous')}
              </Text>
              {item.user?.isVerified && (
                <Icon name="check-decagram" size={16} color={colors.accent} />
              )}
            </View>
            <Text style={styles.reportTime}>{item.timeAgo}</Text>
          </View>

          <View style={[
            styles.categoryBadge,
            { backgroundColor: categoryColors[item.category] || colors.textSecondary }
          ]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.feedTitle}>{item.title}</Text>

        {item.description && (
          <Text style={styles.feedDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Show image - use placeholder if no media */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.media || PLACEHOLDER_IMAGE }}
            style={styles.feedImage}
            defaultSource={{ uri: PLACEHOLDER_IMAGE }}
          />
          {/* Show "Your Report" badge on image for user's own reports */}
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Icon name="account" size={10} color={colors.white} />
              <Text style={styles.ownerBadgeText}>{t('newsfeed.yourReport')}</Text>
            </View>
          )}
          {/* Nearby distance badge - green badge on bottom-left */}
          {item.distanceBadge ? (
            <View style={styles.nearbyBadge}>
              <Icon name="map-marker" size={14} color={colors.white} />
              <Text style={styles.nearbyBadgeText}>
                {item.distanceBadge}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.feedFooter}>
          <View style={styles.locationInfo}>
            <Icon name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location || t('newsfeed.unknownLocation')}
            </Text>
            {null}
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => handleOpenRatings(item)}>
              <Icon name="star" size={14} color={colors.warning} />
              <Text style={styles.statText}>{formatRatingValue(item.rating)}</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Icon name="eye" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.reportsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="comment-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.commentsCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* Action icons bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Icon
              name={favorites.has(item.id?.replace('api-', '')) ? 'heart' : 'heart-outline'}
              size={20}
              color={favorites.has(item.id?.replace('api-', '')) ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="link-variant" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Edit icon - only for owner */}
          {isOwner && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditReport(item)}>
              <Icon name="pencil-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* More options (delete for owner) */}
          {isOwner ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteReport(item)}>
              <Icon name="trash-can-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="dots-horizontal" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <View style={styles.actionSpacer} />

          {/* Comment count */}
          <TouchableOpacity style={styles.commentButton}>
            <Icon name="comment-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.commentCount}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => handleToggleReply(item)}
          >
            <Icon name="reply" size={18} color={colors.textSecondary} />
            <Text style={styles.replyText}>{t('newsfeed.reply')}</Text>
          </TouchableOpacity>
        </View>

        {isReplyOpen && (
          <View style={styles.replyPanel}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyHeaderText}>{t('newsfeed.comments')}</Text>
              {commentLoadingIds.has(reportId) && (
                <Text style={styles.replyHeaderHint}>{t('newsfeed.loading')}</Text>
              )}
            </View>
            <ScrollView style={styles.replyList} nestedScrollEnabled>
              {reportComments.length === 0 && !commentLoadingIds.has(reportId) ? (
                <Text style={styles.replyEmpty}>{t('newsfeed.noComments')}</Text>
              ) : (
                reportComments.map(comment => (
                  <View key={comment.id} style={styles.replyItem}>
                    <Text style={styles.replyAuthor}>
                      {comment.user?.name || t('profile.anonymous')}
                    </Text>
                    <Text style={styles.replyBody}>{comment.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            {item.allowComments !== false ? (
              <View style={styles.replyComposer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder={t('newsfeed.writeComment')}
                  placeholderTextColor={colors.textSecondary}
                  value={commentDrafts[reportId] || ''}
                  onChangeText={(text) =>
                    setCommentDrafts(prev => ({ ...prev, [reportId]: text }))
                  }
                />
                <TouchableOpacity
                  style={styles.replySend}
                  onPress={() => handleSubmitComment(item)}
                  disabled={commentSubmittingIds.has(reportId)}
                >
                  <Icon name="send" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.replyDisabled}>
                <Icon name="comment-off-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.replyDisabledText}>{t('newsfeed.commentsDisabled')}</Text>
              </View>
            )}
          </View>
        )}

        {item.credibility === 'low' && (
          <View style={styles.credibilityWarning}>
            <Icon name="alert-circle" size={16} color={colors.secondary} />
            <Text style={styles.credibilityText}>{t('newsfeed.credibilityLow')}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Filter by category, search query, and distance range (when available)
  const filteredData = feedDataWithDistance.filter(item => {
    // Category filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    // Search filter (case insensitive)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query);

    const matchesDistance = distanceRange === null
      ? true
      : item.distanceKm === null || item.distanceKm <= distanceRange;

    return matchesCategory && matchesSearch && matchesDistance;
  });

  const distanceSortedData = distanceRange === null
    ? filteredData
    : [...filteredData].sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  const visibleData = distanceSortedData.slice(0, visibleCount);
  const canLoadMore = visibleCount < distanceSortedData.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('newsfeed.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchCloseBtn}
              onPress={() => { setShowSearch(false); setSearchQuery(''); }}
            >
              <Text style={styles.searchCancelText}>{t('newsfeed.cancel')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>{t('newsfeed.headerTitle')}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Icon name="magnify" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <HeaderNotificationsButton navigation={navigation} colors={colors} styles={styles} />
            </View>
          </>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id || 'all'}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
                selectedCategory === category.id && category.id && {
                  backgroundColor: categoryColors[category.id],
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Icon
                name={category.icon}
                size={18}
                color={selectedCategory === category.id ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visibleData}
        renderItem={renderFeedItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderTrendingSection}
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
            <Icon name="newspaper-variant-outline" size={80} color={colors.border} />
            <Text style={styles.emptyStateTitle}>{t('newsfeed.noReports')}</Text>
            <Text style={styles.emptyStateText}>
              {t('newsfeed.emptyFeedHint')}
            </Text>
          </View>
        }
        ListFooterComponent={
          canLoadMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setVisibleCount((count) => count + 5)}
            >
              <Text style={styles.loadMoreText}>{t('newsfeed.loadMore')}</Text>
              <Icon name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {showDistanceSheet && (
        <View style={styles.distanceSheetOverlay}>
          <TouchableOpacity
            style={styles.distanceSheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowDistanceSheet(false)}
          />
          <View style={styles.distanceSheet}>
            <View style={styles.distanceSheetHandle} />
            <Text style={styles.distanceSheetTitle}>{t('newsfeed.distanceSheetTitle')}</Text>
            {[
              { label: t('newsfeed.distanceAll'), value: null },
              { label: t('newsfeed.distance2'), value: 2 },
              { label: t('newsfeed.distance5'), value: 5 },
              { label: t('newsfeed.distance10'), value: 10 },
              { label: t('newsfeed.distance25'), value: 25 },
              { label: t('newsfeed.distance50'), value: 50 },
            ].map(option => (
              <TouchableOpacity
                key={String(option.value)}
                style={styles.distanceSheetItem}
                onPress={() => {
                  setDistanceRange(option.value);
                  setShowDistanceSheet(false);
                }}
              >
                <Text
                  style={[
                    styles.distanceSheetText,
                    distanceRange === option.value && styles.distanceSheetTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {distanceRange === option.value && (
                  <Icon name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
