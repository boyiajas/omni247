<template>
    <div class="grid">
        <div class="stats">
            <StatCard
                v-for="card in statCards"
                :key="card.label"
                :label="card.label"
                :value="card.value"
                :trend="card.trend"
                :accent="card.accent"
            >
                <template #icon>
                    <span v-html="card.icon"></span>
                </template>
            </StatCard>
        </div>

        <div class="panel wide">
            <div class="panel-head">
                <div>
                    <p class="panel-label">Status overview</p>
                    <h3>Incident workflow</h3>
                </div>
            </div>
            <div class="chart">
                <div v-for="item in statusBreakdown" :key="item.label" class="bar">
                    <div class="bar-fill" :style="{ height: item.percent + '%', background: item.color }"></div>
                    <p>{{ item.label }}</p>
                    <span>{{ item.count }}</span>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Device mix</p>
                <h3>Active installations</h3>
            </div>
            <ul class="device-list">
                <li v-for="device in deviceStats" :key="device.device_type">
                    <div>
                        <p class="device-type">{{ device.device_type ?? 'Unknown' }}</p>
                        <p class="device-sub">{{ device.total }} devices</p>
                    </div>
                    <span class="badge">{{ device.percent }}%</span>
                </li>
            </ul>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Recent reports</p>
                <h3>Live feed</h3>
            </div>
            <ul class="reports">
                <li v-for="report in recentReports" :key="report.id">
                    <div class="report-row">
                        <div>
                            <p class="report-title">{{ report.title }}</p>
                            <p class="report-meta">{{ report.category?.name }} • {{ formatTime(report.created_at) }}</p>
                        </div>
                        <span class="status" :class="report.status">{{ report.status }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Audit trail</p>
                <h3>Latest actions</h3>
            </div>
            <ul class="audit">
                <li v-for="item in auditFeed" :key="item.id">
                    <p class="audit-desc">{{ item.description }}</p>
                    <p class="audit-meta">{{ item.user?.name || 'System' }} • {{ formatTime(item.created_at) }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import api from '@/services/api';
import StatCard from '@/components/ui/StatCard.vue';

const overview = ref(null);
const loading = ref(true);
const statusColors = ['#22c55e', '#0ea5e9', '#f97316', '#eab308', '#f43f5e'];

const fetchOverview = async () => {
    loading.value = true;
    try {
        const { data } = await api.get('/admin/overview');
        overview.value = data;
    } finally {
        loading.value = false;
    }
};

const formatTime = (value) => new Date(value).toLocaleString();

const statCards = computed(() => {
    if (!overview.value) return [];
    return [
        {
            label: 'Total Reports',
            value: overview.value.summary.total_reports,
            trend: 15,
            accent: 'linear-gradient(135deg,#34d399,#10b981)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 5v14l7-3l7 3V5H5z"/></svg>',
        },
        {
            label: 'Active Users',
            value: overview.value.summary.active_users,
            trend: 8,
            accent: 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1Z"/></svg>',
        },
        {
            label: 'Agency Accounts',
            value: overview.value.summary.agency_accounts,
            trend: 3,
            accent: 'linear-gradient(135deg,#c084fc,#a855f7)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m17 3l-1.8 3H8.8L7 3H2l5 9l-5 9h5l1.8-3h6.4L17 21h5l-5-9l5-9z"/></svg>',
        },
        {
            label: 'Reward Points',
            value: overview.value.summary.reward_points,
            trend: 21,
            accent: 'linear-gradient(135deg,#f97316,#fb923c)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 2l2.4 7.1h7.5l-6.1 4.4l2.4 7.2L12 16.4l-6.2 4.3l2.4-7.2L2 9.1h7.5z"/></svg>',
        },
    ];
});

const statusBreakdown = computed(() => {
    if (!overview.value) return [];
    const total = overview.value.reports_by_status.reduce((sum, item) => sum + item.total, 0) || 1;
    return overview.value.reports_by_status.map((item, idx) => ({
        label: item.status,
        count: item.total,
        percent: Math.round((item.total / total) * 100),
        color: statusColors[idx % statusColors.length],
    }));
});

const recentReports = computed(() => overview.value?.recent_reports ?? []);
const auditFeed = computed(() => overview.value?.audit_feed ?? []);

const deviceStats = computed(() => {
    if (!overview.value) return [];
    const total = overview.value.device_stats.reduce((sum, d) => sum + d.total, 0) || 1;
    return overview.value.device_stats.map((device) => ({
        ...device,
        percent: Math.round((device.total / total) * 100),
    }));
});

onMounted(() => {
    fetchOverview();
    window.addEventListener('dashboard-refresh', fetchOverview);
});

onBeforeUnmount(() => {
    window.removeEventListener('dashboard-refresh', fetchOverview);
});
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
}

.stats {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
}

.panel {
    background: white;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.panel.wide {
    grid-column: span 2;
}

.panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.panel-label {
    margin: 0;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.3em;
    color: #94a3b8;
}

h3 {
    margin: 4px 0 0;
    color: #0f172a;
}

.chart {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    height: 220px;
}

.bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.bar-fill {
    width: 60%;
    border-radius: 16px 16px 8px 8px;
    transition: height 0.3s ease;
    min-height: 8px;
}

.bar p {
    margin: 0;
    font-weight: 600;
    text-transform: capitalize;
}

.bar span {
    font-size: 13px;
    color: #94a3b8;
}

.device-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.device-type {
    margin: 0;
    font-weight: 600;
    text-transform: capitalize;
}

.device-sub {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
}

.reports,
.audit {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.report-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.report-title {
    margin: 0;
    font-weight: 600;
}

.report-meta,
.audit-meta {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.status {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    text-transform: capitalize;
}

.status.pending {
    background: #fef3c7;
    color: #b45309;
}

.status.verified {
    background: #dcfce7;
    color: #15803d;
}

.status.resolved {
    background: #dbeafe;
    color: #1d4ed8;
}

.audit-desc {
    margin: 0 0 4px;
    font-weight: 600;
}
</style>
