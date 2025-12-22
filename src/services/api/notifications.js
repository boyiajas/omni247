import ApiClient from './ApiClient';
import config from '../../config/api';

export const notificationsAPI = {
    getNotifications: async (params = {}) => {
        return ApiClient.get(config.ENDPOINTS.NOTIFICATIONS, { params });
    },

    getUnreadCount: async () => {
        return ApiClient.get(`${config.ENDPOINTS.NOTIFICATIONS}/unread-count`);
    },

    markAsRead: async (id) => {
        return ApiClient.put(config.ENDPOINTS.MARK_AS_READ(id));
    },

    markAllAsRead: async () => {
        return ApiClient.post(`${config.ENDPOINTS.NOTIFICATIONS}/read-all`);
    },

    registerDevice: async (token, platform = 'android') => {
        return ApiClient.post(config.ENDPOINTS.REGISTER_DEVICE, {
            token,
            platform,
        });
    },

    unregisterDevice: async (token) => {
        return ApiClient.post(`${config.ENDPOINTS.REGISTER_DEVICE}/unregister`, {
            token,
        });
    },
};
