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
                    <p class="panel-label">Trending now</p>
                    <h3>Highest momentum reports</h3>
                </div>
            </div>
            <div class="chart">
                <div v-for="item in trendingBars" :key="item.id" class="bar">
                    <div class="bar-fill" :style="{ height: item.percent + '%', background: item.color }"></div>
                    <p>{{ item.title }}</p>
                    <span>{{ item.score }}</span>
                </div>
            </div>
            <ul class="reports compact">
                <li v-for="report in trendingReports" :key="report.id">
                    <div class="report-row">
                        <div>
                            <p class="report-title">{{ report.title }}</p>
                            <p class="report-meta">
                                {{ report.category?.name || 'General' }} •
                                {{ report.recent_views_count }} views •
                                {{ report.recent_comments_count }} comments
                            </p>
                        </div>
                        <span class="badge">Hot</span>
                    </div>
                </li>
            </ul>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Trending regions</p>
                <h3>Regions heating up</h3>
            </div>
            <ul class="device-list">
                <li v-for="region in trendingRegions" :key="region.region">
                    <div>
                        <p class="device-type">{{ region.region }}</p>
                        <p class="device-sub">{{ region.total }} reports</p>
                    </div>
                    <span class="badge">{{ region.total }}</span>
                </li>
            </ul>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Category trends</p>
                <h3>Trending by category</h3>
            </div>
            <div class="chart slim">
                <div v-for="item in trendingCategories" :key="item.id" class="bar">
                    <div class="bar-fill" :style="{ height: item.percent + '%', background: item.color }"></div>
                    <p>{{ item.name }}</p>
                    <span>{{ item.count }}</span>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Viewer pulse</p>
                <h3>Views in last 24h</h3>
            </div>
            <div class="sparkline">
                <div v-for="item in viewsByHour" :key="item.hour" class="spark">
                    <div class="spark-bar" :style="{ height: item.percent + '%'}"></div>
                    <span>{{ item.hour }}</span>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Backlog aging</p>
                <h3>Open report exposure</h3>
            </div>
            <div class="chart slim">
                <div v-for="item in backlogBars" :key="item.label" class="bar">
                    <div class="bar-fill" :style="{ height: item.percent + '%', background: item.color }"></div>
                    <p>{{ item.label }}</p>
                    <span>{{ item.count }}</span>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Report quality</p>
                <h3>Verified vs rejected</h3>
            </div>
            <div class="chart slim">
                <div v-for="item in qualityBars" :key="item.label" class="bar">
                    <div class="bar-fill" :style="{ height: item.percent + '%', background: item.color }"></div>
                    <p>{{ item.label }}</p>
                    <span>{{ item.count }}</span>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Response performance</p>
                <h3>Median response times</h3>
            </div>
            <ul class="device-list">
                <li>
                    <div>
                        <p class="device-type">First comment</p>
                        <p class="device-sub">Median in minutes</p>
                    </div>
                    <span class="badge">{{ responsePerformance.median_first_comment_minutes }}</span>
                </li>
                <li>
                    <div>
                        <p class="device-type">Resolution time</p>
                        <p class="device-sub">Median in minutes</p>
                    </div>
                    <span class="badge">{{ responsePerformance.median_resolution_minutes }}</span>
                </li>
            </ul>
        </div>

        <div class="panel">
            <div class="panel-head">
                <p class="panel-label">Top reporters</p>
                <h3>Most active in 30 days</h3>
            </div>
            <ul class="device-list">
                <li v-for="reporter in topReporters" :key="reporter.id">
                    <div>
                        <p class="device-type">{{ reporter.name }}</p>
                        <p class="device-sub">{{ reporter.total }} reports</p>
                    </div>
                    <span class="badge">{{ reporter.total }}</span>
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

const statCards = computed(() => {
    if (!overview.value?.weekly_kpis) return [];
    const kpis = overview.value.weekly_kpis;
    return [
        {
            label: 'Weekly Reports',
            value: kpis.reports,
            trend: 6,
            accent: 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4zM7 7h10v2H7zm0 4h10v2H7zm0 4h6v2H7z"/></svg>',
        },
        {
            label: 'Verification Rate',
            value: `${kpis.verification_rate}%`,
            trend: 4,
            accent: 'linear-gradient(135deg,#34d399,#10b981)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2l-3.5-3.5l1.4-1.4L9 13.4l7.1-7.1l1.4 1.4z"/></svg>',
        },
        {
            label: 'Emergency Rate',
            value: `${kpis.emergency_rate}%`,
            trend: 2,
            accent: 'linear-gradient(135deg,#f97316,#fb923c)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 2L3 20h18L13 2zm0 6l4 8H9z"/></svg>',
        },
        {
            label: 'Weekly Comments',
            value: kpis.comments,
            trend: 9,
            accent: 'linear-gradient(135deg,#c084fc,#a855f7)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v12H7l-3 3z"/></svg>',
        },
        {
            label: 'Weekly Views',
            value: kpis.views,
            trend: 11,
            accent: 'linear-gradient(135deg,#facc15,#f97316)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5c5 0 9 7 9 7s-4 7-9 7s-9-7-9-7s4-7 9-7m0 4a3 3 0 1 0 3 3a3 3 0 0 0-3-3"/></svg>',
        },
        {
            label: 'Avg Resolution (hrs)',
            value: kpis.avg_resolution_hours,
            trend: -3,
            accent: 'linear-gradient(135deg,#94a3b8,#64748b)',
            icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1m1 11h5v2h-7V6h2z"/></svg>',
        },
    ];
});

const trendingReports = computed(() => overview.value?.trending_reports ?? []);
const trendingRegions = computed(() => overview.value?.trending_regions ?? []);
const trendingByCategory = computed(() => overview.value?.trending_by_category ?? []);
const viewsByHourRaw = computed(() => overview.value?.views_by_hour ?? []);
const topReporters = computed(() => overview.value?.top_reporters ?? []);
const reportQuality = computed(() => overview.value?.report_quality ?? null);
const responsePerformance = computed(() => overview.value?.response_performance ?? {
    median_first_comment_minutes: 0,
    median_resolution_minutes: 0,
});

const trendingBars = computed(() => {
    if (!trendingReports.value.length) return [];
    const scores = trendingReports.value.map((report) =>
        (report.recent_comments_count * 3) + report.recent_views_count
    );
    const max = Math.max(...scores, 1);
    return trendingReports.value.map((report, idx) => ({
        id: report.id,
        title: report.title,
        score: (report.recent_comments_count * 3) + report.recent_views_count,
        percent: Math.round(((report.recent_comments_count * 3) + report.recent_views_count) / max * 100),
        color: statusColors[idx % statusColors.length],
    }));
});

const trendingCategories = computed(() => {
    if (!trendingByCategory.value.length) return [];
    const max = Math.max(...trendingByCategory.value.map((item) => item.trending_reports_count), 1);
    return trendingByCategory.value.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color || '#38bdf8',
        count: item.trending_reports_count,
        percent: Math.round((item.trending_reports_count / max) * 100),
    }));
});

const viewsByHour = computed(() => {
    if (!viewsByHourRaw.value.length) return [];
    const max = Math.max(...viewsByHourRaw.value.map((item) => item.total), 1);
    return viewsByHourRaw.value.map((item) => ({
        hour: item.hour,
        total: item.total,
        percent: Math.round((item.total / max) * 100),
    }));
});

const backlogBars = computed(() => {
    const aging = overview.value?.backlog_aging || {};
    const entries = Object.entries(aging).map(([label, count]) => ({ label, count }));
    if (!entries.length) return [];
    const max = Math.max(...entries.map((item) => item.count), 1);
    return entries.map((item, idx) => ({
        ...item,
        percent: Math.round((item.count / max) * 100),
        color: statusColors[idx % statusColors.length],
    }));
});

const qualityBars = computed(() => {
    if (!reportQuality.value) return [];
    return [
        {
            label: 'Verified',
            count: reportQuality.value.verified.count,
            percent: reportQuality.value.verified.percent,
            color: '#22c55e',
        },
        {
            label: 'Rejected',
            count: reportQuality.value.rejected.count,
            percent: reportQuality.value.rejected.percent,
            color: '#ef4444',
        },
    ];
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

.chart.slim {
    height: 180px;
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

.reports {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.reports.compact {
    gap: 12px;
    margin-top: 16px;
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

.report-meta {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.sparkline {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
    align-items: end;
    height: 180px;
}

.spark {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.spark-bar {
    width: 60%;
    background: linear-gradient(180deg, #38bdf8, #0ea5e9);
    border-radius: 12px 12px 6px 6px;
    min-height: 6px;
}

.spark span {
    font-size: 11px;
    color: #94a3b8;
}
</style>
