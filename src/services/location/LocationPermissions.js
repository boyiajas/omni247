import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class LocationPermissions {
    async checkPermission() {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return result;
            } else {
                const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                return result === RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Error checking location permission:', error);
            return false;
        }
    }

    async requestPermission() {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'G-iReport needs access to your location to show nearby incidents',
                        buttonPositive: 'OK',
                    }
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                return result === RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    }

    async requestBackgroundPermission() {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: 'Background Location Permission',
                        message: 'Allow G-iReport to access location in the background for alerts',
                        buttonPositive: 'OK',
                    }
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
                return result === RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Error requesting background location permission:', error);
            return false;
        }
    }
}

export default new LocationPermissionsClass();
