<template>
  <section id="featured" class="featured-section">
    <div class="featured-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="featuredReport" class="featured-layout">
        <div class="featured-main">
          <div class="featured-image-wrapper">
            <img :src="featuredReport.image || fallbackImage" :alt="featuredReport.title" class="featured-image" />
            <div class="featured-overlay">
              <span class="featured-category" :style="{ background: getCategoryColor(featuredReport.category.slug) }">
                {{ featuredReport.category.name }}
              </span>
            </div>
          </div>
          <div class="featured-content">
            <h2 class="featured-title">{{ featuredReport.title }}</h2>
            <p class="featured-excerpt">{{ truncate(featuredReport.description, 200) }}</p>
            <div class="featured-meta">
              <span class="meta-item">By {{ featuredReport.user?.name || 'Anonymous' }}</span>
              <span class="meta-divider">•</span>
              <span class="meta-item">{{ featuredReport.created_at }}</span>
              <span class="meta-divider">•</span>
              <span class="meta-item">
                <span class="icon">👁️</span> {{ formatNumber(featuredReport.views_count) }}
              </span>
              <span v-if="featuredReport.location" class="meta-divider">•</span>
              <span v-if="featuredReport.location" class="meta-item">
                <span class="icon">📍</span> {{ featuredReport.location }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="featured-sidebar">
          <h3 class="sidebar-title">More verified updates</h3>
          <div class="sidebar-stories">
            <div
              v-for="report in sideReports"
              :key="report.id"
              class="sidebar-story"
            >
              <img :src="report.image || fallbackImage" :alt="report.title" class="sidebar-thumb" />
              <div class="sidebar-content">
                <h4 class="sidebar-story-title">{{ report.title }}</h4>
                <span class="sidebar-time">{{ report.created_at }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const featuredReport = ref(null);
const sideReports = ref([]);
const loading = ref(false);
const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';

const fetchFeaturedReports = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/public/reports?limit=4');
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      featuredReport.value = data.data[0];
      sideReports.value = data.data.slice(1, 4);
    }
  } catch (error) {
    console.error('Error fetching featured:', error);
  } finally {
    loading.value = false;
  }
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getCategoryColor = (slug) => {
  const colors = {
    crime: '#EF4444',
    accident: '#EA580C',
    infrastructure: '#3B82F6',
    environment: '#10B981',
    health: '#8B5CF6',
    politics: '#9333EA',
    default: '#64748B'
  };
  return colors[slug] || colors.default;
};

onMounted(() => {
  fetchFeaturedReports();
});
</script>

<style scoped>
.featured-section {
  padding: 24px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.featured-container {
  max-width: 1400px;
  margin: 0 auto;
}

.featured-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.featured-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.featured-image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
}

.featured-category {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.featured-content {
  padding: 0 8px;
}

.featured-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 12px;
}

.featured-excerpt {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.featured-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.meta-divider {
  color: #cbd5e1;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.featured-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  padding-bottom: 12px;
  border-bottom: 2px solid #2563eb;
}

.sidebar-stories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-story {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.sidebar-story:hover {
  transform: translateX(4px);
}

.sidebar-thumb {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-story-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar-time {
  font-size: 12px;
  color: #94a3b8;
}

.loading {
  text-align: center;
  padding: 48px 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 968px) {
  .featured-layout {
    grid-template-columns: 1fr;
  }
  
  .featured-image-wrapper {
    height: 300px;
  }
  
  .featured-title {
    font-size: 24px;
  }
  
  .sidebar-title {
    margin-top: 24px;
  }
}
</style>
