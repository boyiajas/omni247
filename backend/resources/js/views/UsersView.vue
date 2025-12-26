<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Workforce</p>
                <h2>User directory</h2>
            </div>
            <div class="filters">
                <select v-model="filters.role" @change="fetchUsers()">
                    <option value="">All roles</option>
                    <option v-for="role in roles" :key="role.id" :value="role.key">{{ role.name }}</option>
                </select>
                <input type="search" placeholder="Search" v-model="filters.search" @input="debouncedSearch" />
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Reports</th>
                    <th>Points</th>
                    <th>Achievements</th>
                    <th>Devices</th>
                    <th>Last Active</th>
                    <th>Location</th>
                    <th class="actions-col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id" class="clickable-row" @click="openUser(user)">
                    <td>
                        <div class="user">
                            <div class="avatar">{{ initials(user.name) }}</div>
                            <div>
                                <p class="user-name">{{ user.name }}</p>
                                <p class="user-meta">{{ user.email }}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <select v-model="user.role_id" @click.stop @change="updateRole(user)">
                            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                        </select>
                    </td>
                    <td>
                        <select v-model="user.status" @click.stop @change="updateStatus(user)">
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                        </select>
                    </td>
                    <td>{{ user.reports_count }}</td>
                    <td>
                        <span class="points-badge">{{ user.total_points || 0 }} pts</span>
                    </td>
                    <td>
                        <div class="achievements-cell">
                            <span class="achievement-badge">
                                <svg viewBox="0 0 24 24" width="14" height="14">
                                    <path fill="currentColor" d="M20 2H4v2l2 2v1c0 2 2 4 4 4v2l-3 5h10l-3-5v-2c2 0 4-2 4-4V6l2-2z"/>
                                </svg>
                                {{ user.achievements_count || 0 }}
                            </span>
                        </div>
                    </td>
                    <td>{{ user.devices_count }}</td>
                    <td>{{ user.last_active_at ? new Date(user.last_active_at).toLocaleString() : '—' }}</td>
                    <td>{{ formatLocation(user) }}</td>
                    <td>
                        <button class="link-btn" @click.stop="openUser(user)">Manage</button>
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

const users = ref([]);
const roles = ref([]);
const filters = reactive({ search: '', role: '' });
let searchTimer;
const router = useRouter();

const fetchUsers = async () => {
    const { data } = await api.get('/admin/users', { params: filters });
    users.value = data.data;
};

const fetchRoles = async () => {
    const { data } = await api.get('/admin/roles');
    roles.value = data;
};

const updateStatus = async (user) => {
    try {
        await api.post(`/admin/users/${user.id}/status`, { status: user.status });
    } catch (error) {
        alert('Unable to update status');
    }
};

const updateRole = async (user) => {
    try {
        await api.post(`/admin/users/${user.id}/role`, { role_id: user.role_id });
    } catch (error) {
        alert('Unable to update role');
    }
};

const openUser = (user) => {
    router.push({ name: 'user-detail', params: { id: user.id } });
};

const formatLocation = (user) => user.location_summary || '—';

const initials = (name = '') =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const debouncedSearch = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchUsers(), 300);
};

const refreshHandler = () => fetchUsers();

onMounted(() => {
    fetchRoles();
    fetchUsers();
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
    padding: 10px 8px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-size: 13px;
}

.actions-col {
    width: 100px;
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

.user {
    display: flex;
    align-items: center;
    gap: 8px;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: linear-gradient(135deg, #34d399, #10b981);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
}

.user-name {
    margin: 0;
    font-weight: 600;
}

.user-meta {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
}

.points-badge {
    display: inline-block;
    padding: 4px 8px;
    background: #fef3c7;
    color: #92400e;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.achievements-cell {
    display: flex;
    align-items: center;
}

.achievement-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.achievement-badge svg {
    flex-shrink: 0;
}
</style>
