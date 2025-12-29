import ApiClient from './ApiClient';
import config from '../../config/api';
import { getDeviceInfo } from '../../utils/deviceInfo';

export const authAPI = {
    login: async (email, password) => {
        const deviceInfo = await getDeviceInfo();
        return ApiClient.post(config.ENDPOINTS.LOGIN, {
            email,
            password,
            ...deviceInfo
        });
    },

    register: async (userData) => {
        const deviceInfo = await getDeviceInfo();
        return ApiClient.post(config.ENDPOINTS.REGISTER, {
            ...userData,
            ...deviceInfo
        });
    },

    logout: async () => {
        return ApiClient.post(config.ENDPOINTS.LOGOUT);
    },

    forgotPassword: async (email) => {
        return ApiClient.post(config.ENDPOINTS.FORGOT_PASSWORD, { email });
    },

    resetPassword: async (token, password, passwordConfirmation) => {
        return ApiClient.post(config.ENDPOINTS.RESET_PASSWORD, {
            token,
            password,
            password_confirmation: passwordConfirmation,
        });
    },

    verifyEmail: async (token) => {
        return ApiClient.post(config.ENDPOINTS.VERIFY_EMAIL, { token });
    },

    anonymousLogin: async () => {
        return ApiClient.post(config.ENDPOINTS.ANONYMOUS_LOGIN);
    },

    getProfile: async () => {
        return ApiClient.get(config.ENDPOINTS.PROFILE);
    },

    updateProfile: async (data) => {
        return ApiClient.put(config.ENDPOINTS.UPDATE_PROFILE, data);
    },

    getNotificationSettings: async () => {
        return ApiClient.get(config.ENDPOINTS.NOTIFICATION_SETTINGS);
    },

    updateNotificationSettings: async (data) => {
        return ApiClient.put(config.ENDPOINTS.NOTIFICATION_SETTINGS, data);
    },

    getLanguageSettings: async () => {
        return ApiClient.get(config.ENDPOINTS.LANGUAGE_SETTINGS);
    },

    updateLanguageSettings: async (data) => {
        return ApiClient.put(config.ENDPOINTS.LANGUAGE_SETTINGS, data);
    },

    getThemeSettings: async () => {
        return ApiClient.get(config.ENDPOINTS.THEME_SETTINGS);
    },

    updateThemeSettings: async (data) => {
        return ApiClient.put(config.ENDPOINTS.THEME_SETTINGS, data);
    },
};
