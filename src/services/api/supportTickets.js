import ApiClient from './ApiClient';
import config from '../../config/api';

export const supportTicketsAPI = {
  submit: async (payload) => {
    return ApiClient.post(config.ENDPOINTS.SUPPORT_TICKETS, payload);
  },
};
