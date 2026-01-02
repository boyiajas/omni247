<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Alerts</h1>
            <p>Emergency alerts and notifications</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="empty-state">Loading alerts...</div>
                <div v-else>
                    <div class="alert-section">
                        <h3>High Priority</h3>
                        <div v-if="alerts.high_priority.length === 0" class="empty-state">No high priority alerts.</div>
                        <div v-else class="alert-list">
                            <div v-for="item in alerts.high_priority" :key="item.id" class="alert-card">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.category?.name || 'Uncategorized' }} • {{ item.address || 'Unknown location' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="alert-section">
                        <h3>Trending</h3>
                        <div v-if="alerts.trending.length === 0" class="empty-state">No trending alerts.</div>
                        <div v-else class="alert-list">
                            <div v-for="item in alerts.trending" :key="item.id" class="alert-card">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.category?.name || 'Uncategorized' }} • {{ item.address || 'Unknown location' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="alert-section">
                        <h3>News</h3>
                        <div v-if="alerts.news.length === 0" class="empty-state">No news alerts.</div>
                        <div v-else class="alert-list">
                            <div v-for="item in alerts.news" :key="item.id" class="alert-card">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.category?.name || 'Uncategorized' }} • {{ item.address || 'Unknown location' }}</p>
                            </div>
                        </div>
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
    name: 'ClientAlertsView',
    components: { ClientLayout },
    data() {
        return {
            loading: false,
            alerts: {
                high_priority: [],
                trending: [],
                news: [],
            },
        };
    },
    async mounted() {
        await this.fetchAlerts();
    },
    methods: {
        async fetchAlerts() {
            this.loading = true;
            try {
                const response = await axios.get('/client/api/alerts');
                this.alerts = {
                    high_priority: response.data?.high_priority || [],
                    trending: response.data?.trending || [],
                    news: response.data?.news || [],
                };
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.alert-section {
    margin-bottom: 20px;
}

.alert-section h3 {
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 10px;
}

.alert-list {
    display: grid;
    gap: 12px;
}

.alert-card {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
}

.alert-card h4 {
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 4px;
}

.alert-card p {
    font-size: 12px;
    color: #64748b;
}

.empty-state {
    padding: 12px;
    color: #64748b;
    text-align: center;
}
</style>
