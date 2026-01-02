<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Profile</h1>
            <p>Manage your profile information</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="empty-state">Loading profile...</div>
                <form v-else class="form" @submit.prevent="saveProfile">
                    <div class="form-group">
                        <label>Name</label>
                        <input v-model="form.name" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="form.email" type="email" disabled />
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input v-model="form.phone" type="text" placeholder="Optional phone number" />
                    </div>
                    <div class="stats">
                        <div>
                            <span class="stat-label">Reports</span>
                            <span class="stat-value">{{ stats.total_reports }}</span>
                        </div>
                        <div>
                            <span class="stat-label">Points</span>
                            <span class="stat-value">{{ stats.total_points }}</span>
                        </div>
                        <div>
                            <span class="stat-label">Reputation</span>
                            <span class="stat-value">{{ stats.reputation_score }}</span>
                        </div>
                    </div>
                    <p v-if="message" class="success">{{ message }}</p>
                    <p v-if="error" class="error">{{ error }}</p>
                    <button class="primary" type="submit" :disabled="saving">
                        {{ saving ? 'Saving...' : 'Save Changes' }}
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
    name: 'ClientProfileView',
    components: { ClientLayout },
    data() {
        return {
            loading: false,
            saving: false,
            message: '',
            error: '',
            form: {
                name: '',
                email: '',
                phone: '',
            },
            stats: {
                total_reports: 0,
                total_points: 0,
                reputation_score: 0,
            },
        };
    },
    async mounted() {
        await this.fetchProfile();
    },
    methods: {
        async fetchProfile() {
            this.loading = true;
            try {
                const response = await axios.get('/client/api/profile');
                const user = response.data?.user || {};
                this.form.name = user.name || '';
                this.form.email = user.email || '';
                this.form.phone = user.phone || '';
                this.stats.total_reports = user.total_reports || 0;
                this.stats.total_points = user.total_points || 0;
                this.stats.reputation_score = user.reputation_score || 0;
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                this.loading = false;
            }
        },
        async saveProfile() {
            this.saving = true;
            this.error = '';
            this.message = '';
            try {
                const response = await axios.put('/client/api/profile', {
                    name: this.form.name,
                    phone: this.form.phone,
                });
                const user = response.data?.user || {};
                this.form.name = user.name || this.form.name;
                this.form.phone = user.phone || this.form.phone;
                this.message = response.data?.message || 'Profile updated.';
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update profile.';
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

input {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #dbeafe;
    font-size: 14px;
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px;
}

.stat-label {
    font-size: 11px;
    color: #64748b;
}

.stat-value {
    display: block;
    font-size: 16px;
    color: #0f172a;
    font-weight: 600;
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

.empty-state {
    padding: 20px;
    color: #64748b;
    text-align: center;
}
</style>
