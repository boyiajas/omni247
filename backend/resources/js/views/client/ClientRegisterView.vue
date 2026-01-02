<template>
    <div class="auth-page">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Omni247 and start reporting</p>
                </div>

                <form @submit.prevent="handleRegister" class="auth-form">
                    <div v-if="error" class="alert alert-error">
                        {{ error }}
                    </div>

                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            v-model="form.name"
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            v-model="form.email"
                            required
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            v-model="form.password"
                            required
                            placeholder="At least 8 characters"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password_confirmation">Confirm Password</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            v-model="form.password_confirmation"
                            required
                            placeholder="Repeat your password"
                        />
                    </div>

                    <button type="submit" class="btn btn-primary btn-block"  :disabled="loading">
                        {{ loading ? 'Creating account...' : 'Create Account' }}
                    </button>
                </form>

                <div class="auth-footer">
                    <p>
                        Already have an account?
                        <a href="/client/login">Sign in here</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ClientRegisterView',
    data() {
        return {
            form: {
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            },
            loading: false,
            error: null,
        };
    },
    methods: {
        async handleRegister() {
            this.loading = true;
            this.error = null;

            try {
                await axios.post('/client/register', this.form);
                window.location.href = '/client/dashboard';
            } catch (error) {
                this.error = error.response?.data?.message || 'Registration failed. Please check your details.';
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
/* Reuse same styles as login */
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-container {
    width: 100%;
    max-width: 420px;
}

.auth-card {
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.auth-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
}

.auth-header p {
    color: #6b7280;
    font-size: 14px;
}

.auth-form {
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
    font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-block {
    width: 100%;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
}

.alert-error {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

.auth-footer {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.auth-footer p {
    color: #6b7280;
    font-size: 14px;
}

.auth-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}
</style>
