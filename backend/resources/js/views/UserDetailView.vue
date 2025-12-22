<template>
    <div v-if="user" class="detail-grid">
        <div class="panel">
            <button class="link-btn" @click="goBack">← Back to users</button>
            <div class="header">
                <div>
                    <p class="eyebrow">User #{{ user.id }}</p>
                    <h2>{{ user.name }}</h2>
                    <p class="muted">{{ user.email }}</p>
                </div>
                <span class="badge" :class="user.status">{{ user.status }}</span>
            </div>

            <form class="form" @submit.prevent="saveProfile">
                <label>Name</label>
                <input v-model="form.name" required />

                <label>Email</label>
                <input v-model="form.email" type="email" required />

                <label>Phone</label>
                <input v-model="form.phone" />

                <button type="submit" :disabled="saving">
                    {{ saving ? 'Saving...' : 'Save Profile' }}
                </button>
            </form>

            <div class="inline-controls">
                <div>
                    <label>Status</label>
                    <select v-model="form.status" @change="updateStatus">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div>
                    <label>Role</label>
                    <select v-model="form.role_id" @change="updateRole">
                        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="panel">
            <h3>Stats</h3>
            <div class="stats">
                <div>
                    <p class="stat-label">Reports</p>
                    <p class="stat-value">{{ user.total_reports }}</p>
                </div>
                <div>
                    <p class="stat-label">Reputation</p>
                    <p class="stat-value">{{ user.reputation_score }}</p>
                </div>
                <div>
                    <p class="stat-label">Points</p>
                    <p class="stat-value">{{ user.total_points }}</p>
                </div>
                <div>
                    <p class="stat-label">Role</p>
                    <p class="stat-value">{{ user.role }}</p>
                </div>
            </div>
        </div>

        <div class="panel">
            <h3>Devices</h3>
            <ul class="list">
                <li v-for="device in user.devices" :key="device.id">
                    <p class="list-title">{{ device.device_name || device.device_type }}</p>
                    <p class="muted">
                        {{ device.app_version || 'Unknown version' }} • {{ device.last_active_at ? new Date(device.last_active_at).toLocaleString() : 'No activity' }}
                    </p>
                </li>
                <li v-if="!user.devices?.length" class="muted">No devices registered.</li>
            </ul>
        </div>

        <div class="panel">
            <h3>Recent Reports</h3>
            <ul class="list">
                <li v-for="report in user.reports" :key="report.id" @click="goToReport(report.id)" class="clickable-row">
                    <p class="list-title">{{ report.title }}</p>
                    <p class="muted">{{ new Date(report.created_at).toLocaleString() }}</p>
                </li>
                <li v-if="!user.reports?.length" class="muted">No reports submitted.</li>
            </ul>
        </div>
    </div>
    <div v-else class="panel">Loading user...</div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const roles = ref([]);
const saving = ref(false);
const form = reactive({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    role_id: null,
});

const fetchUser = async () => {
    const { data } = await api.get(`/admin/users/${route.params.id}`);
    user.value = data;
    form.name = data.name;
    form.email = data.email;
    form.phone = data.phone;
    form.status = data.status;
    form.role_id = data.role_id;
};

const fetchRoles = async () => {
    const { data } = await api.get('/admin/roles');
    roles.value = data;
};

const saveProfile = async () => {
    saving.value = true;
    await api.put(`/admin/users/${route.params.id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
    });
    saving.value = false;
    fetchUser();
};

const updateStatus = async () => {
    await api.post(`/admin/users/${route.params.id}/status`, { status: form.status });
    fetchUser();
};

const updateRole = async () => {
    if (!form.role_id) return;
    await api.post(`/admin/users/${route.params.id}/role`, { role_id: form.role_id });
    fetchUser();
};

const goBack = () => {
    router.push({ name: 'users' });
};

const goToReport = (id) => {
    router.push({ name: 'report-detail', params: { id } });
};

onMounted(() => {
    fetchRoles();
    fetchUser();
});
</script>

<style scoped>
.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
}

.panel {
    background: white;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.link-btn {
    border: none;
    background: none;
    color: #0ea5e9;
    font-weight: 600;
    cursor: pointer;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
}

.muted {
    color: #94a3b8;
    margin: 4px 0;
}

.badge {
    padding: 6px 12px;
    border-radius: 999px;
    text-transform: capitalize;
}

.badge.active {
    background: #dcfce7;
    color: #166534;
}

.badge.suspended {
    background: #fee2e2;
    color: #b91c1c;
}

.badge.pending {
    background: #fef3c7;
    color: #b45309;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
}

label {
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
}

input,
select {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
}

button[type='submit'] {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #22c55e, #0ea5e9);
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
}

.inline-controls {
    display: flex;
    gap: 12px;
    margin-top: 12px;
}

.inline-controls > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.stat-label {
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
}

.stat-value {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.list-title {
    margin: 0;
    font-weight: 600;
}

.clickable-row {
    padding: 10px;
    border-radius: 12px;
    background: #f8fafc;
    cursor: pointer;
}

.clickable-row:hover {
    background: #eef2ff;
}
</style>
