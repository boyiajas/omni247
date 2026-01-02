<template>
    <div class="client-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Omni247</h2>
                <p class="user-badge">Client Portal</p>
            </div>

            <nav class="sidebar-nav">
                <router-link to="/dashboard" class="nav-item">
                    <span class="icon">📊</span>
                    <span>Dashboard</span>
                </router-link>
                
                <router-link to="/news-feed" class="nav-item">
                    <span class="icon">📰</span>
                    <span>News Feed</span>
                </router-link>
                
                <router-link to="/create-report" class="nav-item">
                    <span class="icon">➕</span>
                    <span>Create Report</span>
                </router-link>
                
                <router-link to="/my-reports" class="nav-item">
                    <span class="icon">📝</span>
                    <span>My Reports</span>
                </router-link>
                
                <router-link to="/map" class="nav-item">
                    <span class="icon">🗺️</span>
                    <span>Map</span>
                </router-link>
                
                <router-link to="/alerts" class="nav-item">
                    <span class="icon">🚨</span>
                    <span>Alerts</span>
                </router-link>
                
                <router-link to="/rewards" class="nav-item">
                    <span class="icon">🏆</span>
                    <span>Rewards</span>
                </router-link>
                
                <div class="nav-divider"></div>
                
                <router-link to="/profile" class="nav-item">
                    <span class="icon">👤</span>
                    <span>Profile</span>
                </router-link>
                
                <router-link to="/settings" class="nav-item">
                    <span class="icon">⚙️</span>
                    <span>Settings</span>
                </router-link>
                
                <a href="#" @click.prevent="handleLogout" class="nav-item">
                    <span class="icon">🚪</span>
                    <span>Logout</span>
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <slot />
        </main>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ClientLayout',
    methods: {
        async handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await axios.post('/client/logout');
                    window.location.href = '/client/login';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/client/login';
                }
            }
        },
    },
};
</script>

<style scoped>
.client-layout {
    display: flex;
    min-height: 100vh;
    background: #eef2ff;
}

.sidebar {
    width: 260px;
    background: #061126;
    color: #dbeafe;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    box-shadow: 2px 0 20px rgba(15, 23, 42, 0.2);
    border-right: 1px solid rgba(148, 163, 184, 0.2);
}

.sidebar-header {
    padding: 28px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
}

.user-badge {
    font-size: 12px;
    color: #94a3b8;
}

.sidebar-nav {
    padding: 20px 0;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 12px 18px;
    color: #dbeafe;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border-radius: 12px;
    margin: 0 12px 6px;
}

.nav-item:hover {
    background: rgba(15, 118, 110, 0.12);
}

.nav-item.router-link-active {
    background: linear-gradient(135deg, #34d399, #10b981);
    color: #041026;
}

.nav-item .icon {
    font-size: 20px;
    margin-right: 12px;
    width: 24px;
    text-align: center;
}

.nav-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 12px 20px;
}

.main-content {
    margin-left: 260px;
    flex: 1;
    padding: 24px 28px 32px 28px;
    min-height: 100vh;
    background: #f8fafc;
}

@media (max-width: 768px) {
    .sidebar {
        width: 70px;
    }
    
    .nav-item span:not(.icon) {
        display: none;
    }
    
    .sidebar-header h2,
    .user-badge {
        display: none;
    }
    
    .main-content {
        margin-left: 70px;
    }
}
</style>
