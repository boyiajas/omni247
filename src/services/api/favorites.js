// src/services/api/favorites.js
import ApiClient from './ApiClient';

export const favoritesAPI = {
    /**
     * Get user's favorited reports
     */
    getFavorites: async () => {
        const response = await ApiClient.get('/favorites');
        return response.data;
    },

    /**
     * Toggle favorite status for a report
     */
    toggleFavorite: async (reportId) => {
        const response = await ApiClient.post('/favorites/toggle', {
            report_id: reportId,
        });
        return response.data;
    },

    /**
     * Check if user has favorited a report
     */
    checkFavorite: async (reportId) => {
        const response = await ApiClient.get(`/favorites/check/${reportId}`);
        return response.data;
    },
};

export default favoritesAPI;
