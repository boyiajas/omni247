import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { rewardsAPI } from '../../services/api/rewards';



const rewards = [
  { id: '1', name: 'Premium Features', points: 500, description: 'Ad-free experience for 30 days', icon: 'crown' },
  { id: '2', name: '$25 Gift Card', points: 1000, description: 'Amazon, Starbucks, or donate to charity', icon: 'gift' },
  { id: '3', name: 'Verified Badge', points: 1500, description: 'Get verified reporter status', icon: 'check-decagram' },
  { id: '4', name: 'API Access', points: 2000, description: 'Access to advanced API features', icon: 'api' },
];



export default function RewardsScreen({ navigation }) {
  const [userPoints, setUserPoints] = useState(0);
  const [activities, setActivities] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userTier, setUserTier] = useState('Bronze');
  const [progress, setProgress] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);

  const tiers = [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32' },
    { name: 'Silver', min: 501, max: 1000, color: '#C0C0C0' },
    { name: 'Gold', min: 1001, max: 2000, color: '#FFD700' },
    { name: 'Platinum', min: 2001, max: 5000, color: '#E5E4E2' },
    { name: 'Diamond', min: 5001, max: 10000, color: '#B9F2FF' },
  ];

  const currentTier = tiers.find(t => userPoints >= t.min && userPoints <= t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];

  const loadRewards = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch both rewards and achievements concurrently
      const [rewardsResponse, achievementsResponse] = await Promise.all([
        rewardsAPI.getUserRewardsAndActivities(),
        rewardsAPI.getUserAchievements(),
      ]);

      const rewardsData = rewardsResponse.data;
      const achievementsData = achievementsResponse.data;

      setUserPoints(rewardsData.total_points || 0);
      setActivities(rewardsData.activities || []);
      setBadges(achievementsData.achievements || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      setError('Failed to load rewards data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const onRefresh = () => {
    setDisplayCount(5);
    loadRewards(true);
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const calculateProgress = () => {
    if (!nextTier) return 100;
    const range = nextTier.max - currentTier.min;
    const progress = ((userPoints - currentTier.min) / range) * 100;
    return Math.min(progress, 100);
  };

  const renderBadge = ({ item }) => (
    <View style={styles.badgeItem}>
      <View style={[
        styles.badgeIconContainer,
        { backgroundColor: item.earned ? `${item.color}20` : colors.neutralLight }
      ]}>
        <Icon
          name={item.icon}
          size={24}
          color={item.earned ? item.color : colors.neutralMedium}
        />
        {!item.earned && (
          <Icon
            name="lock"
            size={10}
            color={colors.neutralMedium}
            style={styles.lockIcon}
          />
        )}
      </View>
      <Text style={styles.badgeName}>{item.name}</Text>
      <Text style={styles.badgeStatus}>
        {item.earned ? 'Earned' : 'Locked'}
      </Text>
    </View>
  );

  const renderReward = ({ item }) => (
    <TouchableOpacity style={styles.rewardCard}>
      <LinearGradient
        colors={[`${colors.primary}10`, `${colors.primary}05`]}
        style={styles.rewardGradient}>
        <Icon name={item.icon} size={40} color={colors.primary} />
        <Text style={styles.rewardPoints}>{item.points} pts</Text>
      </LinearGradient>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardDescription}>{item.description}</Text>
        <TouchableOpacity
          style={[
            styles.redeemButton,
            { opacity: userPoints >= item.points ? 1 : 0.5 }
          ]}
          disabled={userPoints < item.points}>
          <Text style={styles.redeemButtonText}>
            {userPoints >= item.points ? 'Redeem' : 'Need more points'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = ({ item }) => {
    // Determine icon based on action text
    let icon = 'star';
    const action = item.action.toLowerCase();
    if (action.includes('report')) icon = 'file-document';
    else if (action.includes('verified')) icon = 'check-circle';
    else if (action.includes('comment')) icon = 'message-text';
    else if (action.includes('first')) icon = 'flash';

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Icon name={icon} size={20} color={colors.accent} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityAction}>{item.action}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <Text style={styles.activityPoints}>{item.points}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.neutralDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rewards</Text>
        <TouchableOpacity>
          <Icon name="help-circle-outline" size={24} color={colors.neutralDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading rewards...</Text>
          </View>
        ) : (
          <>
            {/* Tier Progress */}
            <LinearGradient
              colors={[`${currentTier?.color}20`, `${currentTier?.color}10`]}
              style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Icon name="medal" size={30} color={currentTier?.color} />
                <View>
                  <Text style={styles.tierName}>{currentTier?.name} Tier Reporter</Text>
                  <Text style={styles.tierPoints}>{userPoints} Points</Text>
                </View>
              </View>

              {nextTier && (
                <>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressText}>
                        {userPoints - currentTier.min} / {nextTier.max - currentTier.min}
                      </Text>
                      <Text style={styles.progressText}>
                        {calculateProgress().toFixed(0)}% to {nextTier.name}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${calculateProgress()}%`,
                            backgroundColor: currentTier?.color,
                          }
                        ]}
                      />
                    </View>
                  </View>
                </>
              )}
            </LinearGradient>

            {/* Badges Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Badges</Text>
              <FlatList
                data={badges}
                renderItem={renderBadge}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesList}
              />
            </View>

            {/* Available Rewards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Rewards</Text>
              <FlatList
                data={rewards}
                renderItem={renderReward}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {activities.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Icon name="history" size={40} color={colors.neutralMedium} />
                  <Text style={styles.emptyStateText}>No recent activity</Text>
                  <Text style={styles.emptyStateCaption}>
                    Complete reports and engage with the community to earn points
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={activities.slice(0, displayCount)}
                    renderItem={renderActivity}
                    keyExtractor={item => item.id.toString()}
                    scrollEnabled={false}
                  />
                  {displayCount < activities.length && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={handleShowMore}
                    >
                      <Text style={styles.showMoreText}>Show More</Text>
                      <Icon name="chevron-down" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.neutralDark,
  },
  content: {
    padding: 14,
    paddingBottom: 28,
  },
  tierCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tierName: {
    ...typography.h3,
    color: colors.neutralDark,
    marginLeft: 12,
  },
  tierPoints: {
    ...typography.body,
    color: colors.neutralMedium,
    marginLeft: 12,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    ...typography.caption,
    color: colors.neutralDark,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutralLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutralDark,
    marginBottom: 12,
  },
  badgesList: {
    paddingRight: 20,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 14,
    width: 70,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  badgeName: {
    ...typography.caption,
    color: colors.neutralDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeStatus: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  rewardGradient: {
    width: 68,
    height: 68,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardPoints: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 5,
    fontWeight: '600',
  },
  rewardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rewardName: {
    ...typography.body,
    color: colors.neutralDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginBottom: 10,
  },
  redeemButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  redeemButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    ...typography.body,
    color: colors.neutralDark,
  },
  activityTime: {
    ...typography.small,
    color: colors.neutralMedium,
    marginTop: 2,
  },
  activityPoints: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: colors.neutralMedium,
    ...typography.body,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutralDark,
  },
  emptyStateCaption: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.neutralMedium,
    ...typography.caption,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
  },
  showMoreText: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
    ...typography.body,
  },
});
