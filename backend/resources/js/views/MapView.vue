<template>
    <div class="map-shell">
        <div v-if="mapError" class="map-error">
            {{ mapError }}
        </div>

        <div class="map-header">
            <div>
                <p class="eyebrow">Situational Awareness</p>
                <h2>Operations map</h2>
                <p class="muted">Monitor live reports & responder locations.</p>
            </div>
            <div class="summary-chips">
                <button class="chip" :class="{ active: activeLayer === 'reports' }" @click="setLayer('reports')">
                    <p class="chip-label">Reports</p>
                    <p class="chip-value">{{ totalReports }}</p>
                </button>
                <button class="chip" :class="{ active: activeLayer === 'users' }" @click="setLayer('users')">
                    <p class="chip-label">Responders</p>
                    <p class="chip-value">{{ totalUsers }}</p>
                </button>
                <button class="ghost" @click="refreshData">Refresh</button>
            </div>
        </div>

        <div class="map-and-panel">
            <div ref="mapContainer" class="map-container"></div>
            <div class="side-panel">
                <h3>{{ activeLayer === 'reports' ? 'Reports' : 'Users' }} summary</h3>
                <p class="muted">Zoom or click markers to see more detail.</p>

                <div class="stats">
                    <div class="stat-card">
                        <p class="label">Total markers</p>
                        <p class="value">{{ currentMarkers.length }}</p>
                    </div>
                    <div class="stat-card" v-if="activeLayer === 'reports'">
                        <p class="label">Emergency</p>
                        <p class="value">
                            {{ emergencyCount }} <span class="muted">({{ emergencyPercentage }}%)</span>
                        </p>
                    </div>
                    <div class="stat-card" v-else>
                        <p class="label">Recently active</p>
                        <p class="value">
                            {{ activeUsersCount }} <span class="muted">last 24h</span>
                        </p>
                    </div>
                </div>

                <div class="layer-list">
                    <template v-if="activeLayer === 'reports'">
                        <p class="eyebrow small">Category breakdown</p>
                        <div class="breakdown-list">
                            <button
                                v-for="cat in categoryBreakdown"
                                :key="cat.key"
                                :class="['breakdown-item', { active: activeCategoryFilter === cat.key }]"
                                @click="toggleCategoryFilter(cat.key)"
                            >
                                <span class="dot" :style="{ background: cat.color }"></span>
                                <div>
                                    <p class="item-title">{{ cat.label }}</p>
                                    <p class="item-meta">{{ cat.count }} reports</p>
                                </div>
                            </button>
                        </div>
                    </template>
                    <template v-else>
                        <p class="eyebrow small">Role breakdown</p>
                        <div class="breakdown-list">
                            <button
                                v-for="role in userBreakdown"
                                :key="role.key"
                                :class="['breakdown-item', { active: activeUserFilter === role.key }]"
                                @click="toggleUserFilter(role.key)"
                            >
                                <span class="dot user"></span>
                                <div>
                                    <p class="item-title">{{ role.label }}</p>
                                    <p class="item-meta">{{ role.count }} responders</p>
                                </div>
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import api from '@/services/api';

const GOOGLE_MAPS_KEY =
    import.meta.env.VITE_GOOGLE_MAPS_KEY ||
    import.meta.env.GOOGLE_MAPS_API_KEY ||
    window.GOOGLE_MAPS_KEY ||
    '';
const GOOGLE_MAPS_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=maps`;

const mapContainer = ref(null);
const mapInstance = ref(null);
const mapError = ref(null);
const markers = [];
const reports = ref([]);
const users = ref([]);
const activeLayer = ref('reports');
const activeCategoryFilter = ref(null);
const activeUserFilter = ref(null);

const iconEmojiMap = {
    'shield-alert': '🛡️',
    'car-brake-alert': '🚨',
    'party-popper': '🎉',
    leaf: '🍃',
    'account-tie': '👔',
    road: '🛣️',
    'alert-circle': '⚠️',
    'map-marker': '📍',
    hospital: '🏥',
    fire: '🔥',
    badge: '🎖️',
    wifi: '📡',
    chat: '💬',
    camera: '📷',
    siren: '🚨',
    recycle: '♻️',
    scales: '⚖️',
    warning: '⚠️',
    satellite: '🛰️',
    handshake: '🤝',
    tree: '🌳',
};

const roleEmojiMap = {
    admin: '🛡️',
    moderator: '🧑‍⚖️',
    agency: '🏢',
    user: '👤',
};

const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
        return Promise.resolve(window.google.maps);
    }

    if (!GOOGLE_MAPS_KEY) {
        return Promise.reject(new Error('Missing Google Maps API key (set VITE_GOOGLE_MAPS_KEY).'));
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.google.maps));
            existingScript.addEventListener('error', reject);
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_MAPS_SCRIPT;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

const initMap = async () => {
    try {
        const maps = await loadGoogleMaps();
        if (mapInstance.value || !mapContainer.value) return;

        mapInstance.value = new maps.Map(mapContainer.value, {
            center: { lat: 40.785091, lng: -73.968285 },
            zoom: 3,
            mapTypeControl: false,
            streetViewControl: false,
        });
    } catch (error) {
        mapError.value = error.message || 'Unable to load Google Maps.';
    }
};

const clearMarkers = () => {
    while (markers.length) {
        const marker = markers.pop();
        if (marker.setMap) {
            marker.setMap(null);
        }
    }
};

const renderMarkers = () => {
    if (!mapInstance.value || !(window.google && window.google.maps)) return;

    clearMarkers();
    const target = activeLayer.value === 'reports' ? filteredReports.value : filteredUsers.value;

    const maps = window.google.maps;

    target.forEach((item) => {
        if (!item.longitude || !item.latitude) return;

        const marker = new maps.Marker({
            position: { lat: Number(item.latitude), lng: Number(item.longitude) },
            map: mapInstance.value,
            label: {
                text: item.icon || (activeLayer.value === 'reports' ? '📍' : '👤'),
                fontSize: '18px',
            },
        });

        const infoWindow = new maps.InfoWindow({
            content: activeLayer.value === 'reports'
                ? `<div class="info-window">
                        <p class="info-title">${item.icon || '📍'} ${item.title}</p>
                        <p class="info-meta">${item.categoryKey} • ${item.status}</p>
                        <p class="info-meta small">${new Date(item.createdAt).toLocaleString()}</p>
                   </div>`
                : `<div class="info-window">
                        <p class="info-title">${item.icon || '👤'} ${item.title}</p>
                        <p class="info-meta">${item.role.toUpperCase()} • ${item.count} reports nearby</p>
                        <p class="info-meta small">Last report ${new Date(item.lastReportAt).toLocaleString()}</p>
                   </div>`,
        });

        marker.addListener('click', () => infoWindow.open({ anchor: marker, map: mapInstance.value }));

        markers.push(marker);
    });
};

const computeUsersFromReports = () => {
    const grouped = new Map();

    reports.value.forEach((report) => {
        if (!report.userId || !report.latitude || !report.longitude) return;
        const key = report.userId;
        if (!grouped.has(key)) {
            grouped.set(key, {
                id: key,
                title: report.userName,
                subtitle: `Last report ${new Date(report.createdAt).toLocaleString()}`,
                latitude: report.latitude,
                longitude: report.longitude,
                lastReportAt: new Date(report.createdAt).getTime(),
                role: report.userRole || 'user',
                icon: roleEmojiMap[report.userRole || 'user'] || '👤',
                count: 1,
            });
        } else {
            const entry = grouped.get(key);
            entry.latitude = (entry.latitude * entry.count + report.latitude) / (entry.count + 1);
            entry.longitude = (entry.longitude * entry.count + report.longitude) / (entry.count + 1);
            entry.count += 1;
            const reportTime = new Date(report.createdAt).getTime();
            if (reportTime > entry.lastReportAt) {
                entry.lastReportAt = reportTime;
                entry.subtitle = `Last report ${new Date(report.createdAt).toLocaleString()}`;
            }
        }
    });

    users.value = Array.from(grouped.values());
};

const fetchReports = async () => {
    const { data } = await api.get('/admin/reports/map');
    reports.value = (data || []).map((report) => ({
        id: report.id,
        title: report.title,
        subtitle: `${report.status} • ${report.category?.name || 'Unknown'}`,
        latitude: report.latitude,
        longitude: report.longitude,
        is_emergency: report.priority === 'emergency' || report.is_emergency,
        status: report.status ?? 'pending',
        icon: iconEmojiMap[report.category?.icon] || '📍',
        categoryKey: report.category?.name || 'Uncategorized',
        categoryColor: report.category?.color || '#2563eb',
        userId: report.user?.id,
        userName: report.user?.name || 'Reporter',
        userRole: report.user?.role || 'user',
        createdAt: report.created_at,
    }));
    computeUsersFromReports();
};

const refreshData = async () => {
    await fetchReports();
    renderMarkers();
};

const setLayer = (layer) => {
    activeLayer.value = layer;
    activeCategoryFilter.value = null;
    activeUserFilter.value = null;
};

const toggleCategoryFilter = (key) => {
    activeCategoryFilter.value = activeCategoryFilter.value === key ? null : key;
};

const toggleUserFilter = (key) => {
    activeUserFilter.value = activeUserFilter.value === key ? null : key;
};

onMounted(async () => {
    await initMap();
    await refreshData();
});

onBeforeUnmount(() => {
    clearMarkers();
    if (mapInstance.value) {
        mapInstance.value.remove();
        mapInstance.value = null;
    }
});

watch([activeLayer, activeCategoryFilter, activeUserFilter], renderMarkers);

const filteredReports = computed(() =>
    reports.value.filter(
        (item) => !activeCategoryFilter.value || item.categoryKey === activeCategoryFilter.value
    )
);
const filteredUsers = computed(() =>
    users.value.filter((item) => !activeUserFilter.value || item.role === activeUserFilter.value)
);

const currentMarkers = computed(() =>
    activeLayer.value === 'reports' ? filteredReports.value : filteredUsers.value
);
const emergencyCount = computed(() => filteredReports.value.filter((item) => item.is_emergency).length);
const emergencyPercentage = computed(() =>
    filteredReports.value.length ? Math.round((emergencyCount.value / filteredReports.value.length) * 100) : 0
);
const activeUsersCount = computed(() =>
    filteredUsers.value.filter((item) => Date.now() - item.lastReportAt < 24 * 60 * 60 * 1000).length
);
const totalReports = computed(() => reports.value.length);
const totalUsers = computed(() => users.value.length);

const categoryBreakdown = computed(() => {
    const map = new Map();
    reports.value.forEach((report) => {
        const key = report.categoryKey;
        if (!map.has(key)) {
            map.set(key, { key, label: key, count: 0, color: report.categoryColor });
        }
        map.get(key).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
});

const userBreakdown = computed(() => {
    const map = new Map();
    users.value.forEach((user) => {
        const key = user.role || 'user';
        if (!map.has(key)) {
            map.set(key, { key, label: key.toUpperCase(), count: 0 });
        }
        map.get(key).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
});
</script>

<style scoped>
.map-shell {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.summary-chips {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}

.chip {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 8px 14px;
    background: white;
    cursor: pointer;
    text-align: left;
}

.chip.active {
    border-color: #2563eb;
    background: #eef2ff;
}

.chip-label {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
}

.chip-value {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
}

.map-and-panel {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
}

.map-container {
    width: 100%;
    height: 520px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.side-panel {
    background: white;
    border-radius: 20px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
}

.stat-card {
    background: #f8fafc;
    border-radius: 14px;
    padding: 12px;
}

.stat-card .label {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
}

.stat-card .value {
    margin: 2px 0 0;
    font-size: 22px;
    font-weight: 700;
}

.breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.breakdown-item {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    cursor: pointer;
}

.breakdown-item.active {
    border-color: #2563eb;
    background: #eef2ff;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #2563eb;
}

.dot.user {
    background: #059669;
}

.info-window {
    min-width: 180px;
}

.info-title {
    margin: 0 0 4px;
    font-weight: 600;
}

.info-meta {
    margin: 0;
    font-size: 13px;
    color: #475569;
}

.info-meta.small {
    font-size: 12px;
    color: #94a3b8;
}

.item-title {
    margin: 0;
    font-weight: 600;
}

.item-meta {
    margin: 2px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.map-error {
    padding: 10px 16px;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background: #fff1f2;
    color: #b91c1c;
    font-weight: 600;
}

.ghost {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 12px;
    background: transparent;
    font-weight: 600;
    cursor: pointer;
}

.muted {
    color: #94a3b8;
    margin: 4px 0 0;
}

.eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 12px;
    color: #94a3b8;
}

.eyebrow.small {
    letter-spacing: 0.2em;
}

@media (max-width: 960px) {
    .map-and-panel {
        grid-template-columns: 1fr;
    }
    .map-container {
        height: 400px;
    }
}
</style>
.map-marker {
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    background: #2563eb;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    box-shadow: 0 6px 12px rgba(15, 23, 42, 0.25);
}

.map-marker span {
    transform: rotate(45deg);
}

.map-marker.users {
    background: #059669;
}
