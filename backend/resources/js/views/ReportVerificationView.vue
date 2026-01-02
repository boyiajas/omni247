<template>
    <div class="page" v-if="loaded">
        <div class="card">
            <div class="card-head">
                <div>
                    <p class="eyebrow">Automation</p>
                    <h2>Report Verification</h2>
                    <p class="muted">Control auto-verification tiers, levels, and external services.</p>
                </div>
                <button class="primary" @click="saveSettings" :disabled="saving">
                    {{ saving ? 'Saving...' : 'Save settings' }}
                </button>
            </div>

            <div v-if="error" class="alert">
                {{ error }}
                <button class="link" type="button" @click="loadSettings">Retry</button>
            </div>

            <div class="section">
                <h3>System controls</h3>
                <div class="grid">
                    <label class="toggle">
                        <input type="checkbox" v-model="form.enabled" />
                        <span>Enable auto-verification</span>
                    </label>
                    <label>
                        Default tier
                        <select v-model="form.default_tier">
                            <option v-for="(tier, key) in tiers" :key="key" :value="key">
                                {{ tier.label }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>

            <div class="section">
                <h3>Enabled tiers</h3>
                <div class="chips">
                    <label v-for="(tier, key) in tiers" :key="key" class="chip">
                        <input type="checkbox" :value="key" v-model="form.enabled_tiers" />
                        <span>{{ tier.label }}</span>
                        <small>{{ tier.auto_verify_score }} / {{ tier.review_score }}</small>
                    </label>
                </div>
            </div>

            <div class="section">
                <h3>Enabled levels</h3>
                <div class="chips">
                    <label v-for="(level, key) in levels" :key="key" class="chip">
                        <input type="checkbox" :value="key" v-model="form.enabled_levels" />
                        <span>{{ level.label }}</span>
                        <small>{{ level.max_score }} pts</small>
                    </label>
                </div>
            </div>

            <div class="section">
                <h3>External services</h3>
                <div class="services">
                    <div v-for="(service, key) in services" :key="key" class="service-card">
                        <div class="service-head">
                            <div>
                                <p class="service-title">{{ service.label }}</p>
                                <p class="muted">Choose provider and API key.</p>
                            </div>
                            <label class="toggle">
                                <input type="checkbox" v-model="form.services[key].enabled" />
                                <span>Enabled</span>
                            </label>
                        </div>
                        <label>
                            Provider
                            <select v-model="form.services[key].provider">
                                <option v-for="provider in service.providers" :key="provider" :value="provider">
                                    {{ provider }}
                                </option>
                            </select>
                        </label>
                        <label>
                            API key
                            <input v-model="form.services[key].api_key" placeholder="Enter API key" type="password" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="card">Loading verification settings...</div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

const loaded = ref(false);
const saving = ref(false);
const error = ref('');
const levels = ref({});
const tiers = ref({});
const services = ref({});

const form = reactive({
    enabled: false,
    enabled_levels: [],
    enabled_tiers: [],
    default_tier: '',
    services: {},
});

const loadSettings = async () => {
    try {
        error.value = '';
        const { data } = await api.get('/admin/report-verification');
        levels.value = data.levels || {};
        tiers.value = data.tiers || {};
        services.value = data.services || {};

        form.enabled = !!data.enabled;
        form.enabled_levels = data.enabled_levels || [];
        form.enabled_tiers = data.enabled_tiers || [];
        form.default_tier = data.default_tier || '';

        form.services = {};
        Object.entries(services.value).forEach(([key, service]) => {
            form.services[key] = {
                enabled: !!service.enabled,
                provider: service.provider,
                api_key: service.api_key || '',
            };
        });
    } catch (err) {
        error.value = 'Failed to load verification settings. Please refresh or check API access.';
    } finally {
        loaded.value = true;
    }
};

const saveSettings = async () => {
    saving.value = true;
    try {
        await api.put('/admin/report-verification', {
            enabled: form.enabled,
            enabled_levels: form.enabled_levels,
            enabled_tiers: form.enabled_tiers,
            default_tier: form.default_tier,
            services: form.services,
        });
    } catch (err) {
        error.value = 'Failed to save verification settings. Please try again.';
    }
    saving.value = false;
    loadSettings();
};

onMounted(loadSettings);
</script>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.card {
    background: white;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
}

.muted {
    color: #64748b;
    font-size: 13px;
}

.primary {
    background: linear-gradient(135deg, #22d3ee, #0ea5e9);
    color: #021026;
    border: none;
    padding: 10px 16px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
}

.alert {
    background: #fee2e2;
    color: #991b1b;
    padding: 12px 14px;
    border-radius: 12px;
    margin-top: 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.link {
    border: none;
    background: none;
    color: #0ea5e9;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
}

.section {
    margin-top: 24px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 12px;
}

.toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 13px;
}

.chip small {
    color: #64748b;
}

.services {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-top: 12px;
}

.service-card {
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 16px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.service-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.service-title {
    font-weight: 700;
    margin: 0;
}

label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
}

select,
input {
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    padding: 8px 10px;
    font-size: 13px;
}
</style>
