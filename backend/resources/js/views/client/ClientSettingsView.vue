<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Settings</h1>
            <p>Configure your preferences</p>
        </div>
        <div class="card">
            <div class="card-body">
                <form class="form" @submit.prevent="saveSettings">
                    <div class="form-group">
                        <label>Theme</label>
                        <select v-model="form.theme">
                            <option v-for="theme in themeOptions" :key="theme.key" :value="theme.key">
                                {{ theme.label }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Language</label>
                        <select v-model="form.language">
                            <option value="en">English</option>
                            <option value="yo">Yoruba</option>
                        </select>
                    </div>
                    <p v-if="message" class="success">{{ message }}</p>
                    <p v-if="error" class="error">{{ error }}</p>
                    <button class="primary" type="submit" :disabled="saving">
                        {{ saving ? 'Saving...' : 'Save Settings' }}
                    </button>
                </form>
            </div>
        </div>
    </ClientLayout>
</template>

<script>
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout.vue';
export default {
    name: 'ClientSettingsView',
    components: { ClientLayout },
    data() {
        return {
            saving: false,
            message: '',
            error: '',
            form: {
                theme: 'light',
                language: 'en',
            },
            themeOptions: [
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
                { key: 'pink', label: 'Pink' },
                { key: 'grey', label: 'Grey' },
                { key: 'gold', label: 'Gold' },
                { key: 'emerald', label: 'Emerald' },
                { key: 'ocean', label: 'Ocean' },
                { key: 'violet', label: 'Violet' },
                { key: 'midnight', label: 'Midnight' },
                { key: 'charcoal', label: 'Charcoal' },
                { key: 'obsidian', label: 'Obsidian' },
                { key: 'slate', label: 'Slate' },
                { key: 'indigoNight', label: 'Indigo Night' },
                { key: 'amoled', label: 'Amoled' },
            ],
        };
    },
    async mounted() {
        await this.fetchSettings();
    },
    methods: {
        async fetchSettings() {
            try {
                const response = await axios.get('/client/api/settings');
                this.form.theme = response.data?.theme || 'light';
                this.form.language = response.data?.language || 'en';
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        },
        async saveSettings() {
            this.saving = true;
            this.error = '';
            this.message = '';
            try {
                const response = await axios.put('/client/api/settings', this.form);
                this.form.theme = response.data?.theme || this.form.theme;
                this.form.language = response.data?.language || this.form.language;
                this.message = response.data?.message || 'Settings updated.';
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update settings.';
            } finally {
                this.saving = false;
            }
        },
    },
};
</script>

<style scoped>
.form {
    display: grid;
    gap: 14px;
}

.form-group {
    display: grid;
    gap: 6px;
}

label {
    font-size: 13px;
    color: #475569;
}

select {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #dbeafe;
    font-size: 14px;
}

.primary {
    padding: 12px 16px;
    border-radius: 12px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    font-weight: 600;
    cursor: pointer;
}

.primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.success {
    color: #16a34a;
    font-size: 13px;
}

.error {
    color: #dc2626;
    font-size: 13px;
}
</style>
