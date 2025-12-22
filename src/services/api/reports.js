import ApiClient from './ApiClient';
import config from '../../config/api';

export const reportsAPI = {
    getReports: async (params = {}) => {
        return ApiClient.get(config.ENDPOINTS.REPORTS, { params });
    },

    getReportDetail: async (id) => {
        return ApiClient.get(config.ENDPOINTS.REPORT_DETAIL(id));
    },

    createReport: async (reportData) => {
        return ApiClient.post(config.ENDPOINTS.CREATE_REPORT, reportData);
    },

    updateReport: async (id, reportData) => {
        return ApiClient.put(config.ENDPOINTS.UPDATE_REPORT(id), reportData);
    },

    deleteReport: async (id) => {
        return ApiClient.delete(config.ENDPOINTS.DELETE_REPORT(id));
    },

    getNearbyReports: async (latitude, longitude, radius = 5000) => {
        return ApiClient.get(config.ENDPOINTS.NEARBY_REPORTS, {
            params: { latitude, longitude, radius },
        });
    },

    getUserReports: async () => {
        return ApiClient.get(config.ENDPOINTS.USER_REPORTS);
    },

    getReportsByCategory: async (category) => {
        return ApiClient.get(config.ENDPOINTS.REPORTS, {
            params: { category },
        });
    },

    searchReports: async (query) => {
        return ApiClient.get(config.ENDPOINTS.REPORTS, {
            params: { search: query },
        });
    },
};
