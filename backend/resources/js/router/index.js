import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import LoginView from '@/views/LoginView.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalyticsView from '@/views/AnalyticsView.vue';
import ReportsView from '@/views/ReportsView.vue';
import ReportDetailView from '@/views/ReportDetailView.vue';
import UsersView from '@/views/UsersView.vue';
import UserDetailView from '@/views/UserDetailView.vue';
import RolesView from '@/views/RolesView.vue';
import CategoriesView from '@/views/CategoriesView.vue';
import AchievementsView from '@/views/AchievementsView.vue';
import DevicesView from '@/views/DevicesView.vue';
import AuditTrailView from '@/views/AuditTrailView.vue';
import MapView from '@/views/MapView.vue';
import SettingsView from '@/views/SettingsView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guest: true },
        },
        {
            path: '/',
            component: DashboardLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: DashboardView,
                },
                {
                    path: 'analytics',
                    name: 'analytics',
                    component: AnalyticsView,
                },
                {
                    path: 'reports',
                    name: 'reports',
                    component: ReportsView,
                },
                {
                    path: 'reports/:id',
                    name: 'report-detail',
                    component: ReportDetailView,
                },
                {
                    path: 'users',
                    name: 'users',
                    component: UsersView,
                },
                {
                    path: 'users/:id',
                    name: 'user-detail',
                    component: UserDetailView,
                },
                {
                    path: 'roles',
                    name: 'roles',
                    component: RolesView,
                },
                {
                    path: 'categories',
                    name: 'categories',
                    component: CategoriesView,
                },
                {
                    path: 'achievements',
                    name: 'achievements',
                    component: AchievementsView,
                },
                {
                    path: 'devices',
                    name: 'devices',
                    component: DevicesView,
                },
                {
                    path: 'audits',
                    name: 'audits',
                    component: AuditTrailView,
                },
                {
                    path: 'operations-map',
                    name: 'operations-map',
                    component: MapView,
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: SettingsView,
                },
            ],
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();

    if (!auth.initialized) {
        await auth.initialize();
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (to.meta.guest && auth.isAuthenticated) {
        return next({ name: 'dashboard' });
    }

    return next();
});

export default router;
