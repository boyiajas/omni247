import ApiClient from './ApiClient';
import config from '../../config/api';

export const alertsAPI = {
  getAlerts: async (params = {}) => {
    return ApiClient.get(config.ENDPOINTS.ALERTS, { params });
  },
  dismissAlert: async (reportId, section) => {
    return ApiClient.post(config.ENDPOINTS.ALERT_DISMISS, {
      report_id: reportId,
      section,
    });
  },
};
