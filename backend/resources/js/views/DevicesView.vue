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
                    <th>Device Name</th>
                    <th>Model (IMEI)</th>
                    <th>OS</th>
                    <th>App Version</th>
                    <th>Last Active</th>
                    <th>Last Seen</th>
                    <th class="actions-col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="device in devices" :key="device.id" class="clickable-row" @click="openUser(device.user)">
                    <td>{{ device.user?.name }}</td>
                    <td>{{ device.device_name || 'Unknown' }}</td>
                    <td>
                        <span class="imei-text">{{ device.device_model || '—' }}</span>
                        <span v-if="device.imei" class="imei-secondary">{{ device.imei }}</span>
                    </td>
                    <td>{{ device.os_version || '—' }}</td>
                    <td>{{ device.app_version || '—' }}</td>
                    <td>{{ device.last_active_at ? new Date(device.last_active_at).toLocaleString() : '—' }}</td>
                    <td>{{ formatLastSeen(device.last_active_at) }}</td>
                    <td class="actions-cell">
                        <button class="icon-btn" @click.stop="openUser(device.user)" title="View User">
                            <span>👁️</span>
                        </button>
                        <button class="icon-btn delete" @click.stop="deleteDevice(device.id)" title="Delete Device">
                            <span>🗑️</span>
                        </button>
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

const formatLastSeen = (lastActiveAt) => {
    if (!lastActiveAt) return '—';
    
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
};

const deleteDevice = async (id) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    
    try {
        await api.delete(`/admin/devices/${id}`);
        fetchDevices();
    } catch (error) {
        console.error('Error deleting device:', error);
        alert('Failed to delete device');
    }
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
    width: 100px;
}

.actions-cell {
    display: flex;
    gap: 8px;
    align-items: center;
}

.clickable-row {
    cursor: pointer;
}

.icon-btn {
    border: none;
    background: #f1f5f9;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    background: #e2e8f0;
    transform: scale(1.1);
}

.icon-btn.delete {
    background: #fee2e2;
}

.icon-btn.delete:hover {
    background: #fecaca;
}
</style>
