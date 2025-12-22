<template>
    <div class="login-shell">
        <div class="glow"></div>
        <div class="card">
            <p class="eyebrow">G-iReport Pro</p>
            <h1>Facility Management Login</h1>
            <form @submit.prevent="handleSubmit">
                <label>Email</label>
                <input type="email" v-model="form.email" placeholder="admin@omni247.com" required />

                <label>Password</label>
                <input type="password" v-model="form.password" placeholder="Enter password" required />

                <p class="error" v-if="error">{{ error }}</p>

                <button type="submit" :disabled="auth.loading">
                    {{ auth.loading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>

            <div class="role-sim">
                <p>Simulate Role</p>
                <div class="role-buttons">
                    <button v-for="role in roles" :key="role.email" @click="applyRole(role)">
                        {{ role.label }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const error = ref('');

const form = reactive({
    email: 'admin@omni247.com',
    password: 'password',
});

const roles = [
    { label: 'Admin', email: 'admin@omni247.com', password: 'password' },
    { label: 'Moderator', email: 'moderator@omni247.com', password: 'password' },
    { label: 'Agency', email: 'agency@omni247.com', password: 'password' },
];

const applyRole = (role) => {
    form.email = role.email;
    form.password = role.password;
};

const handleSubmit = async () => {
    error.value = '';
    const { success, error: err } = await auth.login(form);
    if (!success) {
        error.value = err || 'Unable to login';
        return;
    }
    router.replace(route.query.redirect || { name: 'dashboard' });
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
}

.glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34,197,94,0.55), transparent 70%);
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

input {
    border-radius: 14px;
    border: 1px solid #cbd5f5;
    padding: 14px;
    font-size: 16px;
}

button[type='submit'] {
    background: linear-gradient(135deg, #22c55e, #0ea5e9);
    border: none;
    color: white;
    font-weight: 600;
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    margin-top: 10px;
}

.role-sim {
    margin-top: 28px;
    background: #f8fafc;
    border-radius: 18px;
    padding: 20px;
}

.role-buttons {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.role-buttons button {
    border: none;
    border-radius: 999px;
    padding: 10px;
    font-weight: 600;
    cursor: pointer;
    background: white;
    color: #0f172a;
}

.error {
    color: #dc2626;
    font-size: 14px;
}
</style>
