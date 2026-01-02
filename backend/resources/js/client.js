import { createApp, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import axios from 'axios';

// Import components
import ClientLoginView from './views/client/ClientLoginView.vue';
import ClientRegisterView from './views/client/ClientRegisterView.vue';
import ClientDashboardView from './views/client/ClientDashboardView.vue';
import ClientNewsFeedView from './views/client/ClientNewsFeedView.vue';
import CreateReportView from './views/client/CreateReportView.vue';
import ClientReportsView from './views/client/ClientReportsView.vue';
import ClientMapView from './views/client/ClientMapView.vue';
import ClientAlertsView from './views/client/ClientAlertsView.vue';
import ClientProfileView from './views/client/ClientProfileView.vue';
import ClientSettingsView from './views/client/ClientSettingsView.vue';
import ClientRewardsView from './views/client/ClientRewardsView.vue';

// Configure axios
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Get CSRF token
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Determine if we're on login/register page or dashboard
const path = window.location.pathname;
const isLoginPage = path.includes('/login');
const isRegisterPage = path.includes('/register');

// Simple app for login/register pages
if (isLoginPage || isRegisterPage) {
    const app = createApp(isLoginPage ? ClientLoginView : ClientRegisterView);
    app.mount('#app');
} else {
    // Full SPA for dashboard
    const router = createRouter({
        history: createWebHistory('/client/'),
        routes: [
            {
                path: '/dashboard',
                name: 'dashboard',
                component: ClientDashboardView,
            },
            {
                path: '/news-feed',
                name: 'news-feed',
                component: ClientNewsFeedView,
            },
            {
                path: '/create-report',
                name: 'create-report',
                component: CreateReportView,
            },
            {
                path: '/my-reports',
                name: 'my-reports',
                component: ClientReportsView,
            },
            {
                path: '/map',
                name: 'map',
                component: ClientMapView,
            },
            {
                path: '/alerts',
                name: 'alerts',
                component: ClientAlertsView,
            },
            {
                path: '/profile',
                name: 'profile',
                component: ClientProfileView,
            },
            {
                path: '/settings',
                name: 'settings',
                component: ClientSettingsView,
            },
            {
                path: '/rewards',
                name: 'rewards',
                component: ClientRewardsView,
            },
            {
                path: '/',
                redirect: '/dashboard',
            },
        ],
    });

    // Create root component
    const AppComponent = {
        render: () => h(RouterView),
    };

    const app = createApp(AppComponent);
    app.use(router);
    app.mount('#app');
}
