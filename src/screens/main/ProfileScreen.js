import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { logout, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Use AuthContext user data
  const userData = authUser || {};
  const roleThemes = {
    admin: { label: 'Administrator', icon: 'shield-crown', color: '#fb7185', background: 'rgba(251, 113, 133, 0.15)' },
    moderator: { label: 'Moderator', icon: 'account-check', color: '#2563eb', background: 'rgba(37, 99, 235, 0.15)' },
    agency: { label: 'Agency', icon: 'briefcase', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.15)' },
    user: { label: 'Community Member', icon: 'account', color: '#6b7280', background: 'rgba(107, 114, 128, 0.15)' },
  };

  useEffect(() => {
    if (authUser) {
      setEditForm({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
      });
    }
    setLoading(false);
  }, [authUser]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use AuthContext logout - it will automatically navigate to auth screens
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
    });
    setShowEditModal(true);
  };

  const saveProfileChanges = async () => {
    try {
      setLoading(true);

      // TODO: Make API call to update user profile
      // const response = await fetch('https://your-api.com/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`,
      //   },
      //   body: JSON.stringify(editForm),
      // });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      const updatedUser = {
        ...userData,
        ...editForm,
      };

      setUserData(updatedUser);
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));

      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Reports',
      icon: 'file-document-multiple',
      onPress: () => navigation.navigate('UserProfile', { userId: userData?.id }),
    },
    {
      id: '2',
      title: 'My Rewards',
      icon: 'trophy',
      onPress: () => navigation.navigate('Rewards'),
    },
    {
      id: '3',
      title: 'My Favourites',
      icon: 'heart',
      onPress: () => navigation.navigate('MyFavorites'),
    },
    {
      id: '4',
      title: 'Settings',
      icon: 'cog',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: '5',
      title: 'Privacy',
      icon: 'shield-lock',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings are coming soon!'),
    },
    {
      id: '6',
      title: 'Help Center',
      icon: 'help-circle',
      onPress: () => Alert.alert('Coming Soon', 'Help Center is coming soon!'),
    },
    {
      id: '7',
      title: 'Contact Support',
      icon: 'chat-processing',
      onPress: () => Alert.alert('Coming Soon', 'Contact Support is coming soon!'),
    },
    {
      id: '8',
      title: 'About G-iReport',
      icon: 'information',
      onPress: () => Alert.alert('About G-iReport', 'G-iReport v1.0.0\n\nGlobal Incident Reporting Platform\n\n© 2024 Global Eye Inc.'),
    },
  ];

  const renderStatsCards = () => {
    const stats = [
      { label: 'Reports', value: userData?.total_reports || 0, icon: 'file-chart', color: '#0ea5e9' },
      { label: 'Reputation', value: userData?.reputation_score || 0, icon: 'star-circle', color: '#f97316' },
      { label: 'Points', value: userData?.total_points || 0, icon: 'trophy-award', color: '#22c55e' },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Icon name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={styles.statNumber}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRoleBadge = () => {
    if (!userData?.role) return null;
    const theme = roleThemes[userData.role] || roleThemes.user;
    return (
      <View style={[styles.roleBadge, { backgroundColor: theme.background }]}>
        <Icon name={theme.icon} size={16} color={theme.color} />
        <Text style={[styles.roleBadgeText, { color: theme.color }]}>{theme.label}</Text>
      </View>
    );
  };

  const renderBadges = () => (
    <View style={styles.badgesSection}>
      <Text style={styles.sectionTitle}>Badges & Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesList}>
        {(userData?.badges || []).map((badge) => (
          <View key={badge.id} style={styles.badgeItem}>
            <View style={[
              styles.badgeIconContainer,
              { backgroundColor: badge.earned ? `${badge.color}20` : colors.neutralLight }
            ]}>
              <Icon
                name={badge.icon}
                size={24}
                color={badge.earned ? badge.color : colors.neutralMedium}
              />
            </View>
            <Text style={[
            ]}>
              {badge.earned ? 'Earned' : 'Locked'}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.viewAllBadges}
        onPress={() => navigation.navigate('Achievements')}>
        <Text style={styles.viewAllText}>View All Achievements</Text>
        <Icon name="chevron-right" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}>
      <View style={styles.menuIconContainer}>
        <Icon name={item.icon} size={22} color={colors.neutralDark} />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Icon name="chevron-right" size={20} color={colors.neutralMedium} />
    </TouchableOpacity>
  );

  if (loading && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={[colors.primary, '#3B82F6']}
          style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData?.name?.charAt(0) || 'U'}
                  </Text>
                </View>
                {userData?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="check-decagram" size={20} color={colors.white} />
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData?.name || 'Anonymous User'}</Text>
                <Text style={styles.userEmail}>{userData?.email || 'anonymous@example.com'}</Text>
                <View style={styles.contactRow}>
                  <Icon name="phone" size={16} color="rgba(255, 255, 255, 0.9)" style={styles.contactIcon} />
                  <Text style={styles.contactText}>
                    {userData?.phone || 'No phone number on file'}
                  </Text>
                </View>
                {renderRoleBadge()}
                <Text style={styles.memberSince}>
                  Member since {new Date(userData?.joinDate || new Date()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}>
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        {renderStatsCards()}

        {/* Badges Section */}
        {renderBadges()}

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {menuItems.slice(0, 4).map(renderMenuItem)}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuList}>
            {menuItems.slice(4, 8).map(renderMenuItem)}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.secondary} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>G-iReport v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Global Eye Inc.</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={colors.neutralDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="account" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your full name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color={colors.neutralMedium} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.changePassword}>
                <Text style={styles.changePasswordText}>Change Password</Text>
                <Icon name="chevron-right" size={20} color={colors.primary} />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={saveProfileChanges}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.neutralMedium,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarText: {
    /* ...typography.h1, */
    color: colors.primary,
    fontSize: 36,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    /* ...typography.h2, */
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    /* ...typography.body, */
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  memberSince: {
    /* ...typography.caption, */
    color: 'rgba(255, 255, 255, 0.7)',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    marginRight: 6,
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -20,
    marginHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    /* ...typography.h1, */
    color: colors.neutralDark,
    fontSize: 28,
  },
  statLabel: {
    /* ...typography.caption, */
    color: colors.neutralMedium,
    marginTop: 5,
  },
  badgesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    /* ...typography.h3, */
    color: colors.neutralDark,
    marginBottom: 15,
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
    /* ...typography.caption, */
    color: colors.neutralDark,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  badgeStatus: {
    ...typography.small,
  },
  viewAllBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  viewAllText: {
    /* ...typography.caption, */
    color: colors.primary,
    fontWeight: '600',
    marginRight: 5,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    ...typography.body,
    color: colors.neutralDark,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutralLight,
    marginBottom: 20,
  },
  logoutText: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
    marginHorizontal: 20,
  },
  versionText: {
    /* ...typography.caption, */
    color: colors.neutralMedium,
    marginBottom: 5,
  },
  copyrightText: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.neutralDark,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.body,
    color: colors.neutralDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    ...typography.body,
    color: colors.neutralDark,
  },
  changePassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  changePasswordText: {
    ...typography.body,
    color: colors.neutralDark,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.neutralLight,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.neutralDark,
    fontWeight: '600',
  },
});
