import ApiClient from './ApiClient';
import config from '../../config/api';

export const authAPI = {
    login: async (email, password) => {
        return ApiClient.post(config.ENDPOINTS.LOGIN, { email, password });
    },

    register: async (userData) => {
        return ApiClient.post(config.ENDPOINTS.REGISTER, userData);
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
};
