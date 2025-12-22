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
                    <th>Priority</th>
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
                    <td>{{ report.priority }}</td>
                    <td>{{ report.user?.name }}</td>
                    <td>{{ new Date(report.created_at).toLocaleString() }}</td>
                    <td>
                        <button class="link-btn" @click.stop="openReport(report)">Review</button>
                    </td>
                </tr>
                <tr v-if="!reports.length">
                    <td colspan="8" class="empty">No reports found.</td>
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
const filters = reactive({ status: '', search: '' });
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

const openReport = (report) => {
    router.push({ name: 'report-detail', params: { id: report.id } });
};

onMounted(() => {
    fetchReports();
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
