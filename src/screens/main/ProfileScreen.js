import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../services/api/reports';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

export default function ProfileScreen({ navigation }) {
  const { logout, user: authUser } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...typography.body,
      color: palette.textSecondary,
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
      paddingTop: 66,
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
      backgroundColor: palette.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: palette.white,
    },
    avatarText: {
      color: palette.primary,
      fontSize: 36,
      fontWeight: '700',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: palette.accent,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: palette.white,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      color: palette.white,
      marginBottom: 4,
      fontSize: 20,
      fontWeight: '700',
    },
    userEmail: {
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 4,
    },
    memberSince: {
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
      backgroundColor: palette.white,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: palette.black,
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
      backgroundColor: palette.white,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 5,
      alignItems: 'center',
      shadowColor: palette.black,
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
      color: palette.textPrimary,
      fontSize: 28,
      fontWeight: '700',
    },
    statLabel: {
      color: palette.textSecondary,
      marginTop: 5,
      fontSize: 12,
    },
    badgesSection: {
      paddingHorizontal: 20,
      marginBottom: 25,
    },
    sectionTitle: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
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
      color: palette.textPrimary,
      textAlign: 'center',
      marginBottom: 4,
      fontWeight: '500',
      fontSize: 12,
    },
    badgeStatus: {
      ...typography.small,
      color: palette.textSecondary,
    },
    viewAllBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
    },
    viewAllText: {
      color: palette.primary,
      fontWeight: '600',
      marginRight: 5,
    },
    menuSection: {
      paddingHorizontal: 20,
      marginBottom: 25,
    },
    menuList: {
      backgroundColor: palette.white,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.neutralLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    menuItemText: {
      ...typography.body,
      color: palette.textPrimary,
      flex: 1,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.white,
      marginHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      marginBottom: 20,
    },
    logoutText: {
      ...typography.body,
      color: palette.secondary,
      fontWeight: '600',
      marginLeft: 10,
    },
    versionContainer: {
      alignItems: 'center',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      marginHorizontal: 20,
    },
    versionText: {
      color: palette.textSecondary,
      marginBottom: 5,
    },
    copyrightText: {
      ...typography.small,
      color: palette.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: palette.white,
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
      borderBottomColor: palette.border,
    },
    modalTitle: {
      ...typography.h2,
      color: palette.textPrimary,
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
      color: palette.textPrimary,
      marginBottom: 8,
      fontWeight: '500',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.neutralLight,
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
      color: palette.textPrimary,
    },
    changePassword: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.white,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    changePasswordText: {
      ...typography.body,
      color: palette.textPrimary,
    },
    modalFooter: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    saveButton: {
      backgroundColor: palette.primary,
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
      color: palette.white,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: palette.neutralLight,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButtonText: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '600',
    },
  }));
  const locale = language === 'yo' ? 'yo-NG' : 'en-US';
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Use AuthContext user data
  const userData = authUser || {};
  const roleThemes = {
    admin: { labelKey: 'profile.roleAdmin', icon: 'shield-crown', color: '#fb7185', background: 'rgba(251, 113, 133, 0.15)' },
    moderator: { labelKey: 'profile.roleModerator', icon: 'account-check', color: '#2563eb', background: 'rgba(37, 99, 235, 0.15)' },
    agency: { labelKey: 'profile.roleAgency', icon: 'briefcase', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.15)' },
    user: { labelKey: 'profile.roleCommunity', icon: 'account', color: '#6b7280', background: 'rgba(107, 114, 128, 0.15)' },
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

  useEffect(() => {
    const fetchReportCount = async () => {
      if (!authUser?.id) return;
      try {
        const response = await reportsAPI.getUserReports();
        const total = response.data?.total ?? response.data?.meta?.total;
        if (typeof total === 'number') {
          setReportCount(total);
        } else if (Array.isArray(response.data?.data)) {
          setReportCount(response.data.data.length);
        } else {
          setReportCount(authUser?.total_reports || 0);
        }
      } catch (error) {
        console.error('Error loading report count:', error);
        setReportCount(authUser?.total_reports || 0);
      }
    };

    fetchReportCount();
  }, [authUser?.id, authUser?.total_reports]);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logoutAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Use AuthContext logout - it will automatically navigate to auth screens
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('profile.errorTitle'), t('profile.logoutError'));
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
      Alert.alert(t('common.success'), t('profile.updateSuccess'));
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(t('profile.errorTitle'), t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: t('profile.menuReports'),
      icon: 'file-document-multiple',
      onPress: () => navigation.navigate('UserProfile', { userId: userData?.id }),
    },
    {
      id: '2',
      title: t('profile.menuRewards'),
      icon: 'trophy',
      onPress: () => navigation.navigate('Rewards'),
    },
    {
      id: '3',
      title: t('profile.menuFavorites'),
      icon: 'heart',
      onPress: () => navigation.navigate('MyFavorites'),
    },
    {
      id: '4',
      title: t('settings.title'),
      icon: 'cog',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: '5',
      title: t('settings.privacy'),
      icon: 'shield-lock',
      onPress: () => Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonBody')),
    },
    {
      id: '6',
      title: t('helpCenter.title'),
      icon: 'help-circle',
      onPress: () => navigation.navigate('HelpCenter'),
    },
    {
      id: '7',
      title: t('helpCenter.faq'),
      icon: 'frequently-asked-questions',
      onPress: () => navigation.navigate('FAQ'),
    },
    {
      id: '8',
      title: t('contactSupport.title'),
      icon: 'chat-processing',
      onPress: () => navigation.navigate('ContactSupport'),
    },
    {
      id: '9',
      title: t('profile.menuAbout'),
      icon: 'information',
      onPress: () => Alert.alert(t('profile.aboutTitle'), t('profile.aboutBody')),
    },
  ];

  const renderStatsCards = () => {
    const stats = [
      { label: t('profile.reports'), value: reportCount || 0, icon: 'file-chart', color: '#0ea5e9' },
      { label: t('profile.reputation'), value: userData?.reputation_score || 0, icon: 'star-circle', color: '#f97316' },
      { label: t('profile.points'), value: userData?.total_points || 0, icon: 'trophy-award', color: '#22c55e' },
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
        <Text style={[styles.roleBadgeText, { color: theme.color }]}>{t(theme.labelKey)}</Text>
      </View>
    );
  };

  const renderBadges = () => (
    <View style={styles.badgesSection}>
      <Text style={styles.sectionTitle}>{t('profile.badges')}</Text>
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
                color={badge.earned ? badge.color : colors.textSecondary}
              />
            </View>
            <Text style={[
              styles.badgeStatus,
            ]}>
              {badge.earned ? t('achievements.earned') : t('achievements.locked')}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.viewAllBadges}
        onPress={() => navigation.navigate('Achievements')}>
        <Text style={styles.viewAllText}>{t('profile.viewAllAchievements')}</Text>
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
        <Icon name={item.icon} size={22} color={colors.textPrimary} />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
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
          colors={[colors.primary, colors.primaryDark]}
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
                <Text style={styles.userName}>{userData?.name || t('profile.anonymous')}</Text>
                <Text style={styles.userEmail}>{userData?.email || t('profile.anonymousEmail')}</Text>
                <View style={styles.contactRow}>
                  <Icon name="phone" size={16} color="rgba(255, 255, 255, 0.9)" style={styles.contactIcon} />
                  <Text style={styles.contactText}>
                    {userData?.phone || t('profile.noPhone')}
                  </Text>
                </View>
                {renderRoleBadge()}
                <Text style={styles.memberSince}>
                  {t('profile.memberSince', {
                    date: new Date(userData?.joinDate || new Date()).toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
                  })}
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
          <Text style={styles.sectionTitle}>{t('profile.sectionAccount')}</Text>
          <View style={styles.menuList}>
            {menuItems.slice(0, 4).map(renderMenuItem)}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('profile.sectionSupport')}</Text>
          <View style={styles.menuList}>
            {menuItems.slice(4, 8).map(renderMenuItem)}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.secondary} />
          <Text style={styles.logoutText}>{t('profile.logoutAction')}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('profile.version', { version: '1.0.0' })}</Text>
          <Text style={styles.copyrightText}>{t('profile.copyright')}</Text>
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
              <Text style={styles.modalTitle}>{t('profile.editProfile')}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.fullName')}</Text>
                <View style={styles.inputContainer}>
                  <Icon name="account" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                    placeholder={t('profile.fullNamePlaceholder')}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.email')}</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder={t('profile.emailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.phone')}</Text>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                    placeholder={t('profile.phonePlaceholder')}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.changePassword}>
                <Text style={styles.changePasswordText}>{t('profile.changePassword')}</Text>
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
                  <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
