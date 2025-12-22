import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('dashboard_user') ?? 'null'),
        token: localStorage.getItem('dashboard_token'),
        loading: false,
        initialized: false,
        error: null,
    }),
    getters: {
        isAuthenticated: (state) => Boolean(state.token && state.user),
    },
    actions: {
        async initialize() {
            if (this.initialized) {
                return;
            }

            if (this.token && !this.user) {
                try {
                    const { data } = await api.get('/user');
                    this.user = data;
                    localStorage.setItem('dashboard_user', JSON.stringify(data));
                } catch (error) {
                    this.clearSession();
                }
            }

            this.initialized = true;
        },
        async login(credentials) {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await api.post('/admin/login', credentials);
                this.token = data.token;
                this.user = data.user;

                localStorage.setItem('dashboard_token', data.token);
                localStorage.setItem('dashboard_user', JSON.stringify(data.user));

                return { success: true };
            } catch (error) {
                this.error =
                    error.response?.data?.errors?.email?.[0] ||
                    error.response?.data?.message ||
                    'Unable to login';
                return { success: false, error: this.error };
            } finally {
                this.loading = false;
            }
        },
        async logout() {
            try {
                await api.post('/admin/logout');
            } catch (error) {
                // ignore
            } finally {
                this.clearSession();
            }
        },
        clearSession() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('dashboard_token');
            localStorage.removeItem('dashboard_user');
        },
    },
});
