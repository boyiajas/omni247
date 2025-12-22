<template>
    <header class="topbar">
        <div>
            <p class="welcome">{{ subtitle }}</p>
            <h1 class="title">{{ title }}</h1>
        </div>
        <div class="actions">
            <button class="pill pill-live">
                <span class="dot"></span>
                Live
            </button>
            <button class="pill" @click="$emit('refresh')">
                Refresh
            </button>
            <div class="avatar" v-if="user">
                <div class="avatar-initials">{{ initials }}</div>
                <div>
                    <p class="avatar-name">{{ user.name }}</p>
                    <p class="avatar-role">{{ user.role?.toUpperCase() }}</p>
                </div>
            </div>
            <button class="pill danger" @click="$emit('logout')">Logout</button>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    title: {
        type: String,
        default: 'Dashboard',
    },
});

const subtitle = 'Welcome back, ready to keep everyone safe?';

const auth = useAuthStore();
const user = computed(() => auth.user);

const initials = computed(() => {
    if (!user.value?.name) return 'GI';
    return user.value.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
});
</script>

<style scoped>
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0 24px;
}

.welcome {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
}

.title {
    margin: 4px 0 0;
    font-size: 28px;
    color: #0f172a;
}

.actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.pill {
    border: none;
    border-radius: 999px;
    padding: 8px 14px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    background-color: #e2e8f0;
    color: #0f172a;
}

.pill-live {
    background-color: #dcfce7;
    color: #15803d;
    display: flex;
    align-items: center;
    gap: 6px;
}

.pill-live .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #22c55e;
}

.danger {
    background-color: #fee2e2;
    color: #b91c1c;
}

.avatar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: #f1f5f9;
}

.avatar-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #34d399, #10b981);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.avatar-name {
    margin: 0;
    font-weight: 600;
    font-size: 14px;
}

.avatar-role {
    margin: 0;
    font-size: 12px;
    color: #64748b;
}
</style>
