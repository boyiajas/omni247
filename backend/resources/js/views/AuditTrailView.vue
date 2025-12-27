<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Compliance</p>
                <h2>Audit Trail</h2>
            </div>
            <div class="filters-row">
                <input 
                    v-model="filters.email" 
                    @input="debouncedSearch"
                    type="text" 
                    placeholder="Search by email..."
                    class="search-input"
                />
                <input 
                    v-model="filters.start_date" 
                    @change="fetchAudits()"
                    type="date" 
                    class="date-input"
                    placeholder="Start date"
                />
                <input 
                    v-model="filters.end_date" 
                    @change="fetchAudits()"
                    type="date" 
                    class="date-input"
                    placeholder="End date"
                />
                <select v-model="filters.action" @change="fetchAudits()">
                    <option value="">All actions</option>
                    <option value="admin.login">Logins</option>
                    <option value="admin.users.update">User updates</option>
                    <option value="admin.reports.moderate">Moderation</option>
                </select>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                <tr 
                    v-for="audit in audits" 
                    :key="audit.id"
                    class="audit-row"
                    @click="showDetails(audit)"
                >
                    <td>{{ audit.action }}</td>
                    <td>{{ audit.description }}</td>
                    <td>{{ audit.user?.name || 'System' }}</td>
                    <td>{{ audit.user?.email || 'N/A' }}</td>
                    <td>{{ new Date(audit.created_at).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>

        <div class="pagination" v-if="meta.total">
            <button :disabled="meta.current_page === 1" @click="fetchAudits(meta.current_page - 1)">Prev</button>
            <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button :disabled="meta.current_page === meta.last_page" @click="fetchAudits(meta.current_page + 1)">Next</button>
        </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedAudit" class="modal-overlay" @click="closeDetails">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Audit Log Details</h3>
                <button class="close-btn" @click="closeDetails">×</button>
            </div>
            
            <div class="modal-body">
                <div class="detail-section">
                    <h4>Action Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Action:</span>
                            <span class="action-badge" :class="getActionClass(selectedAudit.action)">
                                {{ selectedAudit.action }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Entity Type:</span>
                            <span class="value">{{ selectedAudit.entity_type }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Entity ID:</span>
                            <span class="value">{{ selectedAudit.entity_id || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Timestamp:</span>
                            <span class="value">{{ formatDateTime(selectedAudit.created_at) }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>User Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">User:</span>
                            <span class="user-badge">{{ selectedAudit.user_name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">User ID:</span>
                            <span class="value">{{ selectedAudit.user_id }}</span>
                        </div>
                        <div class="detail-item" v-if="selectedAudit.user_email">
                            <span class="label">Email:</span>
                            <span class="value">{{ selectedAudit.user_email }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">IP Address:</span>
                            <span class="value">{{ selectedAudit.ip_address }}</span>
                        </div>
                        <div class="detail-item" v-if="selectedAudit.user_agent">
                            <span class="label">User Agent:</span>
                            <span class="value">{{ selectedAudit.user_agent }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Description</h4>
                    <p class="description-text">{{ selectedAudit.description }}</p>
                </div>

                <div class="detail-section" v-if="selectedAudit.changes">
                    <h4>Changes</h4>
                    <pre class="changes-code">{{ formatJSON(selectedAudit.changes) }}</pre>
                </div>

                <div class="detail-section" v-if="selectedAudit.metadata">
                    <h4>Metadata</h4>
                    <pre class="changes-code">{{ formatJSON(selectedAudit.metadata) }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const audits = ref([]);
const meta = reactive({ current_page: 1, last_page: 1, total: 0 });
const filters = reactive({ 
    action: '',
    email: '',
    start_date: '',
    end_date: ''
});
const selectedAudit = ref(null);
let searchTimeout = null;

const fetchAudits = async (page = 1) => {
    const params = { 
        page,
        ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
            delete params[key];
        }
    });
    
    const { data } = await api.get('/admin/audits', { params });
    audits.value = data.data;
    Object.assign(meta, {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
    });
};

const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchAudits(1);
    }, 500);
};

const showDetails = (audit) => {
    selectedAudit.value = audit;
};

const closeDetails = () => {
    selectedAudit.value = null;
};

const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
};

const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const getActionClass = (action) => {
    if (action.includes('create')) return 'action-create';
    if (action.includes('update')) return 'action-update';
    if (action.includes('delete')) return 'action-delete';
    if (action.includes('login')) return 'action-login';
    return 'action-default';
};

const refreshHandler = () => fetchAudits(meta.current_page);

onMounted(() => {
    fetchAudits();
    window.addEventListener('dashboard-refresh', refreshHandler);
});

onBeforeUnmount(() => {
    window.removeEventListener('dashboard-refresh', refreshHandler);
});
</script>

<style scoped>
.card {
    background: white;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
}

.filters-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
}

.search-input,
.date-input {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
    min-width: 180px;
}

.search-input {
    min-width: 220px;
}

.search-input:focus,
.date-input:focus,
select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

select {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
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

.pagination {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
}

.pagination button {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    background: #0ea5e9;
    color: white;
    cursor: pointer;
    font-size: 13px;
}

.audit-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.audit-row:hover {
    background-color: #f8fafc;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    margin: 0;
    font-size: 20px;
    color: #1e293b;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: #64748b;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
}

.modal-body {
    padding: 24px;
}

.detail-section {
    margin-bottom: 24px;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h4 {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-item .label {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
}

.detail-item .value {
    font-size: 14px;
    color: #1e293b;
    word-break: break-word;
}

.user-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.action-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.action-create {
    background: #d1fae5;
    color: #065f46;
}

.action-update {
    background: #dbeafe;
    color: #1e40af;
}

.action-delete {
    background: #fee2e2;
    color: #991b1b;
}

.action-login {
    background: #fef3c7;
    color: #92400e;
}

.action-default {
    background: #f1f5f9;
    color: #475569;
}

.description-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
}

.changes-code {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    font-size: 13px;
    color: #1e293b;
    overflow-x: auto;
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
