// Secure storage for sensitive data
// Note: For production, you should use react-native-keychain or similar library

import AsyncStorageService from './AsyncStorageService';

class SecureStorage {
    // In production, replace with actual secure storage implementation
    async setSecureItem(key, value) {
        return AsyncStorageService.setItem(`secure_${key}`, value);
    }

    async getSecureItem(key) {
        return AsyncStorageService.getItem(`secure_${key}`);
    }

    async removeSecureItem(key) {
        return AsyncStorageService.removeItem(`secure_${key}`);
    }

    // Biometric storage methods
    async setWithBiometric(key, value) {
        // TODO: Implement biometric-protected storage
        return this.setSecureItem(key, value);
    }

    async getWithBiometric(key) {
        // TODO: Implement biometric-protected retrieval
        return this.getSecureItem(key);
    }
}

export default new SecureStorage();
