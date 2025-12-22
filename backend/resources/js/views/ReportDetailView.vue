<template>
    <div v-if="report" class="detail-grid">
        <div class="panel">
            <button class="link-btn" @click="goBack">← Back to reports</button>
            <div class="header">
                <div>
                    <p class="eyebrow">Report #{{ report.id }}</p>
                    <h2>{{ report.title }}</h2>
                    <p class="muted">{{ report.address || report.city || 'No address' }}</p>
                </div>
                <span class="badge" :class="report.status">{{ report.status }}</span>
            </div>
            <p>{{ report.description }}</p>
            <div class="stats">
                <div>
                    <p class="stat-label">Priority</p>
                    <p class="stat-value">{{ report.priority }}</p>
                </div>
                <div>
                    <p class="stat-label">Category</p>
                    <p class="stat-value">{{ report.category?.name }}</p>
                </div>
                <div>
                    <p class="stat-label">Ratings</p>
                    <p class="stat-value">{{ report.average_rating }} ({{ report.ratings_count }})</p>
                </div>
                <div>
                    <p class="stat-label">Views</p>
                    <p class="stat-value">{{ report.views_count }}</p>
                </div>
            </div>

            <div class="actions">
                <button @click="moderate('verified', { is_verified: true })">Mark Verified</button>
                <button @click="moderate('investigating')">Investigating</button>
                <button @click="moderate('resolved')">Resolve</button>
                <button class="danger" @click="moderate('rejected')">Reject</button>
                <button class="ghost" @click="deleteReport">Delete Report</button>
            </div>
        </div>

        <div class="panel">
            <h3>Reporter</h3>
            <div class="reporter">
                <div>
                    <p class="user-name">{{ report.user?.name }}</p>
                    <p class="muted">{{ report.user?.email }}</p>
                </div>
                <button class="link-btn" @click="goToUser(report.user?.id)">View Profile</button>
            </div>
        </div>

        <div class="panel" v-if="report.media?.length">
            <h3>Attachments</h3>
            <div class="media-grid">
                <a v-for="media in report.media" :key="media.id" :href="media.url" target="_blank">{{ media.type }} - View</a>
            </div>
        </div>

        <div class="panel">
            <h3>Comments ({{ report.comments?.length || 0 }})</h3>
            <ul class="comments">
                <li v-for="comment in report.comments" :key="comment.id">
                    <p class="comment-author">{{ comment.user?.name || 'Anonymous' }}</p>
                    <p class="comment-body">{{ comment.body }}</p>
                    <p class="comment-meta">{{ new Date(comment.created_at).toLocaleString() }}</p>
                </li>
                <li v-if="!report.comments?.length" class="muted">No comments yet.</li>
            </ul>
        </div>
    </div>
    <div v-else class="panel">Loading report...</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const report = ref(null);
const loading = ref(false);

const fetchReport = async () => {
    loading.value = true;
    const { data } = await api.get(`/admin/reports/${route.params.id}`);
    report.value = data;
    loading.value = false;
};

const moderate = async (status, extra = {}) => {
    await api.post(`/admin/reports/${route.params.id}/moderate`, {
        status,
        ...extra,
    });
    fetchReport();
};

const deleteReport = async () => {
    if (!confirm('Delete this report?')) return;
    await api.delete(`/admin/reports/${route.params.id}`);
    router.push({ name: 'reports' });
};

const goBack = () => {
    router.push({ name: 'reports' });
};

const goToUser = (id) => {
    if (!id) return;
    router.push({ name: 'user-detail', params: { id } });
};

onMounted(fetchReport);
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

.stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 16px 0;
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

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.actions button {
    border: none;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    background: #e0f2fe;
    color: #0369a1;
    font-size: 13px;
}

.actions .danger {
    background: #fee2e2;
    color: #b91c1c;
}

.actions .ghost {
    background: transparent;
    color: #b91c1c;
    border: 1px solid #fecaca;
}

.badge {
    padding: 6px 12px;
    border-radius: 999px;
    text-transform: capitalize;
}

.badge.pending {
    background: #fef3c7;
    color: #b45309;
}

.badge.verified {
    background: #dcfce7;
    color: #15803d;
}

.badge.resolved {
    background: #dbeafe;
    color: #1d4ed8;
}

.badge.rejected {
    background: #fee2e2;
    color: #b91c1c;
}

.media-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.media-grid a {
    color: #0ea5e9;
    font-weight: 600;
}

.comments {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.comment-author {
    font-weight: 600;
    margin: 0;
}

.comment-body {
    margin: 4px 0;
}

.comment-meta {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
}

.reporter {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
