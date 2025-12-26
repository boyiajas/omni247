<template>
    <div class="achievements-grid">
        <div class="list-card">
            <div class="card-head">
                <div>
                    <p class="eyebrow">Gamification</p>
                    <h2>Achievements & Badges</h2>
                </div>
                <button class="ghost" @click="refresh">Refresh</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Criteria</th>
                        <th>Status</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="achievement in achievements" :key="achievement.id">
                        <td>
                            <div class="achievement-name">
                                <span class="icon-preview" :style="{ color: achievement.color }">
                                    <svg viewBox="0 0 24 24">
                                        <path fill="currentColor" :d="iconPaths[achievement.icon] || iconPaths['trophy']" />
                                    </svg>
                                </span>
                                <div>
                                    <p class="name">{{ achievement.name }}</p>
                                    <p class="muted">{{ achievement.description }}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge" :class="achievement.type">
                                {{ achievement.type }}
                            </span>
                        </td>
                        <td>
                            <template v-if="achievement.points_required">
                                {{ achievement.points_required }}+ points
                            </template>
                            <template v-else-if="achievement.criteria">
                                <span class="muted">{{ formatCriteria(achievement.criteria) }}</span>
                            </template>
                            <template v-else>
                                <span class="muted">—</span>
                            </template>
                        </td>
                        <td>
                            <span class="badge" :class="achievement.is_active ? 'active' : 'muted'">
                                {{ achievement.is_active ? 'Active' : 'Hidden' }}
                            </span>
                        </td>
                        <td>
                            <button class="link" @click="startEdit(achievement)">Edit</button>
                            <button class="link danger" @click="remove(achievement)">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="!achievements.length">
                        <td colspan="5" class="muted center">No achievements yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="form-card">
            <h2>{{ editingAchievement ? 'Update achievement' : 'New achievement' }}</h2>
            <form @submit.prevent="save">
                <label>Name</label>
                <input v-model="form.name" required placeholder="First Report" />

                <label>Key (unique identifier)</label>
                <input v-model="form.key" :required="!editingAchievement" placeholder="first_report" />

                <label>Description</label>
                <textarea v-model="form.description" rows="2" placeholder="Submit your first incident report"></textarea>

                <label>Icon</label>
                <select v-model="form.icon">
                    <option v-for="icon in iconOptions" :key="icon.value" :value="icon.value">
                        {{ icon.label }}
                    </option>
                </select>

                <label>Color</label>
                <input v-model="form.color" type="color" />

                <label>Type</label>
                <select v-model="form.type">
                    <option value="activity">Activity</option>
                    <option value="tier">Tier</option>
                    <option value="milestone">Milestone</option>
                </select>

                <div v-if="form.type === 'tier'">
                    <label>Points Required</label>
                    <input v-model.number="form.points_required" type="number" min="0" placeholder="100" />
                </div>

                <div class="checkbox">
                    <label>
                        <input type="checkbox" v-model="form.is_active" /> Active
                    </label>
                </div>

                <div class="actions">
                    <button type="submit">{{ editingAchievement ? 'Update' : 'Create' }}</button>
                    <button type="button" class="ghost" @click="resetForm">Reset</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import api from '@/services/api';

const ICON_CHOICES = [
    { label: 'Trophy', value: 'trophy', path: 'M20 2H4v2l2 2v1c0 2 2 4 4 4v2l-3 5h10l-3-5v-2c2 0 4-2 4-4V6l2-2zM8 8V6h1v2zm7 0V6h1v2z' },
    { label: 'Medal', value: 'medal', path: 'M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 2.05 1.23 3.81 3 4.58V16h4v-2.42c1.77-.77 3-2.53 3-4.58a5 5 0 0 0-5-5m-1 14v2h2v-2zm0 3v2a1 1 0 0 0 1 1a1 1 0 0 0 1-1v-2z' },
    { label: 'Star', value: 'star', path: 'm12 1l3 7l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z' },
    { label: 'Check Circle', value: 'check-circle', path: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m-1 15l-5-5l1.5-1.5L11 14l6.5-6.5L19 9z' },
    { label: 'Check Decagram', value: 'check-decagram', path: 'M12 2l2 4l4 1l-3 3l1 4l-4-2l-4 2l1-4l-3-3l4-1z' },
    { label: 'Flash', value: 'flash', path: 'M7 2v11h3v9l7-12h-4l3-8z' },
    { label: 'Fire', value: 'fire', path: 'M12 2c2 3 1 5-1 7s-3 4-2 7s3 4 5 4s5-3 5-7s-2-6-4-8c0 2-1 3-2 4c0-2-1-5-1-7z' },
    { label: 'Crown', value: 'crown', path: 'M2 3l5 4l5-4l5 4l5-4v15H2zm10 9a2 2 0 1 0-2 2a2 2 0 0 0 2-2z' },
    { label: 'Shield Check', value: 'shield-check', path: 'M12 2l8 4v6c0 5-3.5 9-8 10c-4.5-1-8-5-8-10V6zm-1 14l6-6l-1.5-1.5L11 13l-2.5-2.5L7 12z' },
    { label: 'File Document', value: 'file-document', path: 'M4 2h10l6 6v12H4zm10 8H8v2h6zm0 3H8v2h6z' },
    { label: 'Message Text', value: 'message-text', path: 'M4 4h16v12H7l-3 3zm4 3h8v2H8zm0 3h6v2H8z' },
    { label: 'Ambulance', value: 'ambulance', path: 'M5 12h7l5 3v5H3v-7l2-1zm10-2V5h-3V2h-4v3H5v5zm-3 7a2 2 0 1 0 2 2a2 2 0 0 0-2-2zm-6 0a2 2 0 1 0 2 2a2 2 0 0 0-2-2z' },
    { label: 'Account Group', value: 'account-group', path: 'M12 5a3 3 0 1 0 3 3a3 3 0 0 0-3-3m4 8a3 3 0 1 0 3 3a3 3 0 0 0-3-3M2 16v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2zm14 0v-2a4 4 0 0 1 4-4h2v6z' },
    { label: 'Heart', value: 'heart', path: 'M12 21l-1.5-1.3C5.4 15.4 2 12.3 2 8.5A5.5 5.5 0 0 1 7.5 3c1.7 0 3.4.8 4.5 2A5.5 5.5 0 0 1 22 8.5c0 3.8-3.4 6.9-8.5 11.2z' },
];

const achievements = ref([]);
const editingAchievement = ref(null);

const form = reactive({
    key: '',
    name: '',
    description: '',
    icon: 'trophy',
    color: '#FFD700',
    type: 'activity',
    points_required: null,
    is_active: true,
});

const iconOptions = computed(() => ICON_CHOICES);
const iconPaths = ICON_CHOICES.reduce((acc, icon) => {
    acc[icon.value] = icon.path;
    return acc;
}, {});

const formatCriteria = (criteria) => {
    if (!criteria) return '—';
    const entries = Object.entries(criteria);
    if (!entries.length) return '—';
    return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
};

const fetchAchievements = async () => {
    const { data } = await api.get('/admin/achievements');
    achievements.value = data;
};

const refresh = () => fetchAchievements();

const startEdit = (achievement) => {
    editingAchievement.value = achievement;
    form.key = achievement.key;
    form.name = achievement.name;
    form.description = achievement.description || '';
    form.icon = achievement.icon || 'trophy';
    form.color = achievement.color || '#FFD700';
    form.type = achievement.type || 'activity';
    form.points_required = achievement.points_required;
    form.is_active = !!achievement.is_active;
};

const resetForm = () => {
    editingAchievement.value = null;
    form.key = '';
    form.name = '';
    form.description = '';
    form.icon = 'trophy';
    form.color = '#FFD700';
    form.type = 'activity';
    form.points_required = null;
    form.is_active = true;
};

const save = async () => {
    const payload = { ...form };
    if (editingAchievement.value) {
        await api.put(`/admin/achievements/${editingAchievement.value.id}`, payload);
    } else {
        await api.post('/admin/achievements', payload);
    }
    resetForm();
    fetchAchievements();
};

const remove = async (achievement) => {
    if (!confirm('Delete this achievement? This will remove it from all users.')) return;
    try {
        await api.delete(`/admin/achievements/${achievement.id}`);
        if (editingAchievement.value?.id === achievement.id) {
            resetForm();
        }
        fetchAchievements();
    } catch (error) {
        alert(error.response?.data?.message || 'Unable to delete achievement.');
    }
};

onMounted(fetchAchievements);
</script>

<style scoped>
.achievements-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
}

.list-card,
.form-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.ghost {
    border: 1px solid #e2e8f0;
    background: transparent;
    color: #0f172a;
    border-radius: 10px;
    padding: 8px 12px;
    font-weight: 600;
    cursor: pointer;
}

.eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 12px;
    color: #94a3b8;
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
    width: 140px;
}

.achievement-name {
    display: flex;
    align-items: center;
    gap: 10px;
}

.icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.05);
}

.icon-preview svg {
    width: 20px;
    height: 20px;
}

.name {
    margin: 0;
    font-weight: 600;
}

.muted {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
}

.center {
    text-align: center;
}

.badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
}

.badge.activity {
    background: #dbeafe;
    color: #1e40af;
}

.badge.tier {
    background: #fef3c7;
    color: #92400e;
}

.badge.milestone {
    background: #e0e7ff;
    color: #3730a3;
}

.badge.active {
    background: #dcfce7;
    color: #166534;
}

.badge.muted {
    background: #e2e8f0;
    color: #475569;
}

.link {
    border: none;
    background: none;
    color: #0ea5e9;
    font-weight: 600;
    cursor: pointer;
    padding: 0 6px;
}

.link.danger {
    color: #f97316;
}

.form-card form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

label {
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
}

input,
select,
textarea {
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    font-size: 13px;
}

textarea {
    resize: none;
}

.checkbox {
    display: flex;
    align-items: center;
}

.actions {
    display: flex;
    gap: 8px;
    margin-top: 6px;
}

.actions button {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    background: #2563eb;
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
}

.actions .ghost {
    border: 1px solid #e2e8f0;
    background: transparent;
    color: #0f172a;
}

@media (max-width: 960px) {
    .achievements-grid {
        grid-template-columns: 1fr;
    }
}
</style>
