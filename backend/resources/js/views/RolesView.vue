<template>
    <div class="roles-grid">
        <div class="role-list">
            <h2>Roles</h2>
            <div class="role-card" v-for="role in roles" :key="role.id">
                <div>
                    <p class="role-name">{{ role.name }}</p>
                    <p class="role-key">{{ role.key }}</p>
                    <p class="role-desc">{{ role.description }}</p>
                </div>
                <div class="role-meta">
                    <span class="badge">{{ role.users_count }} users</span>
                    <button @click="editRole(role)">Edit</button>
                    <button class="danger" @click="deleteRole(role)">Delete</button>
                </div>
            </div>
        </div>
        <div class="role-form">
            <h2>{{ editingRole ? 'Update Role' : 'Create Role' }}</h2>
            <form @submit.prevent="saveRole">
                <label>Name</label>
                <input v-model="form.name" required />
                <label>Key</label>
                <input v-model="form.key" required :disabled="!!editingRole" />
                <label>Description</label>
                <textarea v-model="form.description" rows="3"></textarea>
                <label>Permissions (comma separated)</label>
                <input v-model="form.permissions" placeholder="manage_users,view_reports" />
                <label>Color</label>
                <input v-model="form.color" type="color" />
                <div class="form-actions">
                    <button type="submit">{{ editingRole ? 'Update' : 'Create' }}</button>
                    <button type="button" @click="resetForm">Reset</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const roles = ref([]);
const editingRole = ref(null);
const form = reactive({ name: '', key: '', description: '', permissions: '', color: '#34d399' });

const fetchRoles = async () => {
    const { data } = await api.get('/admin/roles');
    roles.value = data;
};

const editRole = (role) => {
    editingRole.value = role;
    form.name = role.name;
    form.key = role.key;
    form.description = role.description;
    form.color = role.color || '#34d399';
    form.permissions = (role.permissions || []).join(',');
};

const resetForm = () => {
    editingRole.value = null;
    form.name = '';
    form.key = '';
    form.description = '';
    form.permissions = '';
    form.color = '#34d399';
};

const saveRole = async () => {
    const payload = {
        name: form.name,
        key: form.key,
        description: form.description,
        color: form.color,
        permissions: form.permissions
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
    };

    if (editingRole.value) {
        await api.put(`/admin/roles/${editingRole.value.id}`, payload);
    } else {
        await api.post('/admin/roles', payload);
    }

    await fetchRoles();
    resetForm();
};

const deleteRole = async (role) => {
    if (!confirm('Delete role?')) return;
    try {
        await api.delete(`/admin/roles/${role.id}`);
        fetchRoles();
    } catch (error) {
        alert(error.response?.data?.message || 'Unable to delete role.');
    }
};

const refreshHandler = () => fetchRoles();

onMounted(() => {
    fetchRoles();
    window.addEventListener('dashboard-refresh', refreshHandler);
});

onBeforeUnmount(() => {
    window.removeEventListener('dashboard-refresh', refreshHandler);
});
</script>

<style scoped>
.roles-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 12px;
}

.role-list,
.role-form {
    background: white;
    border-radius: 24px;
    padding: 16px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.role-card {
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.role-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.role-key {
    margin: 0;
    text-transform: uppercase;
    color: #94a3b8;
    font-size: 12px;
    letter-spacing: 0.3em;
}

.role-desc {
    margin-top: 6px;
    color: #475569;
}

.role-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
}

.badge {
    background: #f1f5f9;
    border-radius: 999px;
    padding: 4px 10px;
    font-weight: 600;
    font-size: 13px;
}

button {
    border: none;
    border-radius: 10px;
    padding: 6px 10px;
    background: #0ea5e9;
    color: white;
    cursor: pointer;
    font-size: 13px;
}

button.danger {
    background: #f97316;
}

.role-form form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

input,
textarea {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 6px 10px;
    font-size: 13px;
}

.form-actions {
    display: flex;
    gap: 8px;
}
</style>
