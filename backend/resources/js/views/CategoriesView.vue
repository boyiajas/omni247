<template>
    <div class="categories-grid">
        <div class="list-card">
            <div class="card-head">
                <div>
                    <p class="eyebrow">Taxonomy</p>
                    <h2>Report categories</h2>
                </div>
                <button class="ghost" @click="refresh">Refresh</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Icon</th>
                        <th>Status</th>
                        <th>Emergency</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="category in categories" :key="category.id">
                        <td>
                            <p class="name">{{ category.name }}</p>
                            <p class="muted">Order {{ category.order }}</p>
                        </td>
                        <td>{{ category.slug }}</td>
                        <td>
                            <span class="icon-preview">
                                <svg viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        :d="iconPaths[category.icon] || iconPaths.alert"
                                    />
                                </svg>
                                <small>{{ category.icon || '—' }}</small>
                            </span>
                        </td>
                        <td>
                            <span class="badge" :class="category.is_active ? 'active' : 'muted'">
                                {{ category.is_active ? 'Active' : 'Hidden' }}
                            </span>
                        </td>
                        <td>
                            <span class="badge" :class="category.is_emergency ? 'danger' : 'muted'">
                                {{ category.is_emergency ? 'Emergency' : 'Standard' }}
                            </span>
                        </td>
                        <td>
                            <button class="link" @click="startEdit(category)">Edit</button>
                            <button class="link danger" @click="remove(category)">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="!categories.length">
                        <td colspan="6" class="muted center">No categories yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="form-card">
            <h2>{{ editingCategory ? 'Update category' : 'New category' }}</h2>
            <form @submit.prevent="save">
                <label>Name</label>
                <input v-model="form.name" required placeholder="Crime & Emergency" />

                <label>Slug</label>
                <input v-model="form.slug" placeholder="crime" />

                <label>Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Used for incidents like..."></textarea>

                <label>Icon</label>
                <select v-model="form.icon">
                    <option v-for="icon in iconOptions" :key="icon.value" :value="icon.value">
                        {{ icon.label }}
                    </option>
                </select>

                <label>Color</label>
                <input v-model="form.color" type="color" />

                <div class="inline">
                    <div>
                        <label>Order</label>
                        <input v-model.number="form.order" type="number" min="0" />
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" v-model="form.is_active" /> Active
                        </label>
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" v-model="form.is_emergency" /> Emergency
                        </label>
                    </div>
                </div>

                <div class="actions">
                    <button type="submit">{{ editingCategory ? 'Update' : 'Create' }}</button>
                    <button type="button" class="ghost" @click="resetForm">Reset</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const ICON_CHOICES = [
    { label: 'Shield Alert', value: 'shield-alert', path: 'M12 2l8 4v6c0 5-3.5 9-8 10c-4.5-1-8-5-8-10V6z' },
    { label: 'Car Alert', value: 'car-brake-alert', path: 'M5 11h14l1 4v6h-2v-2H6v2H4v-6z' },
    { label: 'Party Popper', value: 'party-popper', path: 'M2 22l6-2l8-8l-4-4l-8 8zM14 4l2-2l4 4l-2 2z' },
    { label: 'Leaf', value: 'leaf', path: 'M5 21q0-5 3.5-10.5T19 4q0 5-3.5 10.5T5 21' },
    { label: 'Account Tie', value: 'account-tie', path: 'M12 3l3 3l-2 8h-2l-2-8l3-3zm-3 18h6l-1-6h-4z' },
    { label: 'Road', value: 'road', path: 'M10 2v6h4V2h2v20h-2v-8h-4v8H8V2z' },
    { label: 'Alert Circle', value: 'alert-circle', path: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 15h-2v-2h2zm0-4h-2V7h2z' },
    { label: 'Map Pin', value: 'map-marker', path: 'M12 2a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6zm0 8a2 2 0 1 1 0-4a2 2 0 0 1 0 4z' },
    { label: 'Hospital', value: 'hospital', path: 'M5 3h14v18H5z M11 8v3H8v2h3v3h2v-3h3v-2h-3V8z' },
    { label: 'Fire', value: 'fire', path: 'M12 2c2 3 1 5-1 7s-3 4-2 7s3 4 5 4s5-3 5-7s-2-6-4-8c0 2-1 3-2 4c0-2-1-5-1-7z' },
    { label: 'Badge', value: 'badge', path: 'M12 2l4 2l4-2v6c0 4-2.5 7.5-4 9.5c-1.5-2-4-5.5-4-9.5z' },
    { label: 'Wi-Fi', value: 'wifi', path: 'M12 4c3.9 0 7.6 1.2 11 3.5l-1.5 2.1C18.9 7.7 15.6 6.5 12 6.5S5.1 7.7 2.5 9.6L1 7.5C4.4 5.2 8.1 4 12 4zm0 5c2.8 0 5.4.9 7.7 2.6l-1.7 2.1C16.5 12.6 14.3 12 12 12s-4.5.6-6 1.6l-1.7-2.1C6.6 9.9 9.2 9 12 9zm0 5c1.5 0 3 .5 4.2 1.3l-1.7 2C13.8 16.9 12.9 16.5 12 16.5s-1.8.4-2.5.8l-1.7-2C9 14.5 10.5 14 12 14zm0 3.5a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 17.5z' },
    { label: 'Chat Bubble', value: 'chat', path: 'M4 4h16v12H7l-3 3z' },
    { label: 'Camera', value: 'camera', path: 'M5 6h3l2-2h4l2 2h3v12H5z M12 9a4 4 0 1 0 4 4a4 4 0 0 0-4-4z' },
    { label: 'Siren', value: 'siren', path: 'M12 2c3.9 0 7 3.1 7 7v7H5V9c0-3.9 3.1-7 7-7zm-9 15h18v3H3z' },
    { label: 'Recycle', value: 'recycle', path: 'M12 5l1.5 2.5H11L9 5l3-5l3 5h-2.5zM7 12l2.5 1.5L7 15l1 3H2l3-5zm10 0l2 3h-4l1 3l-2.5-1.5l-1.5-3z' },
    { label: 'Scales', value: 'scales', path: 'M11 4h2v3h3l2 6h-6c0 3-2 5-4 5s-4-2-4-5H3l2-6h3zm-2 6H7l-1 3h5zm10 0h-2l-1 3h5z' },
    { label: 'Warning', value: 'warning', path: 'M1 21h22L12 3zm11-4h-2v2h2zm0-6h-2v5h2z' },
    { label: 'Satellite', value: 'satellite', path: 'M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm13-5l5 5l-3 3l-5-5zm-2 2l-5 5l-3-3l5-5z' },
    { label: 'Handshake', value: 'handshake', path: 'M4 12l4-4l3 3l3-3l6 6l-3 3h-2l-1 2l-2-2l-2 2l-2-2l-2 2l-2-2z' },
    { label: 'Tree', value: 'tree', path: 'M12 2c3 0 5 2 5 5s-2 5-5 5s-5-2-5-5s2-5 5-5zm-2 10h4l1 5h-2v5h-2v-5H9z' },
];

const categories = ref([]);
const defaultIconPath = ICON_CHOICES[0].path;
const iconPaths = ICON_CHOICES.reduce((acc, item) => {
    acc[item.value] = item.path;
    return acc;
}, { alert: defaultIconPath });
const editingCategory = ref(null);
const defaultIconValue = ICON_CHOICES[0].value;

const form = reactive({
    name: '',
    slug: '',
    description: '',
    icon: defaultIconValue,
    color: '#2563EB',
    order: 0,
    is_active: true,
    is_emergency: false,
});

const iconOptions = computed(() => ICON_CHOICES);

const fetchCategories = async () => {
    const { data } = await api.get('/admin/categories');
    categories.value = data;
};

const refresh = () => fetchCategories();

const startEdit = (category) => {
    editingCategory.value = category;
    form.name = category.name;
    form.slug = category.slug;
    form.description = category.description || '';
    form.icon = category.icon || defaultIconValue;
    form.color = category.color || '#2563EB';
    form.order = category.order ?? 0;
    form.is_active = !!category.is_active;
    form.is_emergency = !!category.is_emergency;
};

const resetForm = () => {
    editingCategory.value = null;
    form.name = '';
    form.slug = '';
    form.description = '';
    form.icon = defaultIconValue;
    form.color = '#2563EB';
    form.order = 0;
    form.is_active = true;
    form.is_emergency = false;
};

const save = async () => {
    const payload = { ...form };
    if (editingCategory.value) {
        await api.put(`/admin/categories/${editingCategory.value.id}`, payload);
    } else {
        await api.post('/admin/categories', payload);
    }
    resetForm();
    fetchCategories();
};

const remove = async (category) => {
    if (!confirm('Delete this category?')) return;
    try {
        await api.delete(`/admin/categories/${category.id}`);
        if (editingCategory.value?.id === category.id) {
            resetForm();
        }
        fetchCategories();
    } catch (error) {
        alert(error.response?.data?.message || 'Unable to delete category.');
    }
};

onMounted(fetchCategories);
</script>

<style scoped>
.categories-grid {
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

.table-actions {
    display: flex;
    gap: 8px;
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

.badge.danger {
    background: #fee2e2;
    color: #b91c1c;
}

.badge.muted {
    background: #e2e8f0;
    color: #475569;
}

.icon-preview {
    display: flex;
    align-items: center;
    gap: 6px;
}

.icon-preview svg {
    width: 20px;
    height: 20px;
    color: #475569;
}

.icon-preview small {
    color: #94a3b8;
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
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
}

textarea {
    resize: none;
}

.inline {
    display: flex;
    gap: 10px;
    align-items: center;
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
    .categories-grid {
        grid-template-columns: 1fr;
    }
}
</style>
