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
            <h3>Auto-verification</h3>
            <div class="form">
                <label class="toggle">
                    <input type="checkbox" v-model="form.auto_verify_enabled" />
                    <span>Enable auto-verification for this user</span>
                </label>

                <label>
                    Verification tier
                    <select v-model="form.auto_verify_tier">
                        <option v-for="(tier, key) in verificationConfig.tiers" :key="key" :value="key">
                            {{ tier.label }}
                        </option>
                    </select>
                </label>

                <div class="level-grid">
                    <label v-for="(level, key) in verificationConfig.levels" :key="key" class="level-chip">
                        <input type="checkbox" :value="key" v-model="form.auto_verify_levels" />
                        <span>{{ level.label }}</span>
                        <small>{{ level.max_score }} pts</small>
                    </label>
                </div>

                <button type="button" class="primary-btn" @click="saveVerification" :disabled="savingVerification">
                    {{ savingVerification ? 'Saving...' : 'Save verification settings' }}
                </button>
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
            <h3>Achievements ({{ user.achievements?.length || 0 }})</h3>
            <div class="achievements-grid">
                <div v-for="achievement in user.achievements" :key="achievement.id" class="achievement-card">
                    <div class="achievement-icon" :style="{ background: achievement.color }">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="white" :d="getIconPath(achievement.icon)" />
                        </svg>
                    </div>
                    <div>
                        <p class="achievement-name">{{ achievement.name }}</p>
                        <p class="achievement-desc">{{ achievement.description }}</p>
                        <p class="achievement-date">Earned {{ formatDate(achievement.pivot.earned_at) }}</p>
                    </div>
                </div>
                <p v-if="!user.achievements?.length" class="muted">No achievements earned yet.</p>
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

const ICON_PATHS = {
    'trophy': 'M20 2H4v2l2 2v1c0 2 2 4 4 4v2l-3 5h10l-3-5v-2c2 0 4-2 4-4V6l2-2z',
    'medal': 'M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 2.05 1.23 3.81 3 4.58V16h4v-2.42c1.77-.77 3-2.53 3-4.58a5 5 0 0 0-5-5m-1 14v2h2v-2zm0 3v2a1 1 0 0 0 1 1a1 1 0 0 0 1-1v-2z',
    'star': 'm12 1l3 7l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z',
    'check-decagram': 'M12 2l2 4l4 1l-3 3l1 4l-4-2l-4 2l1-4l-3-3l4-1z',
    'ambulance': 'M5 12h7l5 3v5H3v-7l2-1zm10-2V5h-3V2h-4v3H5v5zm-3 7a2 2 0 1 0 2 2a2 2 0 0 0-2-2zm-6 0a2 2 0 1 0 2 2a2 2 0 0 0-2-2z',
    'account-group': 'M12 5a3 3 0 1 0 3 3a3 3 0 0 0-3-3m4 8a3 3 0 1 0 3 3a3 3 0 0 0-3-3M2 16v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2zm14 0v-2a4 4 0 0 1 4-4h2v6z',
};

const route = useRoute();
const router = useRouter();
const user = ref(null);
const roles = ref([]);
const saving = ref(false);
const savingVerification = ref(false);
const verificationConfig = reactive({
    levels: {},
    tiers: {},
});
const form = reactive({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    role_id: null,
    auto_verify_enabled: false,
    auto_verify_tier: 'basic',
    auto_verify_levels: [],
});

const fetchUser = async () => {
    const { data } = await api.get(`/admin/users/${route.params.id}`);
    user.value = data;
    form.name = data.name;
    form.email = data.email;
    form.phone = data.phone;
    form.status = data.status;
    form.role_id = data.role_id;
    form.auto_verify_enabled = !!data.auto_verify_enabled;
    form.auto_verify_tier = data.auto_verify_tier || 'basic';
    form.auto_verify_levels = Array.isArray(data.auto_verify_levels) ? data.auto_verify_levels : [];
};

const fetchVerificationConfig = async () => {
    const { data } = await api.get('/admin/report-verification');
    verificationConfig.levels = data.levels || {};
    verificationConfig.tiers = data.tiers || {};
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

const saveVerification = async () => {
    savingVerification.value = true;
    await api.put(`/admin/users/${route.params.id}`, {
        auto_verify_enabled: form.auto_verify_enabled,
        auto_verify_tier: form.auto_verify_tier,
        auto_verify_levels: form.auto_verify_levels,
    });
    savingVerification.value = false;
    fetchUser();
};

const goBack = () => {
    router.push({ name: 'users' });
};

const goToReport = (id) => {
    router.push({ name: 'report-detail', params: { id } });
};

const getIconPath = (icon) => {
    return ICON_PATHS[icon] || ICON_PATHS['trophy'];
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

onMounted(() => {
    fetchRoles();
    fetchVerificationConfig();
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

.toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
}

.level-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0 18px;
}

.level-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 12px;
}

.level-chip small {
    color: #64748b;
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

.primary-btn {
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

.achievements-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.achievement-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
}

.achievement-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.achievement-name {
    margin: 0;
    font-weight: 600;
    font-size: 14px;
}

.achievement-desc {
    margin: 2px 0;
    font-size: 13px;
    color: #64748b;
}

.achievement-date {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
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
