import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { API_BASE_URL } from '../config/api';

const useNotificationHandler = (navigation) => {
  useEffect(() => {
    // Setup notification handlers
    setupNotifications();

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          handleNotificationPress(remoteMessage);
        }
      });

    // Handle notification when app is in background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationPress(remoteMessage);
    });

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const setupNotifications = async () => {
    try {
      // Get FCM token
      const token = await NotificationService.getFCMToken();
      
      // Send token to backend
      if (token) {
        await registerTokenToBackend(token);
      }

      // Setup handlers
      await NotificationService.setupBackgroundHandler();
      const unsubscribe = await NotificationService.setupForegroundHandler();

      return unsubscribe;
    } catch (error) {
      console.error('Setup notifications error:', error);
    }
  };

  const registerTokenToBackend = async (token) => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      const response = await fetch(`${API_BASE_URL}/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`,
        },
        body: JSON.stringify({
          device_token: token,
          device_type: Platform.OS,
          user_id: userId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register token');
      }
    } catch (error) {
      console.error('Register token error:', error);
    }
  };

  const handleNotificationPress = (remoteMessage) => {
    const { data, notification } = remoteMessage;

    // Extract navigation parameters
    let screen = 'Notifications';
    let params = {};

    if (data?.report_id) {
      screen = 'ReportDetail';
      params = { reportId: data.report_id };
    } else if (data?.type === 'emergency') {
      screen = 'EmergencyAlert';
      params = { alertId: data.alert_id };
    } else if (data?.type === 'reward') {
      screen = 'Rewards';
    }

    // Navigate to appropriate screen
    navigation.navigate(screen, params);
  };

  const handleAppStateChange = async (nextAppState) => {
    if (nextAppState === 'active') {
      // Check for pending notifications when app becomes active
      const hasPendingNotification = await AsyncStorage.getItem('@has_pending_notification');
      if (hasPendingNotification) {
        AsyncStorage.removeItem('@has_pending_notification');
        // Handle pending notification
      }
    }
  };
};

export default useNotificationHandler;
