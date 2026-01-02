<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Incident queue</p>
                <h2>Reports</h2>
            </div>
            <div class="filters">
                <select v-model="filters.status" @change="fetchReports()">
                    <option value="">All status</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="verified">Verified</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select v-model="filters.verification_status" @change="fetchReports()">
                    <option value="">Auto-verify: All</option>
                    <option value="none">Auto-verify: Not run</option>
                    <option value="processing">Auto-verify: Processing</option>
                    <option value="pending">Auto-verify: Pending</option>
                    <option value="verified">Auto-verify: Verified</option>
                    <option value="rejected">Auto-verify: Rejected</option>
                    <option value="disabled">Auto-verify: Disabled</option>
                    <option value="failed">Auto-verify: Failed</option>
                    <option value="skipped">Auto-verify: Skipped</option>
                </select>
                <select v-model="filters.verification_tier" @change="fetchReports()">
                    <option value="">Auto-verify: All tiers</option>
                    <option v-for="(tier, key) in verificationTiers" :key="key" :value="key">
                        Auto-verify: {{ tier.label }}
                    </option>
                </select>
                <input type="search" placeholder="Search reports" v-model="filters.search" @input="debouncedSearch" />
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Auto-Verify</th>
                    <th>Priority</th>
                    <th>Submitter Distance</th>
                    <th>Reporter</th>
                    <th>Created</th>
                    <th class="actions-col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="report in reports" :key="report.id" class="clickable-row" @click="openReport(report)">
                    <td>#{{ report.id }}</td>
                    <td>{{ report.title }}</td>
                    <td>{{ report.category?.name }}</td>
                    <td><span class="badge" :class="report.status">{{ report.status }}</span></td>
                    <td>{{ formatVerification(report) }}</td>
                    <td>{{ report.priority }}</td>
                    <td>{{ formatDistance(report) }}</td>
                    <td>{{ report.user?.name }}</td>
                    <td>{{ new Date(report.created_at).toLocaleString() }}</td>
                    <td>
                        <button class="link-btn" @click.stop="openReport(report)">Review</button>
                    </td>
                </tr>
                <tr v-if="!reports.length">
                    <td colspan="10" class="empty">No reports found.</td>
                </tr>
            </tbody>
        </table>

        <div class="pagination" v-if="meta.total">
            <button :disabled="meta.current_page === 1" @click="fetchReports(meta.current_page - 1)">Prev</button>
            <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button :disabled="meta.current_page === meta.last_page" @click="fetchReports(meta.current_page + 1)">Next</button>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const reports = ref([]);
const meta = reactive({ current_page: 1, last_page: 1, total: 0 });
const filters = reactive({
    status: '',
    search: '',
    verification_status: '',
    verification_tier: '',
});
const verificationTiers = ref({});
let searchTimer;
const router = useRouter();

const fetchReports = async (page = 1) => {
    const { data } = await api.get('/admin/reports', {
        params: {
            page,
            ...filters,
        },
    });
    reports.value = data.data;
    Object.assign(meta, {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
    });
};

const debouncedSearch = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchReports(), 300);
};

const refreshHandler = () => fetchReports(meta.current_page);

const fetchVerificationConfig = async () => {
    try {
        const { data } = await api.get('/admin/report-verification');
        verificationTiers.value = data.tiers || {};
    } catch (error) {
        verificationTiers.value = {};
    }
};

const openReport = (report) => {
    router.push({ name: 'report-detail', params: { id: report.id } });
};

const formatDistance = (report) => {
    const lat = Number(report.latitude);
    const lng = Number(report.longitude);
    const subLat = Number(report.submitter_latitude);
    const subLng = Number(report.submitter_longitude);

    if (
        Number.isNaN(lat)
        || Number.isNaN(lng)
        || Number.isNaN(subLat)
        || Number.isNaN(subLng)
    ) {
        return '0.00 km';
    }

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(subLat - lat);
    const dLng = toRad(subLng - lng);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(lat)) * Math.cos(toRad(subLat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return `${distance.toFixed(2)} km`;
};

const formatVerification = (report) => {
    if (!report.verification_status) {
        return 'N/A';
    }

    const score = report.verification_score ?? 0;
    return `${report.verification_status} (${score})`;
};

onMounted(() => {
    fetchReports();
    fetchVerificationConfig();
    window.addEventListener('dashboard-refresh', refreshHandler);
});

onBeforeUnmount(() => {
    window.removeEventListener('dashboard-refresh', refreshHandler);
});
</script>

<style scoped>
.card {
    background: white;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.filters {
    display: flex;
    gap: 8px;
}

select,
input[type='search'] {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-size: 13px;
}

.actions-col {
    width: 120px;
}

.clickable-row {
    cursor: pointer;
}

.clickable-row:hover {
    background: #f8fafc;
}

.link-btn {
    border: none;
    background: none;
    color: #0ea5e9;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
}

th {
    text-transform: uppercase;
    font-size: 12px;
    color: #94a3b8;
}

.badge {
    padding: 6px 12px;
    border-radius: 999px;
    text-transform: capitalize;
}

.badge.pending {
    background: #fef3c7;
    color: #b45309;
}

.badge.verified {
    background: #dcfce7;
    color: #15803d;
}

.badge.resolved {
    background: #dbeafe;
    color: #1d4ed8;
}

.badge.rejected {
    background: #fee2e2;
    color: #b91c1c;
}

.empty {
    text-align: center;
    padding: 40px 0;
    color: #94a3b8;
}

.pagination {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination button {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    background: #0ea5e9;
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
}
</style>
