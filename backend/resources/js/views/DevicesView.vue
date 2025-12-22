<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Device health</p>
                <h2>Registered devices</h2>
            </div>
            <select v-model="filters.device_type" @change="fetchDevices()">
                <option value="">All types</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
            </select>
        </div>

        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Device</th>
                    <th>OS</th>
                    <th>App Version</th>
                    <th>Last Active</th>
                    <th class="actions-col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="device in devices" :key="device.id" class="clickable-row" @click="openUser(device.user)">
                    <td>{{ device.user?.name }}</td>
                    <td>{{ device.device_name || device.device_type || 'Unknown' }}</td>
                    <td>{{ device.os_version || '—' }}</td>
                    <td>{{ device.app_version || '—' }}</td>
                    <td>{{ device.last_active_at ? new Date(device.last_active_at).toLocaleString() : '—' }}</td>
                    <td>
                        <button class="link-btn" @click.stop="openUser(device.user)">View User</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const devices = ref([]);
const filters = reactive({ device_type: '' });
const router = useRouter();

const fetchDevices = async () => {
    const { data } = await api.get('/admin/devices', { params: filters });
    devices.value = data.data;
};

const openUser = (user) => {
    if (!user) return;
    router.push({ name: 'user-detail', params: { id: user.id } });
};

const refreshHandler = () => fetchDevices();

onMounted(() => {
    fetchDevices();
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
</style>
