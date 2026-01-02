<template>
    <ClientLayout>
        <div class="dashboard-view">
            <div class="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's your overview</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-content">
                        <h3>{{ stats.totalReports }}</h3>
                        <p>Total Reports</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <h3>{{ stats.reputation }}</h3>
                        <p>Reputation Score</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <h3>{{stats.points }}</h3>
                        <p>Total Points</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🎖️</div>
                    <div class="stat-content">
                        <h3>{{ stats.badges }}</h3>
                        <p>Badges Earned</p>
                    </div>
                </div>
            </div>

            <div class="content-grid">
                <div class="card recent-activity">
                    <div class="card-header">
                        <h2>Recent Activity</h2>
                        <router-link to="/news-feed" class="link">View All</router-link>
                    </div>
                    <div class="card-body">
                        <div v-if="loading" class="loading">Loading...</div>
                        <div v-else-if="recentReports.length === 0" class="empty-state">
                            <p>No recent activity</p>
                        </div>
                        <div v-else class="activity-list">
                            <div v-for="report in recentReports" :key="report.id" class="activity-item">
                                <div class="activity-icon">📄</div>
                                <div class="activity-content">
                                    <h4>{{ report.title }}</h4>
                                    <p>{{ report.category?.name || 'Uncategorized' }} • {{ formatDate(report.created_at) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card quick-actions">
                    <div class="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div class="card-body">
                        <router-link to="/create-report" class="action-button">
                            <span class="icon">➕</span>
                            <span>Create New Report</span>
                        </router-link>
                        
                        <router-link to="/map" class="action-button">
                            <span class="icon">🗺️</span>
                            <span>View Map</span>
                        </router-link>
                        
                        <router-link to="/alerts" class="action-button">
                            <span class="icon">🚨</span>
                            <span>Check Alerts</span>
                        </router-link>
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
    name: 'ClientDashboardView',
    components: {
        ClientLayout,
    },
    data() {
        return {
            stats: {
                totalReports: 0,
                reputation: 0,
                points: 0,
                badges: 0,
            },
            recentReports: [],
            loading: true,
        };
    },
    async mounted() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const response = await axios.get('/client/api/overview');
                this.stats = response.data?.stats || this.stats;
                this.recentReports = response.data?.recentReports || [];
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        },
    },
};
</script>

<style scoped>
.dashboard-view {
    max-width: 1200px;
}

.page-header {
    margin-bottom: 32px;
}

.page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
}

.page-header p {
    color: #64748b;
    font-size: 15px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
    transition: all 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
    font-size: 34px;
    margin-right: 14px;
}

.stat-content h3 {
    font-size: 26px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
}

.stat-content p {
    color: #64748b;
    font-size: 13px;
}

.content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}

@media (max-width: 968px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.card-header {
    padding: 18px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h2 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
}

.card-header .link {
    color: #2563eb;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
}

.card-header .link:hover {
    text-decoration: underline;
}

.card-body {
    padding: 20px;
}

.loading,
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 12px;
    transition: background 0.2s;
}

.activity-item:hover {
    background: #f8fafc;
}

.activity-icon {
    font-size: 20px;
    margin-right: 10px;
}

.activity-content h4 {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
}

.activity-content p {
    font-size: 12px;
    color: #64748b;
}

.action-button {
    display: flex;
    align-items: center;
    padding: 14px;
    background: #f8fafc;
    border-radius: 12px;
    text-decoration: none;
    color: #0f172a;
    margin-bottom: 12px;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.action-button:last-child {
    margin-bottom: 0;
}

.action-button:hover {
    background: #2563eb;
    color: white;
    transform: translateX(4px);
    border-color: #1d4ed8;
}

.action-button .icon {
    font-size: 20px;
    margin-right: 10px;
}
</style>
