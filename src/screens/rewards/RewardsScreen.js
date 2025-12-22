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
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const badges = [
  { id: '1', name: 'First Report', icon: 'star', color: '#FFD700', earned: true },
  { id: '2', name: 'Verified Reporter', icon: 'check-decagram', color: '#059669', earned: true },
  { id: '3', name: 'Top Contributor', icon: 'trophy', color: '#DC2626', earned: true },
  { id: '4', name: 'Gold Tier', icon: 'medal', color: '#D4AF37', earned: false },
  { id: '5', name: 'Emergency Responder', icon: 'ambulance', color: '#2563EB', earned: false },
  { id: '6', name: 'Community Leader', icon: 'account-group', color: '#7C3AED', earned: true },
];

const rewards = [
  { id: '1', name: 'Premium Features', points: 500, description: 'Ad-free experience for 30 days', icon: 'crown' },
  { id: '2', name: '$25 Gift Card', points: 1000, description: 'Amazon, Starbucks, or donate to charity', icon: 'gift' },
  { id: '3', name: 'Verified Badge', points: 1500, description: 'Get verified reporter status', icon: 'check-decagram' },
  { id: '4', name: 'API Access', points: 2000, description: 'Access to advanced API features', icon: 'api' },
];

const activities = [
  { id: '1', action: 'High-rated report', points: '+50', time: 'Yesterday', icon: 'thumb-up' },
  { id: '2', action: 'Verified information', points: '+25', time: '2 days ago', icon: 'check-circle' },
  { id: '3', action: 'First to report', points: '+10', time: '1 week ago', icon: 'flash' },
  { id: '4', action: 'Helpful comment', points: '+5', time: '2 weeks ago', icon: 'message-text' },
];

export default function RewardsScreen({ navigation }) {
  const [userPoints, setUserPoints] = useState(1250);
  const [userTier, setUserTier] = useState('Gold');
  const [progress, setProgress] = useState(75); // Percentage to next tier

  const tiers = [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32' },
    { name: 'Silver', min: 501, max: 1000, color: '#C0C0C0' },
    { name: 'Gold', min: 1001, max: 2000, color: '#FFD700' },
    { name: 'Platinum', min: 2001, max: 5000, color: '#E5E4E2' },
    { name: 'Diamond', min: 5001, max: 10000, color: '#B9F2FF' },
  ];

  const currentTier = tiers.find(t => userPoints >= t.min && userPoints <= t.max);
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];

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
          size={30} 
          color={item.earned ? item.color : colors.neutralMedium} 
        />
        {!item.earned && (
          <Icon 
            name="lock" 
            size={12} 
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

  const renderActivity = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Icon name={item.icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityAction}>{item.action}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
      <Text style={styles.activityPoints}>{item.points}</Text>
    </View>
  );

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

      <ScrollView contentContainerStyle={styles.content}>
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
          <FlatList
            data={activities}
            renderItem={renderActivity}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
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
    ...typography.h3,
    color: colors.neutralDark,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 30,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutralDark,
    marginBottom: 16,
  },
  badgesList: {
    paddingRight: 20,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  badgeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  rewardGradient: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
});