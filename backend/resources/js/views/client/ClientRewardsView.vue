<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Rewards</h1>
            <p>View your achievements and rewards</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="empty-state">Loading rewards...</div>
                <div v-else-if="rewards.length === 0" class="empty-state">No rewards yet.</div>
                <div v-else class="reward-list">
                    <div v-for="reward in rewards" :key="reward.id" class="reward-card">
                        <div>
                            <h3>{{ reward.reason }}</h3>
                            <p>{{ formatDate(reward.created_at) }}</p>
                        </div>
                        <span class="points" :class="{ negative: reward.points < 0 }">
                            {{ reward.points >= 0 ? '+' : '' }}{{ reward.points }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </ClientLayout>
</template>

<script>
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout.vue';
export default {
    name: 'ClientRewardsView',
    components: { ClientLayout },
    data() {
        return {
            rewards: [],
            loading: false,
        };
    },
    async mounted() {
        await this.fetchRewards();
    },
    methods: {
        async fetchRewards() {
            this.loading = true;
            try {
                const response = await axios.get('/client/api/rewards');
                this.rewards = response.data?.data || [];
            } catch (error) {
                console.error('Error fetching rewards:', error);
            } finally {
                this.loading = false;
            }
        },
        formatDate(value) {
            return new Date(value).toLocaleDateString();
        },
    },
};
</script>

<style scoped>
.reward-list {
    display: grid;
    gap: 12px;
}

.reward-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
}

.reward-card h3 {
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 4px;
}

.reward-card p {
    font-size: 12px;
    color: #64748b;
}

.points {
    font-size: 14px;
    font-weight: 700;
    color: #16a34a;
}

.points.negative {
    color: #dc2626;
}

.empty-state {
    padding: 20px;
    color: #64748b;
    text-align: center;
}
</style>
