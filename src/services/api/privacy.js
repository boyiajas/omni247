import ApiClient from './ApiClient';

export const privacyAPI = {
    /**
     * Get user's privacy settings
     */
    getPrivacySettings: async () => {
        return ApiClient.get('/user/privacy-settings');
    },

    /**
     * Update user's privacy settings
     * @param {Object} settings - Privacy settings object
     */
    updatePrivacySettings: async (settings) => {
        return ApiClient.put('/user/privacy-settings', settings);
    },
};

export default privacyAPI;
