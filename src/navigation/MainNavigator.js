import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

// Main Screens
import MapScreen from '../screens/main/MapScreen';
import NewsFeedScreen from '../screens/main/NewsFeedScreen';
import AlertsScreen from '../screens/main/AlertsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

// Report Screens
import ReportCategoryScreen from '../screens/report/ReportCategoryScreen';
import ReportMediaScreen from '../screens/report/ReportMediaScreen';
import ReportDescriptionScreen from '../screens/report/ReportDescriptionScreen';
import ReportPreviewScreen from '../screens/report/ReportPreviewScreen';
import ReportSuccessScreen from '../screens/report/ReportSuccessScreen';
import EditReportScreen from '../screens/report/EditReportScreen';

// Detail Screens
import ReportDetailScreen from '../screens/details/ReportDetailScreen';
import UserProfileScreen from '../screens/details/UserProfileScreen';
import AgencyDetailScreen from '../screens/details/AgencyDetailScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettings from '../screens/settings/NotificationSettings';
import PrivacySettings from '../screens/settings/PrivacySettings';
import LanguageSettings from '../screens/settings/LanguageSettings';

// Rewards Screens
import RewardsScreen from '../screens/rewards/RewardsScreen';
import AchievementsScreen from '../screens/rewards/AchievementsScreen';
import RedemptionScreen from '../screens/rewards/RedemptionScreen';

// Profile Screens
import MyFavoritesScreen from '../screens/profile/MyFavoritesScreen';

// Agency Screens
import AgencyDashboardScreen from '../screens/agency/AgencyDashboardScreen';
import AgencyAnalyticsScreen from '../screens/agency/AgencyAnalyticsScreen';
import AgencySettingsScreen from '../screens/agency/AgencySettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ReportStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ReportCategory" component={ReportCategoryScreen} />
        <Stack.Screen name="ReportMedia" component={ReportMediaScreen} />
        <Stack.Screen name="ReportDescription" component={ReportDescriptionScreen} />
        <Stack.Screen name="ReportPreview" component={ReportPreviewScreen} />
        <Stack.Screen name="ReportSuccess" component={ReportSuccessScreen} />
        <Stack.Screen name="EditReport" component={EditReportScreen} />
    </Stack.Navigator>
);

const MainNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ReportFlow" component={ReportStack} />
        <Stack.Screen name="EditReport" component={EditReportScreen} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="AgencyDetail" component={AgencyDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
            <Stack.Screen name="LanguageSettings" component={LanguageSettings} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="Redemption" component={RedemptionScreen} />
            <Stack.Screen name="MyFavorites" component={MyFavoritesScreen} />
            <Stack.Screen name="AgencyDashboard" component={AgencyDashboardScreen} />
            <Stack.Screen name="AgencyAnalytics" component={AgencyAnalyticsScreen} />
            <Stack.Screen name="AgencySettings" component={AgencySettingsScreen} />
        </Stack.Navigator>
    );
};

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'NewsFeed') {
                        iconName = focused ? 'newspaper' : 'newspaper-outline';
                    } else if (route.name === 'Alerts') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}>
            <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
            <Tab.Screen name="NewsFeed" component={NewsFeedScreen} options={{ title: 'News' }} />
            <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default MainNavigator;
