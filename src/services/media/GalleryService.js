import { launchImageLibrary } from 'react-native-image-picker';

class GalleryService {
    async pickImage(options = {}) {
        return new Promise((resolve, reject) => {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    quality: options.quality || 0.8,
                    selectionLimit: options.selectionLimit || 1,
                    includeBase64: options.includeBase64 || false,
                },
                (response) => {
                    if (response.didCancel) {
                        resolve(null);
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage));
                    } else {
                        resolve(response.assets);
                    }
                }
            );
        });
    }

    async pickVideo(options = {}) {
        return new Promise((resolve, reject) => {
            launchImageLibrary(
                {
                    mediaType: 'video',
                    selectionLimit: options.selectionLimit || 1,
                },
                (response) => {
                    if (response.didCancel) {
                        resolve(null);
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage));
                    } else {
                        resolve(response.assets);
                    }
                }
            );
        });
    }

    async pickMedia(options = {}) {
        return new Promise((resolve, reject) => {
            launchImageLibrary(
                {
                    mediaType: 'mixed',
                    quality: options.quality || 0.8,
                    selectionLimit: options.selectionLimit || 1,
                    includeBase64: options.includeBase64 || false,
                },
                (response) => {
                    if (response.didCancel) {
                        resolve(null);
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage));
                    } else {
                        resolve(response.assets);
                    }
                }
            );
        });
    }
}

export default new GalleryService();
