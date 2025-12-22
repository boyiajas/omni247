<template>
    <div class="stat-card">
        <div class="stat-copy">
            <p class="label">{{ label }}</p>
            <p class="value">{{ value }}</p>
            <p class="trend" :class="trendClass">{{ trendLabel }}</p>
        </div>
        <div class="icon" :style="{ background: accent }">
            <slot name="icon" />
        </div>
    </div>
    </template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: String,
    value: [String, Number],
    trend: {
        type: Number,
        default: 0,
    },
    accent: {
        type: String,
        default: 'linear-gradient(135deg,#34d399,#10b981)',
    },
});

const trendClass = computed(() => (props.trend >= 0 ? 'up' : 'down'));
const trendLabel = computed(() => `${props.trend >= 0 ? '+' : ''}${props.trend}% vs last week`);
</script>

<style scoped>
.stat-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.stat-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.icon :deep(svg) {
    width: 24px;
    height: 24px;
}

.label {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
}

.value {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
}

.trend {
    margin: 0;
    font-size: 13px;
}

.trend.up {
    color: #16a34a;
}

.trend.down {
    color: #dc2626;
}
</style>
