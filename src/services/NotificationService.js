import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  static async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          return true;
        }
        return false;
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  static async getFCMToken() {
    try {
      await this.requestPermission();
      const token = await messaging().getToken();
      await AsyncStorage.setItem('@fcm_token', token);
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
      return null;
    }
  }

  static async setupBackgroundHandler() {
    // Handle background notifications
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in background:', remoteMessage);
      // Handle background notification
      return Promise.resolve();
    });
  }

  static async setupForegroundHandler() {
    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Message handled in foreground:', remoteMessage);
      
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new notification',
        [
          {
            text: 'View',
            onPress: () => this.handleNotificationPress(remoteMessage),
          },
          {
            text: 'Dismiss',
            style: 'cancel',
          },
        ]
      );
    });

    return unsubscribe;
  }

  static handleNotificationPress(remoteMessage) {
    const { data } = remoteMessage;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'emergency_alert':
        // Navigate to alerts screen with emergency details
        break;
      case 'new_report':
        // Navigate to report detail
        break;
      case 'reward_earned':
        // Navigate to rewards screen
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  }

  static async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Topic subscription error:', error);
    }
  }

  static async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Topic unsubscription error:', error);
    }
  }

  static async subscribeToLocationTopics(latitude, longitude) {
    // Subscribe to location-based topics
    const gridX = Math.floor(latitude * 100);
    const gridY = Math.floor(longitude * 100);
    const topic = `location_${gridX}_${gridY}`;
    await this.subscribeToTopic(topic);
  }
}

export default NotificationService;