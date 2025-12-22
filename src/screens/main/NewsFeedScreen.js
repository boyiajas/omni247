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
import { favoritesAPI } from '../../services/api/favorites';
import { useAuth } from '../../contexts/AuthContext';
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

// Mock data for news feed (kept as fallback and examples)
const mockFeedData = [
  {
    id: 'mock-1',
    title: 'Major Protest Downtown',
    description: 'Thousands gather for climate change protest in downtown area',
    category: 'politics',
    location: 'Times Square, New York',
    distance: '2.0 km away',
    rating: 4.8,
    reportsCount: 1200,
    timeAgo: '16 min ago',
    user: {
      name: 'Sarah Chen',
      isVerified: true,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    media: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    isTrending: true,
    credibility: 'high',
  },
  {
    id: 'mock-2',
    title: 'Times Square New Year Celebration',
    description: 'Massive crowd gathers for New Year celebration',
    category: 'event',
    location: 'Times Square, New York',
    distance: '4.2 km away',
    rating: 4.2,
    reportsCount: 248,
    timeAgo: '1 hr ago',
    user: {
      name: 'Mike Johnson',
      isVerified: true,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    media: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
    isTrending: true,
    credibility: 'medium',
  },
  {
    id: 'mock-3',
    title: 'Suspicious Activity Reported',
    description: 'Police investigating suspicious activity in Central Park',
    category: 'crime',
    location: 'Central Park, New York',
    distance: '3.1 km away',
    rating: 3.1,
    reportsCount: 15,
    timeAgo: '2 hr ago',
    user: {
      name: null, // Anonymous
      isVerified: false,
    },
    media: null,
    isTrending: false,
    credibility: 'low',
  },
  {
    id: 'mock-4',
    title: 'Community Cleanup Event',
    description: 'Volunteers gather for monthly community cleanup',
    category: 'environment',
    location: 'Brooklyn Park, New York',
    distance: '5.7 km away',
    rating: 4.9,
    reportsCount: 87,
    timeAgo: '3 hr ago',
    user: {
      name: 'Maria Gonzalez',
      isVerified: true,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    media: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    isTrending: false,
    credibility: 'high',
  },
  {
    id: 'mock-5',
    title: 'Building Fire - Downtown',
    description: 'Firefighters responding to residential building fire',
    category: 'accident',
    location: 'Financial District, New York',
    distance: '1.8 km away',
    rating: 4.5,
    reportsCount: 342,
    timeAgo: '45 min ago',
    user: {
      name: 'David Wilson',
      isVerified: true,
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    media: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
    isTrending: true,
    credibility: 'high',
  },
];

const categoryColors = {
  crime: colors.secondary,
  event: colors.warning,
  accident: '#EA580C',
  environment: colors.accent,
  politics: '#7C3AED',
  infrastructure: '#4F46E5',
  other: colors.neutralMedium,
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
    rating: parseFloat(report.average_rating) || 4.0,
    reportsCount: report.views_count || 1,
    commentsCount: report.comments_count || 0, // From withCount('comments')
    timeAgo: formatTimeAgo(report.created_at),
    user: {
      name: report.is_anonymous ? null : (report.user?.name || 'User'),
      isVerified: report.user?.is_verified || false,
      avatar: report.user?.avatar_url || null,
    },
    media: mediaUrl,
    isTrending: report.is_trending || report.views_count > 100 || false,
    credibility: parseFloat(report.average_rating) >= 4 ? 'high' : parseFloat(report.average_rating) >= 2.5 ? 'medium' : 'low',
    isFromApi: true, // Flag to identify API reports
  };
};

export default function NewsFeedScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useState(mockFeedData);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set()); // Track favorited report IDs
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

      // Combine API reports (at the top) with mock data
      // API reports come first so newest submitted reports appear at top
      setFeedData([...transformedReports, ...mockFeedData]);
    } catch (error) {
      console.warn('Error fetching reports, using mock data:', error.message);
      // On error, just use mock data
      setFeedData(mockFeedData);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedData();
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const renderTrendingSection = () => (
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
        {feedData
          .filter(item => item.isTrending)
          .map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.trendingCard}
              onPress={() => handleReportPress(item)}>
              {item.media && (
                <Image source={{ uri: item.media }} style={styles.trendingImage} />
              )}
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

  const renderFeedItem = ({ item }) => {
    const isOwner = isUserReport(item);

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
              <Icon name="dots-horizontal" size={20} color={colors.neutralMedium} />
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

          <TouchableOpacity style={styles.replyButton}>
            <Icon name="reply" size={18} color={colors.neutralMedium} />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </View>

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
            <TouchableOpacity style={styles.searchButton} onPress={() => setShowSearch(true)}>
              <Icon name="magnify" size={24} color={colors.neutralDark} />
            </TouchableOpacity>
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
        data={filteredData}
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
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load More</Text>
            <Icon name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
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
