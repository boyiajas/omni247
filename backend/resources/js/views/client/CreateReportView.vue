<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Create Report</h1>
            <p>Submit a new incident report</p>
        </div>
        <div class="card">
            <div class="card-body">
                <form class="form" @submit.prevent="submitReport">
                    <div class="form-group">
                        <label>Title</label>
                        <input v-model="form.title" type="text" placeholder="Short incident summary" required />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea v-model="form.description" rows="4" placeholder="Describe what happened" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select v-model="form.category_id" required>
                            <option disabled value="">Select category</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="grid">
                        <div class="form-group">
                            <label>Priority</label>
                            <select v-model="form.priority">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Privacy</label>
                            <select v-model="form.privacy">
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Address (optional)</label>
                        <input v-model="form.address" type="text" placeholder="Street, city" />
                    </div>
                    <div class="grid">
                        <div class="form-group">
                            <label>Latitude (optional)</label>
                            <input v-model="form.latitude" type="number" step="0.000001" />
                        </div>
                        <div class="form-group">
                            <label>Longitude (optional)</label>
                            <input v-model="form.longitude" type="number" step="0.000001" />
                        </div>
                    </div>
                    <p v-if="message" class="success">{{ message }}</p>
                    <p v-if="error" class="error">{{ error }}</p>
                    <button class="primary" type="submit" :disabled="submitting">
                        {{ submitting ? 'Submitting...' : 'Submit Report' }}
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
    name: 'CreateReportView',
    components: { ClientLayout },
    data() {
        return {
            categories: [],
            submitting: false,
            message: '',
            error: '',
            form: {
                title: '',
                description: '',
                category_id: '',
                priority: 'medium',
                privacy: 'public',
                address: '',
                latitude: '',
                longitude: '',
            },
        };
    },
    async mounted() {
        await this.fetchCategories();
    },
    methods: {
        async fetchCategories() {
            try {
                const response = await axios.get('/client/api/categories');
                this.categories = response.data?.data || [];
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },
        async submitReport() {
            this.submitting = true;
            this.error = '';
            this.message = '';
            try {
                const payload = {
                    ...this.form,
                    latitude: this.form.latitude || null,
                    longitude: this.form.longitude || null,
                };
                await axios.post('/client/api/reports', payload);
                this.message = 'Report submitted successfully.';
                this.form.title = '';
                this.form.description = '';
                this.form.category_id = '';
                this.form.address = '';
                this.form.latitude = '';
                this.form.longitude = '';
                this.form.priority = 'medium';
                this.form.privacy = 'public';
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to submit report.';
            } finally {
                this.submitting = false;
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

input,
select,
textarea {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #dbeafe;
    font-size: 14px;
}

.grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
