import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class NotificationPermissions {
    async checkPermission() {
        try {
            const authStatus = await messaging().hasPermission();
            return (
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL
            );
        } catch (error) {
            console.error('Error checking notification permission:', error);
            return false;
        }
    }

    async requestPermission() {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            return enabled;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    async registerForRemoteNotifications() {
        try {
            if (Platform.OS === 'ios') {
                await messaging().registerDeviceForRemoteMessages();
            }
            return true;
        } catch (error) {
            console.error('Error registering for remote notifications:', error);
            return false;
        }
    }
}

export default new NotificationPermissions();
