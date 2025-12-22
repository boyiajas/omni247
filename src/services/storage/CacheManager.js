import AsyncStorageService from './AsyncStorageService';

class CacheManager {
    constructor() {
        this.CACHE_PREFIX = 'cache_';
        this.CACHE_EXPIRY_PREFIX = 'cache_expiry_';
        this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    }

    async set(key, data, ttl = this.DEFAULT_TTL) {
        const cacheKey = this.CACHE_PREFIX + key;
        const expiryKey = this.CACHE_EXPIRY_PREFIX + key;
        const expiryTime = Date.now() + ttl;

        await AsyncStorageService.setItem(cacheKey, JSON.stringify(data));
        await AsyncStorageService.setItem(expiryKey, expiryTime.toString());
    }

    async get(key) {
        const cacheKey = this.CACHE_PREFIX + key;
        const expiryKey = this.CACHE_EXPIRY_PREFIX + key;

        const expiryTime = await AsyncStorageService.getItem(expiryKey);

        if (!expiryTime || Date.now() > parseInt(expiryTime, 10)) {
            // Cache expired
            await this.remove(key);
            return null;
        }

        const data = await AsyncStorageService.getItem(cacheKey);

        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing cached data:', error);
            return null;
        }
    }

    async remove(key) {
        const cacheKey = this.CACHE_PREFIX + key;
        const expiryKey = this.CACHE_EXPIRY_PREFIX + key;

        await AsyncStorageService.removeItem(cacheKey);
        await AsyncStorageService.removeItem(expiryKey);
    }

    async clearAll() {
        const keys = await AsyncStorageService.getAllKeys();
        const cacheKeys = keys.filter(
            (key) => key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.CACHE_EXPIRY_PREFIX)
        );

        await Promise.all(cacheKeys.map((key) => AsyncStorageService.removeItem(key)));
    }

    async clearExpired() {
        const keys = await AsyncStorageService.getAllKeys();
        const expiryKeys = keys.filter((key) => key.startsWith(this.CACHE_EXPIRY_PREFIX));

        for (const expiryKey of expiryKeys) {
            const expiryTime = await AsyncStorageService.getItem(expiryKey);

            if (expiryTime && Date.now() > parseInt(expiryTime, 10)) {
                const key = expiryKey.replace(this.CACHE_EXPIRY_PREFIX, '');
                await this.remove(key);
            }
        }
    }
}

export default new CacheManager();
