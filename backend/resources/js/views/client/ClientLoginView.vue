<template>
    <div class="login-shell">
        <div class="glow"></div>
        <div class="card">
            <p class="eyebrow">Omni247 Client</p>
            <h1>Client Portal Login</h1>
            <p class="subtitle">Sign in to manage your reports and alerts.</p>

            <form @submit.prevent="handleLogin">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    v-model="form.email"
                    required
                    placeholder="your.email@example.com"
                />

                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    v-model="form.password"
                    required
                    placeholder="Enter your password"
                />

                <label class="checkbox">
                    <input type="checkbox" v-model="form.remember" />
                    Remember me
                </label>

                <p class="error" v-if="error">{{ error }}</p>

                <button type="submit" :disabled="loading">
                    {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    Don't have an account?
                    <a href="/client/register">Register here</a>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ClientLoginView',
    data() {
        return {
            form: {
                email: '',
                password: '',
                remember: false,
            },
            loading: false,
            error: null,
        };
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.error = null;

            try {
                await axios.post('/client/login', this.form);
                window.location.href = '/client/dashboard';
            } catch (error) {
                this.error = error.response?.data?.message || 'Invalid credentials. Please try again.';
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.login-shell {
    min-height: 100vh;
    background: #020617;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 20px;
}

.glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.45), transparent 70%);
    filter: blur(20px);
    top: -120px;
    right: -100px;
}

.card {
    width: 420px;
    z-index: 2;
    background: white;
    border-radius: 30px;
    padding: 40px;
    box-shadow: 0 40px 80px rgba(15, 23, 42, 0.25);
}

.eyebrow {
    font-size: 14px;
    font-weight: 600;
    color: #0ea5e9;
    text-transform: uppercase;
    letter-spacing: 0.2em;
}

h1 {
    margin-top: 8px;
    font-size: 28px;
    color: #0f172a;
}

.subtitle {
    margin-top: 6px;
    color: #64748b;
    font-size: 14px;
}

form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}

label {
    font-size: 14px;
    color: #475569;
}

input[type='email'],
input[type='password'] {
    border-radius: 14px;
    border: 1px solid #cbd5f5;
    padding: 14px;
    font-size: 16px;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
}

button[type='submit'] {
    background: linear-gradient(135deg, #22c55e, #0ea5e9);
    border: none;
    color: white;
    font-weight: 600;
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    margin-top: 8px;
}

button[type='submit']:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.error {
    color: #dc2626;
    font-size: 14px;
}

.auth-footer {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    margin-top: 24px;
}

.auth-footer p {
    color: #6b7280;
    font-size: 14px;
}

.auth-footer a {
    color: #0ea5e9;
    text-decoration: none;
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}
</style>
