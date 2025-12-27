<template>
    <div class="layout">
        <SidebarNav @signout="handleLogout" />
        <div class="layout-main">
            <TopBar :title="currentTitle" @logout="handleLogout" @refresh="emitRefresh" />
            <div class="layout-content">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarNav from '@/components/layout/SidebarNav.vue';
import TopBar from '@/components/layout/TopBar.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const titles = {
    dashboard: 'Command Dashboard',
    analytics: 'Analytics & Trends',
    reports: 'Incident Reports',
    users: 'User Directory',
    roles: 'Roles & Permissions',
    categories: 'Report Categories',
    devices: 'Device Inventory',
    audits: 'Audit Trail',
    'operations-map': 'Operations Map',
};

const currentTitle = computed(() => titles[route.name] ?? 'Command Dashboard');

const handleLogout = async () => {
    await auth.logout();
    router.replace({ name: 'admin-login' });
};

const emitRefresh = () => {
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
};
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background-color: #eef2ff;
}

.layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
}

.layout-content {
    flex: 1;
    padding: 24px 28px 32px 28px;
}
</style>
