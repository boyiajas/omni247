<template>
    <div class="card">
        <div class="card-head">
            <div>
                <p class="eyebrow">Support</p>
                <h2>Support Tickets</h2>
            </div>
            <div class="actions">
                <input 
                    v-model="filters.search" 
                    @input="debouncedSearch"
                    type="text" 
                    placeholder="Search tickets..."
                    class="search-input"
                />
                <select v-model="filters.status" @change="fetchTickets()">
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <select v-model="filters.priority" @change="fetchTickets()">
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon open">
                    <span>📨</span>
                </div>
                <div class="stat-info">
                    <p class="stat-value">{{ stats.open || 0 }}</p>
                    <p class="stat-label">Open</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon progress">
                    <span>⚙️</span>
                </div>
                <div class="stat-info">
                    <p class="stat-value">{{ stats.in_progress || 0 }}</p>
                    <p class="stat-label">In Progress</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon resolved">
                    <span>✅</span>
                </div>
                <div class="stat-info">
                    <p class="stat-value">{{ stats.resolved || 0 }}</p>
                    <p class="stat-label">Resolved</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon closed">
                    <span>🔒</span>
                </div>
                <div class="stat-info">
                    <p class="stat-value">{{ stats.closed || 0 }}</p>
                    <p class="stat-label">Closed</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon urgent">
                    <span>🚨</span>
                </div>
                <div class="stat-info">
                    <p class="stat-value">{{ stats.high_priority || 0 }}</p>
                    <p class="stat-label">High Priority</p>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr 
                    v-for="ticket in tickets" 
                    :key="ticket.id"
                    class="ticket-row"
                    @click="showTicketDetails(ticket)"
                >
                    <td>#{{ ticket.id }}</td>
                    <td class="subject-cell">{{ ticket.subject }}</td>
                    <td>{{ ticket.name }}</td>
                    <td>{{ ticket.email }}</td>
                    <td>
                        <span class="status-badge" :class="`status-${ticket.status}`">
                            {{ ticket.status.replace('_', ' ') }}
                        </span>
                    </td>
                    <td>
                        <span class="priority-badge" :class="`priority-${ticket.priority}`">
                            {{ ticket.priority }}
                        </span>
                    </td>
                    <td>
                        <span v-if="ticket.assigned_to" class="assigned-badge">
                            {{ ticket.assigned_to?.name || 'Admin' }}
                        </span>
                        <span v-else class="unassigned-text">Unassigned</span>
                    </td>
                    <td>{{ formatDate(ticket.created_at) }}</td>
                    <td class="actions-cell" @click.stop>
                        <button class="btn-icon" @click="editTicket(ticket)">
                            <span>✏️</span>
                        </button>
                        <button class="btn-icon" @click="deleteTicket(ticket.id)">
                            <span>🗑️</span>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="pagination" v-if="meta.total">
            <button :disabled="meta.current_page === 1" @click="fetchTickets(meta.current_page - 1)">Prev</button>
            <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button :disabled="meta.current_page === meta.last_page" @click="fetchTickets(meta.current_page + 1)">Next</button>
        </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="selectedTicket" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Ticket #{{ selectedTicket.id }} - {{ selectedTicket.subject }}</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>
            
            <div class="modal-body">
                <div class="ticket-details">
                    <div class="detail-row">
                        <label>From:</label>
                        <span>{{ selectedTicket.name }} ({{ selectedTicket.email }})</span>
                    </div>
                    <div class="detail-row">
                        <label>Message:</label>
                        <p class="ticket-message">{{ selectedTicket.message }}</p>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select v-model="editForm.status">
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select v-model="editForm.priority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Assigned To</label>
                        <select v-model="editForm.assigned_to">
                            <option :value="null">Unassigned</option>
                            <option v-for="admin in adminUsers" :key="admin.id" :value="admin.id">
                                {{ admin.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Admin Notes</label>
                        <textarea v-model="editForm.admin_notes" rows="4" placeholder="Add internal notes..."></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-primary" @click="updateTicket">Save Changes</button>
                <button class="btn btn-secondary" @click="closeModal">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const tickets = ref([]);
const meta = reactive({ current_page: 1, last_page: 1, total: 0 });
const filters = reactive({ 
    status: '', 
    priority: '',
    search: ''
});
const stats = ref({});
const selectedTicket = ref(null);
const adminUsers = ref([]);
const editForm = reactive({
    status: '',
    priority: '',
    assigned_to: null,
    admin_notes: ''
});
let searchTimeout = null;

const fetchTickets = async (page = 1) => {
    const params = { page, ...filters };
    Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
    });
    
    const { data } = await api.get('/admin/support-tickets', { params });
    tickets.value = data.data;
    Object.assign(meta, {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
    });
};

const fetchStats = async () => {
    const { data } = await api.get('/admin/support-tickets/stats');
    stats.value = data;
};

const fetchAdminUsers = async () => {
    try {
        const { data } = await api.get('/admin/users');
        // Filter for admin users only
        adminUsers.value = data.data.filter(user => 
            user.role === 'admin' || user.role === 'moderator'
        );
    } catch (error) {
        console.error('Error fetching admin users:', error);
    }
};

const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchTickets(1);
    }, 500);
};

const showTicketDetails = (ticket) => {
    selectedTicket.value = ticket;
    editForm.status = ticket.status;
    editForm.priority = ticket.priority;
    editForm.assigned_to = ticket.assigned_to;
    editForm.admin_notes = ticket.admin_notes || '';
};

const editTicket = (ticket) => {
    showTicketDetails(ticket);
};

const updateTicket = async () => {
    try {
        await api.put(`/admin/support-tickets/${selectedTicket.value.id}`, editForm);
        closeModal();
        fetchTickets(meta.current_page);
        fetchStats();
    } catch (error) {
        console.error('Error updating ticket:', error);
        alert('Failed to update ticket');
    }
};

const deleteTicket = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
        await api.delete(`/admin/support-tickets/${id}`);
        fetchTickets(meta.current_page);
        fetchStats();
    } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Failed to delete ticket');
    }
};

const closeModal = () => {
    selectedTicket.value = null;
};

const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

onMounted(() => {
    fetchTickets();
    fetchStats();
    fetchAdminUsers();
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
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
}

.actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.search-input {
    min-width: 250px;
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 16px;
    font-size: 13px;
}

select {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 12px;
    font-size: 13px;
    min-width: 150px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    background: #f8fafc;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.stat-icon.open { background: #dbeafe; }
.stat-icon.progress { background: #fef3c7; }
.stat-icon.resolved { background: #d1fae5; }
.stat-icon.closed { background: #e2e8f0; }
.stat-icon.urgent { background: #fee2e2; }

.stat-value {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
}

.stat-label {
    font-size: 13px;
    color: #64748b;
    margin: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-size: 13px;
}

th {
    font-weight: 600;
    color: #475569;
    background: #f8fafc;
}

.ticket-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.ticket-row:hover {
    background-color: #f8fafc;
}

.subject-cell {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-badge, .priority-badge {
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-block;
}

.status-open { background: #dbeafe; color: #1e40af; }
.status-in_progress { background: #fef3c7; color: #92400e; }
.status-resolved { background: #d1fae5; color: #065f46; }
.status-closed { background: #e2e8f0; color: #475569; }

.priority-low { background: #f1f5f9; color: #64748b; }
.priority-medium { background: #dbeafe; color: #1e40af; }
.priority-high { background: #fed7aa; color: #9a3412; }
.priority-urgent { background: #fee2e2; color: #991b1b; }

.assigned-badge {
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    background: #dbeafe;
    color: #1e40af;
    display: inline-block;
}

.unassigned-text {
    font-size: 12px;
    color: #94a3b8;
    font-style: italic;
}

.actions-cell {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.btn-icon:hover {
    opacity: 1;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination button {
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    background: #0ea5e9;
    color: white;
    cursor: pointer;
    font-size: 13px;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
    font-size: 18px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #64748b;
}

.modal-body {
    padding: 24px;
}

.ticket-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-row label {
    font-weight: 600;
    font-size: 13px;
    color: #64748b;
}

.ticket-message {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    margin: 0;
    line-height: 1.6;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    font-size: 13px;
}

.form-group select,
.form-group textarea {
    padding: 10px;
    border: 1px solid #cbd5f5;
    border-radius: 8px;
    font-size: 14px;
}

.form-group textarea {
    resize: vertical;
    font-family: inherit;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: #0ea5e9;
    color: white;
}

.btn-secondary {
    background: #f1f5f9;
    color: #475569;
}
</style>
