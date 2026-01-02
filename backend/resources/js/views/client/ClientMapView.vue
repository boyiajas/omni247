<template>
    <ClientLayout>
        <div class="page-header">
            <h1>Map</h1>
            <p>View reports on the map</p>
        </div>
        <div class="card">
            <div class="card-body">
                <div v-if="mapError" class="map-error">{{ mapError }}</div>
                <div ref="mapContainer" class="map-container"></div>
            </div>
        </div>
    </ClientLayout>
</template>

<script>
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout.vue';
export default {
    name: 'ClientMapView',
    components: { ClientLayout },
    data() {
        return {
            map: null,
            mapError: '',
            markers: [],
        };
    },
    async mounted() {
        await this.initMap();
    },
    beforeUnmount() {
        this.clearMarkers();
    },
    methods: {
        async initMap() {
            try {
                await this.loadGoogleMaps();
                this.map = new window.google.maps.Map(this.$refs.mapContainer, {
                    center: { lat: 6.5244, lng: 3.3792 },
                    zoom: 6,
                    mapTypeControl: false,
                    streetViewControl: false,
                });
                await this.loadReports();
            } catch (error) {
                this.mapError = error.message || 'Unable to load Google Maps.';
            }
        },
        loadGoogleMaps() {
            if (window.google && window.google.maps) {
                return Promise.resolve();
            }
            const key = window.GOOGLE_MAPS_KEY || '';
            if (!key) {
                return Promise.reject(new Error('Missing Google Maps API key.'));
            }
            return new Promise((resolve, reject) => {
                const existing = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
                if (existing) {
                    existing.addEventListener('load', resolve);
                    existing.addEventListener('error', reject);
                    return;
                }
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=maps`;
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        },
        async loadReports() {
            const response = await axios.get('/client/api/reports', { params: { limit: 200 } });
            const reports = response.data?.data || [];
            this.clearMarkers();
            reports.forEach((report) => {
                if (!report.latitude || !report.longitude) return;
                const marker = new window.google.maps.Marker({
                    map: this.map,
                    position: { lat: Number(report.latitude), lng: Number(report.longitude) },
                    title: report.title,
                });
                const infoWindow = new window.google.maps.InfoWindow({
                    content: `<div><strong>${report.title}</strong><br/>${report.address || 'Unknown location'}</div>`,
                });
                marker.addListener('click', () => infoWindow.open(this.map, marker));
                this.markers.push(marker);
            });
        },
        clearMarkers() {
            this.markers.forEach((marker) => marker.setMap(null));
            this.markers = [];
        },
    },
};
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 420px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.map-error {
    padding: 12px;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 12px;
    margin-bottom: 12px;
}
</style>
