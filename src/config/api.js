// src/config/api.js

import baseConfig from './config';

// ✅ Use the API_URL directly from config.js (already includes /api)
const API_URL = baseConfig?.API_URL || 'http://10.0.2.2:8000/api';

export default {
  ...baseConfig,

  // ✅ Core API URL that axios should use as baseURL
  API_URL,

  // API Endpoints (do NOT include /api here because API_URL already includes it)
  ENDPOINTS: {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    ANONYMOUS_LOGIN: '/anonymous',

    // Reports
    REPORTS: '/reports',
    REPORT_DETAIL: (id) => `/reports/${id}`,
    CREATE_REPORT: '/reports',
    UPDATE_REPORT: (id) => `/reports/${id}`,
    DELETE_REPORT: (id) => `/reports/${id}`,
    NEARBY_REPORTS: '/reports/nearby',

    // Media
    UPLOAD_MEDIA: '/media/upload',
    DELETE_MEDIA: (id) => `/media/${id}`,

    // User
    PROFILE: '/user',
    UPDATE_PROFILE: '/user',
    USER_REPORTS: '/user/reports',
    NOTIFICATION_SETTINGS: '/user/notification-settings',

    // Notifications
    NOTIFICATIONS: '/notifications',
    MARK_AS_READ: (id) => `/notifications/${id}/read`,
    REGISTER_DEVICE: '/notifications/register-device',

    // Rewards
    REWARDS: '/rewards',
    ACHIEVEMENTS: '/rewards/achievements',
    REDEEM: '/rewards/redeem',

    // Agency
    AGENCIES: '/agencies',
    AGENCY_DASHBOARD: '/agency/dashboard',
    AGENCY_REPORTS: '/agency/reports',
    VERIFY_REPORT: (id) => `/agency/reports/${id}/verify`,

    // Categories
    CATEGORIES: '/categories',
  },

  // Request timeout
  TIMEOUT: 30000,

  // Pagination
  PAGE_SIZE: 20,
};
