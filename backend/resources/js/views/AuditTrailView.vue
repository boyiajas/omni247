<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Compliance</p>
                <h2>Audit Trail</h2>
            </div>
            <select v-model="filters.action" @change="fetchAudits()">
                <option value="">All actions</option>
                <option value="admin.login">Logins</option>
                <option value="admin.users.update">User updates</option>
                <option value="admin.reports.moderate">Moderation</option>
            </select>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="audit in audits" :key="audit.id">
                    <td>{{ audit.action }}</td>
                    <td>{{ audit.description }}</td>
                    <td>{{ audit.user?.name || 'System' }}</td>
                    <td>{{ new Date(audit.created_at).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>

        <div class="pagination" v-if="meta.total">
            <button :disabled="meta.current_page === 1" @click="fetchAudits(meta.current_page - 1)">Prev</button>
            <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button :disabled="meta.current_page === meta.last_page" @click="fetchAudits(meta.current_page + 1)">Next</button>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const audits = ref([]);
const meta = reactive({ current_page: 1, last_page: 1, total: 0 });
const filters = reactive({ action: '' });

const fetchAudits = async (page = 1) => {
    const { data } = await api.get('/admin/audits', { params: { ...filters, page } });
    audits.value = data.data;
    Object.assign(meta, {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
    });
};

const refreshHandler = () => fetchAudits(meta.current_page);

onMounted(() => {
    fetchAudits();
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

select {
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

.pagination {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
}

.pagination button {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    background: #0ea5e9;
    color: white;
    cursor: pointer;
    font-size: 13px;
}
</style>
