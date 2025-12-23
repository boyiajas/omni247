<template>
    <aside class="sidebar">
        <div class="brand">
            <div class="brand-mark">G</div>
            <div>
                <p class="brand-title">G-iReport</p>
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
    { label: 'Dashboard', to: '/', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3zm10 8h8V3h-8zm-10 0h8v-6H3z"/></svg>' },
    { label: 'Analytics', to: '/analytics', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 19h16v2H4zm2-2V9h3v8zm5 0V5h3v12zm5 0v-6h3v6z"/></svg>' },
    { label: 'Reports', to: '/reports', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 5v14l7-3l7 3V5H5z"/></svg>' },
    { label: 'Users', to: '/users', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1Z"/></svg>' },
    { label: 'Roles', to: '/roles', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m17 3l-1.8 3H8.8L7 3H2l5 9l-5 9h5l1.8-3h6.4L17 21h5l-5-9l5-9z"/></svg>' },
    { label: 'Categories', to: '/categories', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 1l3 7l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z"/></svg>' },
    { label: 'Operations Map', to: '/operations-map', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h14l2 6H3zm-2 8h18v10H3zm9 2a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 2a2 2 0 1 1-2 2a2 2 0 0 1 2-2"/></svg>' },
    { label: 'Devices', to: '/devices', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 2v16h10V4Zm3 14h4v2h-4Z"/></svg>' },
    { label: 'Audit Trail', to: '/audits', icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 3A9 9 0 1 0 22 12A9 9 0 0 0 13 3m0 2a7 7 0 1 1-7 7a7 7 0 0 1 7-7m-1 2v5l4.3 2.6l.7-1.2l-3.5-2.1V7Z"/></svg>' },
];

const powerIcon = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 3h2v10h-2zm7.05 1.54l1.41 1.41A9 9 0 0 1 21 12a9 9 0 1 1-9-9v2a7 7 0 1 0 7.05 1.54"/></svg>';

const isActive = (item) => {
    if (item.to === '/' && route.path === '/') {
        return true;
    }

    return route.path.startsWith(item.to) && item.to !== '/';
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
