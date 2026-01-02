<template>
    <ClientLayout>
        <div class="page-header">
            <h1>News Feed</h1>
            <p>Latest reports from the community</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div class="filters">
                    <button
                        v-for="category in categories"
                        :key="category.slug"
                        :class="['chip', { active: selectedCategory === category.slug }]"
                        @click="selectCategory(category.slug)"
                    >
                        {{ category.name }}
                    </button>
                </div>

                <div v-if="loading" class="empty-state">Loading reports...</div>
                <div v-else-if="reports.length === 0" class="empty-state">No reports found.</div>

                <div v-else class="report-grid">
                    <div v-for="report in reports" :key="report.id" class="report-card">
                        <div class="report-image" :style="{ backgroundImage: `url(${report.image_url || fallbackImage})` }">
                            <span class="category-badge">{{ report.category?.name || 'General' }}</span>
                        </div>
                        <div class="report-content">
                            <h3>{{ report.title }}</h3>
                            <p class="report-meta">
                                {{ report.address || 'Unknown location' }} • {{ formatDate(report.created_at) }}
                            </p>
                            <p class="report-desc">{{ truncate(report.description, 120) }}</p>
                            <div class="report-stats">
                                <span>👁️ {{ report.views_count }}</span>
                                <span>💬 {{ report.comments_count }}</span>
                                <span>⭐ {{ Number(report.average_rating || 0).toFixed(1) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientLayout>
</template>

<script>
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout.vue';
export default {
    name: 'ClientNewsFeedView',
    components: { ClientLayout },
    data() {
        return {
            categories: [{ id: 'all', name: 'All', slug: 'all' }],
            selectedCategory: 'all',
            reports: [],
            loading: false,
            fallbackImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
        };
    },
    async mounted() {
        await this.fetchCategories();
        await this.fetchReports();
    },
    methods: {
        async fetchCategories() {
            try {
                const response = await axios.get('/client/api/categories');
                const list = response.data?.data || [];
                this.categories = [{ id: 'all', name: 'All', slug: 'all' }, ...list];
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },
        async fetchReports() {
            this.loading = true;
            try {
                const params = this.selectedCategory !== 'all'
                    ? { category: this.selectedCategory }
                    : {};
                const response = await axios.get('/client/api/reports', { params });
                this.reports = response.data?.data || [];
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                this.loading = false;
            }
        },
        selectCategory(slug) {
            this.selectedCategory = slug;
            this.fetchReports();
        },
        formatDate(value) {
            return new Date(value).toLocaleDateString();
        },
        truncate(text, limit) {
            if (!text) return '';
            return text.length > limit ? `${text.slice(0, limit)}...` : text;
        },
    },
};
</script>

<style scoped>
.filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.chip {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    font-size: 13px;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
}

.chip.active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}

.report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
}

.report-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    overflow: hidden;
}

.report-image {
    height: 140px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.category-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.8);
    color: #ffffff;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
}

.report-content {
    padding: 14px;
}

.report-content h3 {
    font-size: 15px;
    margin-bottom: 6px;
    color: #0f172a;
}

.report-meta {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
}

.report-desc {
    font-size: 13px;
    color: #475569;
    margin-bottom: 10px;
}

.report-stats {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
}

.empty-state {
    padding: 20px;
    color: #64748b;
    text-align: center;
}
</style>
