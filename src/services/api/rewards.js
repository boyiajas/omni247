import ApiClient from './ApiClient';

export const rewardsAPI = {
    getUserRewardsAndActivities: async () => {
        return ApiClient.get('/user/rewards');
    },

    getUserAchievements: async () => {
        return ApiClient.get('/user/achievements');
    },

    getRewards: async () => {
        return ApiClient.get('/rewards');
    },

    getAchievements: async () => {
        return ApiClient.get('/achievements');
    },

    redeem: async (rewardId) => {
        return ApiClient.post('/rewards/redeem', { rewardId });
    },

    getUserPoints: async () => {
        return ApiClient.get('/user/rewards');
    },

    getRewardHistory: async () => {
        return ApiClient.get('/user/rewards');
    },
};
