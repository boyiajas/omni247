import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageService {
    async setItem(key, value) {
        try {
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            return false;
        }
    }

    async getItem(key) {
        try {
            const value = await AsyncStorage.getItem(key);
            return value;
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return null;
        }
    }

    async removeItem(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            return false;
        }
    }

    async clear() {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    async multiGet(keys) {
        try {
            const values = await AsyncStorage.multiGet(keys);
            return values.reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error getting multiple items:', error);
            return {};
        }
    }

    async multiSet(keyValuePairs) {
        try {
            const pairs = keyValuePairs.map(([key, value]) => [
                key,
                typeof value === 'string' ? value : JSON.stringify(value),
            ]);
            await AsyncStorage.multiSet(pairs);
            return true;
        } catch (error) {
            console.error('Error setting multiple items:', error);
            return false;
        }
    }

    async getAllKeys() {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }
}

export default new AsyncStorageService();
