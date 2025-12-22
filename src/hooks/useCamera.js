import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export const useCamera = () => {
    const [media, setMedia] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const requestCameraPermission = async () => {
        try {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA;

            const result = await request(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            return false;
        }
    };

    const takePhoto = useCallback(async (options = {}) => {
        setIsLoading(true);
        try {
            const hasPermission = await requestCameraPermission();

            if (!hasPermission) {
                throw new Error('Camera permission denied');
            }

            const result = await launchCamera({
                mediaType: options.mediaType || 'photo',
                quality: options.quality || 0.8,
                maxWidth: options.maxWidth || 1920,
                maxHeight: options.maxHeight || 1920,
                includeBase64: options.includeBase64 || false,
                saveToPhotos: options.saveToPhotos || false,
            });

            if (result.didCancel) {
                return null;
            }

            if (result.errorCode) {
                throw new Error(result.errorMessage);
            }

            const asset = result.assets[0];
            setMedia(asset);
            return asset;
        } catch (error) {
            console.error('Error taking photo:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const recordVideo = useCallback(async (options = {}) => {
        setIsLoading(true);
        try {
            const hasPermission = await requestCameraPermission();

            if (!hasPermission) {
                throw new Error('Camera permission denied');
            }

            const result = await launchCamera({
                mediaType: 'video',
                videoQuality: options.videoQuality || 'high',
                durationLimit: options.durationLimit || 60,
                saveToPhotos: options.saveToPhotos || false,
            });

            if (result.didCancel) {
                return null;
            }

            if (result.errorCode) {
                throw new Error(result.errorMessage);
            }

            const asset = result.assets[0];
            setMedia(asset);
            return asset;
        } catch (error) {
            console.error('Error recording video:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const pickFromGallery = useCallback(async (options = {}) => {
        setIsLoading(true);
        try {
            const result = await launchImageLibrary({
                mediaType: options.mediaType || 'mixed',
                quality: options.quality || 0.8,
                selectionLimit: options.selectionLimit || 1,
                includeBase64: options.includeBase64 || false,
            });

            if (result.didCancel) {
                return null;
            }

            if (result.errorCode) {
                throw new Error(result.errorMessage);
            }

            const assets = result.assets;
            setMedia(assets);
            return assets;
        } catch (error) {
            console.error('Error picking from gallery:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearMedia = useCallback(() => {
        setMedia(null);
    }, []);

    return {
        media,
        isLoading,
        takePhoto,
        recordVideo,
        pickFromGallery,
        clearMedia,
    };
};
