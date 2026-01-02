<template>
    <ClientLayout>
        <div class="page-header">
            <h1>My Reports</h1>
            <p>Manage your submitted reports</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="empty-state">Loading your reports...</div>
                <div v-else-if="reports.length === 0" class="empty-state">No reports submitted yet.</div>
                <div v-else class="report-list">
                    <div v-for="report in reports" :key="report.id" class="report-row">
                        <div class="report-info">
                            <h3>{{ report.title }}</h3>
                            <p>{{ report.category?.name || 'Uncategorized' }} • {{ formatDate(report.created_at) }}</p>
                            <p class="report-address">{{ report.address || 'Unknown location' }}</p>
                        </div>
                        <div class="report-meta">
                            <span class="status" :class="report.status">{{ report.status }}</span>
                            <div class="stats">
                                <span>👁️ {{ report.views_count }}</span>
                                <span>💬 {{ report.comments_count }}</span>
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
    name: 'ClientReportsView',
    components: { ClientLayout },
    data() {
        return {
            reports: [],
            loading: false,
        };
    },
    async mounted() {
        await this.fetchReports();
    },
    methods: {
        async fetchReports() {
            this.loading = true;
            try {
                const response = await axios.get('/client/api/my-reports');
                this.reports = response.data?.data || [];
            } catch (error) {
                console.error('Error fetching reports:', error);
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
.report-list {
    display: grid;
    gap: 14px;
}

.report-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
}

.report-info h3 {
    font-size: 15px;
    color: #0f172a;
    margin-bottom: 4px;
}

.report-info p {
    font-size: 12px;
    color: #64748b;
}

.report-address {
    margin-top: 4px;
}

.report-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    min-width: 120px;
}

.status {
    text-transform: capitalize;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #0f172a;
}

.status.verified {
    background: #d1fae5;
    color: #065f46;
}

.status.pending {
    background: #fef3c7;
    color: #92400e;
}

.status.rejected {
    background: #fee2e2;
    color: #991b1b;
}

.stats {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #64748b;
}

.empty-state {
    padding: 20px;
    color: #64748b;
    text-align: center;
}
</style>
