import { launchCamera } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class CameraService {
    async requestPermission() {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await request(PERMISSIONS.IOS.CAMERA);
                return result === RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            return false;
        }
    }

    async takePhoto(options = {}) {
        const hasPermission = await this.requestPermission();

        if (!hasPermission) {
            throw new Error('Camera permission denied');
        }

        return new Promise((resolve, reject) => {
            launchCamera(
                {
                    mediaType: 'photo',
                    quality: options.quality || 0.8,
                    maxWidth: options.maxWidth || 1920,
                    maxHeight: options.maxHeight || 1920,
                    includeBase64: options.includeBase64 || false,
                    saveToPhotos: options.saveToPhotos || false,
                },
                (response) => {
                    if (response.didCancel) {
                        resolve(null);
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage));
                    } else {
                        resolve(response.assets[0]);
                    }
                }
            );
        });
    }

    async recordVideo(options = {}) {
        const hasPermission = await this.requestPermission();

        if (!hasPermission) {
            throw new Error('Camera permission denied');
        }

        return new Promise((resolve, reject) => {
            launchCamera(
                {
                    mediaType: 'video',
                    videoQuality: options.videoQuality || 'high',
                    durationLimit: options.durationLimit || 60,
                    saveToPhotos: options.saveToPhotos || false,
                },
                (response) => {
                    if (response.didCancel) {
                        resolve(null);
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage));
                    } else {
                        resolve(response.assets[0]);
                    }
                }
            );
        });
    }
}

export default new CameraService();
