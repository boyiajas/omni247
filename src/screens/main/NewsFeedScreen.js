import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { reportsAPI } from '../../services/api/reports';
import { commentsAPI } from '../../services/api/comments';
import { favoritesAPI } from '../../services/api/favorites';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import useCategories from '../../hooks/useCategories';

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

const categoryColors = {
  crime: colors.secondary,
  event: colors.warning,
  accident: '#EA580C',
  environment: colors.accent,
  politics: '#7C3AED',
  infrastructure: '#4F46E5',
  other: colors.neutralMedium,
};

const HeaderNotificationsButton = ({ navigation }) => {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Icon name="bell-outline" size={24} color={colors.neutralDark} />
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
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} days ago`;
};

// Transform API report to feed format
const transformApiReport = (report) => {
  // Get first media URL if available
  let mediaUrl = null;
  if (report.media && report.media.length > 0) {
    // Media could have url or file_path property
    mediaUrl = report.media[0].url || report.media[0].file_path || null;

    console.log('[DEBUG] Original media URL:', mediaUrl);

    if (mediaUrl) {
      // Fix URLs for Android emulator - replace localhost/127.0.0.1 with 10.0.2.2
      mediaUrl = mediaUrl
        .replace('http://127.0.0.1:8000', 'http://10.0.2.2:8000')
        .replace('http://localhost:8000', 'http://10.0.2.2:8000')
        .replace('http://localhost', 'http://10.0.2.2:8000');

      // If it starts with /storage/, prepend the emulator-accessible host
      if (mediaUrl.startsWith('/storage/')) {
        mediaUrl = `http://10.0.2.2:8000${mediaUrl}`;
      }
      // If it's some other relative path, prepend the full storage URL
      else if (!mediaUrl.startsWith('http')) {
        mediaUrl = `http://10.0.2.2:8000/storage/${mediaUrl}`;
      }

      console.log('[DEBUG] Fixed media URL:', mediaUrl);
    }
  }

  return {
    id: `api-${report.id}`,
    userId: report.user_id, // For ownership checking
    title: report.title || 'Untitled Report',
    description: report.description || '',
    category: categorySlugToName[report.category_id] || 'other',
    location: report.address || report.location_address || 'Unknown location',
    distance: 'Nearby',
    rating: parseFloat(report.average_rating) || 0,
    reportsCount: report.views_count || 1,
    commentsCount: report.comments_count || 0, // From withCount('comments')
    timeAgo: formatTimeAgo(report.created_at),
    user: {
      name: report.is_anonymous ? null : (report.user?.name || 'User'),
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
  const { categories: fetchedCategories } = useCategories();

  const categories = useMemo(
    () => [
      { id: null, label: 'All', icon: 'earth' },
      ...(fetchedCategories || []).map(cat => ({
        id: cat.slug,
        label: cat.label,
        icon: cat.icon || 'shape',
      })),
    ],
    [fetchedCategories]
  );

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
    navigation.navigate('EditReport', { reportId, report });
  };

  // Handle delete report
  const handleDeleteReport = (report) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const reportId = report.id?.replace('api-', '');
              await reportsAPI.deleteReport(reportId);
              // Remove from local state
              setFeedData(prev => prev.filter(item => item.id !== report.id));
              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete report. Please try again.');
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
      'Report Options',
      'What would you like to do?',
      [
        { text: 'Edit Report', onPress: () => handleEditReport(report) },
        { text: 'Delete Report', style: 'destructive', onPress: () => handleDeleteReport(report) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports();
      const apiReports = response.data?.data || response.data || [];

      const verifiedReports = Array.isArray(apiReports)
        ? apiReports.filter(report => report.is_verified || report.status === 'verified')
        : [];

      // Transform verified API reports to feed format
      const transformedReports = verifiedReports.map(transformApiReport);

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
    navigation.navigate('ReportDetail', { reportId });
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

  const renderTrendingSection = () => {
    const trendingItems = feedData.filter(item => item.isTrending);
    const fallbackItems = trendingItems.length > 0 ? trendingItems : feedData.slice(0, 4);

    if (fallbackItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
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
                  <Text style={styles.trendingBadgeText}>TRENDING</Text>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.trendingMeta}>
                  <Icon name="map-marker" size={12} color={colors.white} />
                  <Text style={styles.trendingLocation}>{item.distance}</Text>
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
              <Icon name="incognito" size={20} color={colors.neutralMedium} />
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                {item.user?.name || 'Anonymous User'}
              </Text>
              {item.user?.isVerified && (
                <Icon name="check-decagram" size={16} color={colors.accent} />
              )}
            </View>
            <Text style={styles.reportTime}>{item.timeAgo}</Text>
          </View>

          <View style={[
            styles.categoryBadge,
            { backgroundColor: categoryColors[item.category] || colors.neutralMedium }
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
              <Text style={styles.ownerBadgeText}>Your Report</Text>
            </View>
          )}
        </View>

        <View style={styles.feedFooter}>
          <View style={styles.locationInfo}>
            <Icon name="map-marker" size={14} color={colors.neutralMedium} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location || 'Unknown'}</Text>
            <Text style={styles.distanceText}>• {item.distance}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="star" size={14} color={colors.warning} />
              <Text style={styles.statText}>{(item.rating || 0).toFixed(1)}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="eye" size={14} color={colors.neutralMedium} />
              <Text style={styles.statText}>{item.reportsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="comment-outline" size={14} color={colors.neutralMedium} />
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
              color={favorites.has(item.id?.replace('api-', '')) ? colors.error : colors.neutralMedium}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="link-variant" size={20} color={colors.neutralMedium} />
          </TouchableOpacity>

          {/* Edit icon - only for owner */}
          {isOwner && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditReport(item)}>
              <Icon name="pencil-outline" size={20} color={colors.neutralMedium} />
            </TouchableOpacity>
          )}

          {/* More options (delete for owner) */}
          {isOwner ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteReport(item)}>
              <Icon name="trash-can-outline" size={20} color={colors.neutralMedium} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="dots-horizontal" size={20} color={colors.neutralMedium} />
            </TouchableOpacity>
          )}

          <View style={styles.actionSpacer} />

          {/* Comment count */}
          <TouchableOpacity style={styles.commentButton}>
            <Icon name="comment-outline" size={18} color={colors.neutralMedium} />
            <Text style={styles.commentCount}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => handleToggleReply(item)}
          >
            <Icon name="reply" size={18} color={colors.neutralMedium} />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </View>

        {isReplyOpen && (
          <View style={styles.replyPanel}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyHeaderText}>Comments</Text>
              {commentLoadingIds.has(reportId) && (
                <Text style={styles.replyHeaderHint}>Loading…</Text>
              )}
            </View>
            <ScrollView style={styles.replyList} nestedScrollEnabled>
              {reportComments.length === 0 && !commentLoadingIds.has(reportId) ? (
                <Text style={styles.replyEmpty}>No comments yet.</Text>
              ) : (
                reportComments.map(comment => (
                  <View key={comment.id} style={styles.replyItem}>
                    <Text style={styles.replyAuthor}>
                      {comment.user?.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.replyBody}>{comment.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.replyComposer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.neutralMedium}
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
          </View>
        )}

        {item.credibility === 'low' && (
          <View style={styles.credibilityWarning}>
            <Icon name="alert-circle" size={16} color={colors.secondary} />
            <Text style={styles.credibilityText}>This report has low credibility</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Filter by category and search query
  const filteredData = feedData.filter(item => {
    // Category filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    // Search filter (case insensitive)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const visibleData = filteredData.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredData.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color={colors.neutralMedium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor={colors.neutralMedium}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.neutralMedium} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchCloseBtn}
              onPress={() => { setShowSearch(false); setSearchQuery(''); }}
            >
              <Text style={styles.searchCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>News Feed</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Icon name="magnify" size={24} color={colors.neutralDark} />
              </TouchableOpacity>
              <HeaderNotificationsButton navigation={navigation} />
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
                color={selectedCategory === category.id ? colors.white : colors.neutralMedium}
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
            <Icon name="newspaper-variant-outline" size={80} color={colors.neutralLight} />
            <Text style={styles.emptyStateTitle}>No Reports Found</Text>
            <Text style={styles.emptyStateText}>
              No reports match your selected category. Try another category or check back later.
            </Text>
          </View>
        }
        ListFooterComponent={
          canLoadMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setVisibleCount((count) => count + 5)}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
              <Icon name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutralDark,
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
    backgroundColor: colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    ...typography.small,
    color: colors.white,
    fontSize: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.neutralDark,
    paddingVertical: 0,
  },
  searchCloseBtn: {
    marginLeft: 10,
  },
  searchCancelText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  categoriesScroll: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    /* ...typography.caption, */
    color: colors.neutralMedium,
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.white,
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
    ...typography.h3,
    color: colors.neutralDark,
  },
  seeAllText: {
    /* ...typography.caption, */
    color: colors.primary,
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
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  trendingBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendingTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: 8,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingLocation: {
    /* ...typography.caption, */
    color: colors.white,
    marginLeft: 4,
  },
  feedList: {
    paddingBottom: 20,
  },
  feedItem: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutralLight,
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
    backgroundColor: colors.neutralLight,
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
    color: colors.neutralDark,
    fontWeight: '600',
    marginRight: 6,
  },
  reportTime: {
    ...typography.small,
    color: colors.neutralMedium,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutralDark,
    marginBottom: 4,
  },
  feedDescription: {
    fontSize: 13,
    color: colors.neutralMedium,
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
    /* ...typography.caption, */
    color: colors.neutralDark,
    marginLeft: 6,
    marginRight: 8,
  },
  distanceText: {
    /* ...typography.caption, */
    color: colors.neutralMedium,
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
    /* ...typography.caption, */
    color: colors.neutralDark,
    marginLeft: 4,
    fontWeight: '600',
  },
  credibilityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}10`,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  credibilityText: {
    /* ...typography.caption, */
    color: colors.secondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
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
    color: colors.neutralMedium,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.neutralLight,
    borderRadius: 16,
  },
  replyText: {
    color: colors.neutralMedium,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  replyPanel: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
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
    color: colors.neutralDark,
    fontWeight: '600',
  },
  replyHeaderHint: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  replyList: {
    maxHeight: 160,
    marginBottom: 10,
  },
  replyEmpty: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  replyItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  replyAuthor: {
    ...typography.small,
    color: colors.neutralDark,
    fontWeight: '600',
  },
  replyBody: {
    ...typography.small,
    color: colors.neutralMedium,
    marginTop: 2,
  },
  replyComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyInput: {
    flex: 1,
    color: colors.neutralDark,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ownerBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
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
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralLight,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },
  loadMoreText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
});
