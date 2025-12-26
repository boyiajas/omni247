<template>
    <div class="settings-grid">
        <div class="list-card">
            <div class="card-head">
                <div>
                    <p class="eyebrow">Configuration</p>
                    <h2>System Settings</h2>
                </div>
                <button class="ghost" @click="refresh">Refresh</button>
            </div>

            <!-- Filter by group -->
            <div class="filter-tabs">
                <button
                    v-for="group in groups"
                    :key="group.value"
                    :class="{ active: selectedGroup === group.value }"
                    @click="selectedGroup = group.value"
                >
                    {{ group.label }}
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Setting</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="setting in filteredSettings" :key="setting.id">
                        <td>
                            <p class="name">{{ formatKey(setting.key) }}</p>
                            <p class="muted">{{ setting.description || '—' }}</p>
                        </td>
                        <td>
                            <span v-if="setting.type === 'boolean'" class="badge" :class="setting.value ? 'active' : 'muted'">
                                {{ setting.value ? 'Enabled' : 'Disabled' }}
                            </span>
                            <span v-else class="value-text">{{ displayValue(setting) }}</span>
                        </td>
                        <td>
                            <span class="badge type-badge">{{ setting.type }}</span>
                        </td>
                        <td>
                            <button class="link" @click="startEdit(setting)">Edit</button>
                            <button class="link danger" @click="remove(setting)">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="!filteredSettings.length">
                        <td colspan="4" class="muted center">No settings in this group.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="form-card">
            <h2>{{ editingSetting ? 'Update setting' : 'New setting' }}</h2>
            <form @submit.prevent="save">
                <label>Key</label>
                <input
                    v-model="form.key"
                    required
                    placeholder="setting_key"
                    :disabled="!!editingSetting"
                />

                <label>Group</label>
                <select v-model="form.group" required>
                    <option v-for="group in groups" :key="group.value" :value="group.value">
                        {{ group.label }}
                    </option>
                </select>

                <label>Type</label>
                <select v-model="form.type" required>
                    <option value="string">String</option>
                    <option value="boolean">Boolean</option>
                    <option value="number">Number</option>
                    <option value="json">JSON</option>
                </select>

                <label>Value</label>
                <div v-if="form.type === 'boolean'" class="checkbox">
                    <label>
                        <input type="checkbox" v-model="form.booleanValue" />
                        Enabled
                    </label>
                </div>
                <input
                    v-else-if="form.type === 'number'"
                    v-model.number="form.value"
                    type="number"
                    placeholder="0"
                />
                <textarea
                    v-else-if="form.type === 'json'"
                    v-model="form.value"
                    rows="4"
                    placeholder='{"key": "value"}'
                ></textarea>
                <input
                    v-else
                    v-model="form.value"
                    placeholder="Setting value"
                />

                <label>Description</label>
                <textarea
                    v-model="form.description"
                    rows="2"
                    placeholder="Brief description of this setting"
                ></textarea>

                <div class="actions">
                    <button type="submit">{{ editingSetting ? 'Update' : 'Create' }}</button>
                    <button type="button" class="ghost" @click="resetForm">Reset</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const groups = [
    { label: 'All', value: 'all' },
    { label: 'General', value: 'general' },
    { label: 'Notifications', value: 'notifications' },
    { label: 'Reports', value: 'reports' },
    { label: 'System', value: 'system' },
];

const settings = ref([]);
const selectedGroup = ref('all');
const editingSetting = ref(null);

const form = reactive({
    key: '',
    value: '',
    booleanValue: false,
    type: 'string',
    group: 'general',
    description: '',
});

const filteredSettings = computed(() => {
    if (selectedGroup.value === 'all') {
        return settings.value;
    }
    return settings.value.filter(s => s.group === selectedGroup.value);
});

const formatKey = (key) => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const displayValue = (setting) => {
    if (setting.type === 'json') {
        return JSON.stringify(setting.value);
    }
    return setting.value || '—';
};

const fetchSettings = async () => {
    const { data } = await api.get('/admin/settings');
    settings.value = data;
};

const refresh = () => fetchSettings();

const startEdit = (setting) => {
    editingSetting.value = setting;
    form.key = setting.key;
    form.type = setting.type;
    form.group = setting.group;
    form.description = setting.description || '';

    if (setting.type === 'boolean') {
        form.booleanValue = !!setting.value;
        form.value = '';
    } else if (setting.type === 'json') {
        form.value = JSON.stringify(setting.value, null, 2);
        form.booleanValue = false;
    } else {
        form.value = setting.value || '';
        form.booleanValue = false;
    }
};

const resetForm = () => {
    editingSetting.value = null;
    form.key = '';
    form.value = '';
    form.booleanValue = false;
    form.type = 'string';
    form.group = 'general';
    form.description = '';
};

const save = async () => {
    const payload = {
        type: form.type,
        group: form.group,
        description: form.description,
    };

    // Handle value based on type
    if (form.type === 'boolean') {
        payload.value = form.booleanValue ? '1' : '0';
    } else if (form.type === 'json') {
        try {
            JSON.parse(form.value); // Validate JSON
            payload.value = form.value;
        } catch (error) {
            alert('Invalid JSON format');
            return;
        }
    } else {
        payload.value = form.value;
    }

    try {
        if (editingSetting.value) {
            await api.put(`/admin/settings/${editingSetting.value.key}`, payload);
        } else {
            payload.key = form.key;
            await api.post('/admin/settings', payload);
        }
        resetForm();
        fetchSettings();
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to save setting');
    }
};

const remove = async (setting) => {
    if (!confirm(`Delete setting "${formatKey(setting.key)}"?`)) return;
    try {
        await api.delete(`/admin/settings/${setting.key}`);
        if (editingSetting.value?.id === setting.id) {
            resetForm();
        }
        fetchSettings();
    } catch (error) {
        alert(error.response?.data?.message || 'Unable to delete setting.');
    }
};

onMounted(fetchSettings);
</script>

<style scoped>
.settings-grid {
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

.filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.filter-tabs button {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-tabs button:hover {
    background: #f1f5f9;
}

.filter-tabs button.active {
    background: linear-gradient(135deg, #34d399, #10b981);
    color: #041026;
    border-color: transparent;
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

.value-text {
    font-family: 'Courier New', monospace;
    color: #475569;
    font-size: 12px;
}

.badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.badge.active {
    background: #dcfce7;
    color: #166534;
}

.badge.muted {
    background: #e2e8f0;
    color: #475569;
}

.type-badge {
    background: #dbeafe;
    color: #1e40af;
    text-transform: capitalize;
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
    margin-top: 4px;
}

input,
select,
textarea {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
}

input:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
}

textarea {
    resize: vertical;
    font-family: 'Courier New', monospace;
}

.checkbox {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.checkbox label {
    text-transform: none;
    font-size: 14px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
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
    .settings-grid {
        grid-template-columns: 1fr;
    }
}
</style>
