import ApiClient from './ApiClient';
import config from '../../config/api';

export const rewardsAPI = {
    getRewards: async () => {
        return ApiClient.get(config.ENDPOINTS.REWARDS);
    },

    getAchievements: async () => {
        return ApiClient.get(config.ENDPOINTS.ACHIEVEMENTS);
    },

    redeem: async (rewardId) => {
        return ApiClient.post(config.ENDPOINTS.REDEEM, { rewardId });
    },

    getUserPoints: async () => {
        return ApiClient.get(`${config.ENDPOINTS.REWARDS}/points`);
    },

    getRewardHistory: async () => {
        return ApiClient.get(`${config.ENDPOINTS.REWARDS}/history`);
    },
};
