<template>
  <section class="trending-section">
    <div class="trending-container">
      <div class="section-header">
        <h2 class="section-title">🔥 Trending Now</h2>
        <p class="section-subtitle">Most viewed incidents by media type</p>
      </div>
      
      <!-- Media Type Tabs -->
      <div class="trending-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.type"
          class="tab-button"
          :class="{ active: activeTab === tab.type }"
          @click="activeTab = tab.type"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="filteredReports.length === 0" class="empty">
        <p>No {{ activeTabLabel }} reports at the moment</p>
      </div>
      
      <div v-else class="trending-grid">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="trending-card"
        >
          <div class="card-image-wrapper">
            <img :src="report.image || fallbackImage" :alt="report.title" class="card-bg-image" />
            <div class="card-overlay">
              <!-- Trending Badge -->
              <div class="badge-container">
                <div class="trending-badge">
                  🔥 TRENDING
                </div>
              </div>
              
              <!-- Content Overlay at Bottom -->
              <div class="card-content-overlay">
                <h3 class="overlay-title">{{ report.title }}</h3>
                <div class="overlay-location">
                  <span class="location-icon">📍</span>
                  <span class="location-text">{{ report.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const trendingReports = ref([]);
const loading = ref(false);
const activeTab = ref('image');
const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600';

const tabs = [
  { type: 'image', label: 'Images', icon: '📷' },
  { type: 'video', label: 'Videos', icon: '🎥' },
  { type: 'audio', label: 'Audio', icon: '🎵' },
];

const activeTabLabel = computed(() => {
  return tabs.find(t => t.type === activeTab.value)?.label || 'trending';
});

const filteredReports = computed(() => {
  return trendingReports.value.filter(report => {
    const mediaType = report.media_type || 'image';
    return mediaType === activeTab.value;
  }).slice(0, 6);
});

const fetchTrending = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/public/reports?limit=30');
    const data = await response.json();
    if (data.success) {
      const sortedByViews = data.data
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      
      trendingReports.value = sortedByViews;
    }
  } catch (error) {
    console.error('Error fetching trending:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTrending();
});
</script>

<style scoped>
.trending-section {
  padding: 32px 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.trending-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.section-subtitle {
  font-size: 15px;
  color: #64748b;
}

.trending-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  border-color: #2563eb;
  color: #2563eb;
  transform: translateY(-2px);
}

.tab-button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.tab-icon {
  font-size: 18px;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trending-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.trending-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.trending-card:hover .card-bg-image {
  transform: scale(1.08);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.badge-container {
  display: flex;
  justify-content: flex-start;
}

.trending-badge {
  background: #EF4444;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-content-overlay {
  color: #ffffff;
}

.overlay-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overlay-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ffffff;
  opacity: 0.95;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.location-icon {
  font-size: 14px;
}

.location-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading,
.empty {
  text-align: center;
  padding: 48px 16px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .trending-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .overlay-title {
    font-size: 16px;
  }
}
</style>
