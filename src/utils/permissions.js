import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, check, RESULTS, openSettings } from 'react-native-permissions';

export const PERMISSION_TYPES = {
    CAMERA: 'camera',
    LOCATION: 'location',
    MICROPHONE: 'microphone',
    PHOTOS: 'photos',
    NOTIFICATIONS: 'notifications',
};

const getPermission = (type) => {
    if (Platform.OS === 'android') {
        switch (type) {
            case PERMISSION_TYPES.CAMERA:
                return PermissionsAndroid.PERMISSIONS.CAMERA;
            case PERMISSION_TYPES.LOCATION:
                return PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
            case PERMISSION_TYPES.MICROPHONE:
                return PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
            case PERMISSION_TYPES.PHOTOS:
                return PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
            case PERMISSION_TYPES.NOTIFICATIONS:
                return PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
            default:
                return null;
        }
    } else {
        switch (type) {
            case PERMISSION_TYPES.CAMERA:
                return PERMISSIONS.IOS.CAMERA;
            case PERMISSION_TYPES.LOCATION:
                return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
            case PERMISSION_TYPES.MICROPHONE:
                return PERMISSIONS.IOS.MICROPHONE;
            case PERMISSION_TYPES.PHOTOS:
                return PERMISSIONS.IOS.PHOTO_LIBRARY;
            case PERMISSION_TYPES.NOTIFICATIONS:
                return PERMISSIONS.IOS.NOTIFICATIONS;
            default:
                return null;
        }
    }
};

export const checkPermission = async (type) => {
    try {
        const permission = getPermission(type);

        if (!permission) return false;

        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.check(permission);
            return result;
        } else {
            const result = await check(permission);
            return result === RESULTS.GRANTED;
        }
    } catch (error) {
        console.error(`Error checking ${type} permission:`, error);
        return false;
    }
};

export const requestPermission = async (type) => {
    try {
        const permission = getPermission(type);

        if (!permission) return false;

        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(permission);
            return result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            const result = await request(permission);
            return result === RESULTS.GRANTED;
        }
    } catch (error) {
        console.error(`Error requesting ${type} permission:`, error);
        return false;
    }
};

export const requestMultiplePermissions = async (types) => {
    const results = {};

    for (const type of types) {
        results[type] = await requestPermission(type);
    }

    return results;
};

export const openAppSettings = () => {
    openSettings();
};
