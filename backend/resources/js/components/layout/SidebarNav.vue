<template>
    <aside class="sidebar">
        <div class="brand">
            <img src="/images/omni247-logo.png" alt="Omni247" class="brand-logo" />
            <div>
                <p class="brand-title">Omni247</p>
                <p class="brand-subtitle">Control Center</p>
            </div>
        </div>

        <nav class="nav-list">
            <router-link
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="nav-item"
                :class="{ active: isActive(item) }"
            >
                <span class="nav-icon" v-html="item.icon" />
                <span>{{ item.label }}</span>
            </router-link>
        </nav>

        <button class="sign-out" @click="$emit('signout')">
            <span class="nav-icon" v-html="powerIcon" />
            Sign Out
        </button>
    </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
    { label: 'Dashboard', to: '/admin', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3zm10 8h8V3h-8zm-10 0h8v-6H3z"/></svg>' },
    { label: 'Analytics', to: '/admin/analytics', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 19h16v2H4zm2-2V9h3v8zm5 0V5h3v12zm5 0v-6h3v6z"/></svg>' },
    { label: 'Reports', to: '/admin/reports', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 5v14l7-3l7 3V5H5z"/></svg>' },
    { label: 'Report Verification', to: '/admin/report-verification', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l7 4v6c0 5-3.1 9.4-7 10c-3.9-.6-7-5-7-10V6zm0 2.3L7 6.1v5.9c0 4 2.4 7.6 5 8c2.6-.4 5-4 5-8V6.1zM11 8h2v5h-2zm0 7h2v2h-2z"/></svg>' },
    { label: 'Users', to: '/admin/users', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1Z"/></svg>' },
    { label: 'Roles', to: '/admin/roles', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m17 3l-1.8 3H8.8L7 3H2l5 9l-5 9h5l1.8-3h6.4L17 21h5l-5-9l5-9z"/></svg>' },
    { label: 'Categories', to: '/admin/categories', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 1l3 7l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z"/></svg>' },
    { label: 'Achievements', to: '/admin/achievements', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 2.05 1.23 3.81 3 4.58V16h4v-2.42c1.77-.77 3-2.53 3-4.58a5 5 0 0 0-5-5m-1 14v2h2v-2zm0 3v2a1 1 0 0 0 1 1a1 1 0 0 0 1-1v-2z"/></svg>' },
    { label: 'Operations Map', to: '/admin/operations-map', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h14l2 6H3zm-2 8h18v10H3zm9 2a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 2a2 2 0 1 1-2 2a2 2 0 0 1 2-2"/></svg>' },
    { label: 'Devices', to: '/admin/devices', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 2v16h10V4Zm3 14h4v2h-4Z"/></svg>' },
    { label: 'Audit Trail', to: '/admin/audits', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 3A9 9 0 1 0 22 12A9 9 0 0 0 13 3m0 2a7 7 0 1 1-7 7a7 7 0 0 1 7-7m-1 2v5l4.3 2.6l.7-1.2l-3.5-2.1V7Z"/></svg>' },
    { label: 'Support Tickets', to: '/admin/support-tickets', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12m0 2H6v14h12V5M8 7h8v2H8V7m0 4h8v2H8v-2m0 4h5v2H8v-2Z"/></svg>' },
    { label: 'Settings', to: '/admin/settings', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"/></svg>' },
];

const powerIcon = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 3h2v10h-2zm7.05 1.54l1.41 1.41A9 9 0 0 1 21 12a9 9 0 1 1-9-9v2a7 7 0 1 0 7.05 1.54"/></svg>';

const isActive = (item) => {
    if (item.to === '/admin' && route.path === '/admin') {
        return true;
    }

    return route.path.startsWith(item.to) && item.to !== '/admin';
};
</script>

<style scoped>
.sidebar {
    width: 240px;
    background-color: #061126;
    color: #dbeafe;
    display: flex;
    flex-direction: column;
    padding: 32px 20px;
    border-right: 1px solid rgba(148, 163, 184, 0.2);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
}

.brand-logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
}

.brand-mark {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #22d3ee, #0ea5e9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
}

.brand-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
}

.brand-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
}

.nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    color: inherit;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
    background-color: rgba(15, 118, 110, 0.12);
}

.nav-item.active {
    background: linear-gradient(135deg, #34d399, #10b981);
    color: #041026;
    font-weight: 600;
}

.nav-icon {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.nav-icon svg {
    width: 20px;
    height: 20px;
}

.sign-out {
    margin-top: 20px;
    padding: 8px 14px;
    border-radius: 12px;
    background: rgba(248, 113, 113, 0.1);
    color: #fecaca;
    border: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
}
</style>
