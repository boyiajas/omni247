<template>
  <div class="report-card">
    <div class="card-image">
      <img :src="report.image || fallbackImage" :alt="report.title" />
      <div class="category-badge" :style="{ background: getCategoryColor(report.category.slug) }">
        {{ report.category.name }}
      </div>
      <div v-if="report.is_trending" class="trending-badge">
        🔥 TRENDING
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ report.title }}</h3>
      <p class="card-description">{{ truncate(report.description, 100) }}</p>
      
      <div class="card-meta">
        <div class="meta-item">
          <span class="icon">📍</span>
          <span class="text">{{ report.location }}</span>
        </div>
        <div class="meta-item">
          <span class="icon">🕐</span>
          <span class="text">{{ report.created_at }}</span>
        </div>
      </div>
      
      <div class="card-footer">
        <div class="stats">
          <span class="stat">
            <span class="icon">👁️</span> {{ report.views_count }}
          </span>
          <span class="stat">
            <span class="icon">💬</span> {{ report.comments_count }}
          </span>
          <span class="stat">
            <span class="icon">⭐</span> {{ report.rating }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  report: {
    type: Object,
    required: true
  }
});

const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const getCategoryColor = (slug) => {
  const colors = {
    crime: '#EF4444',
    accident: '#EA580C',
    infrastructure: '#3B82F6',
    environment: '#10B981',
    health: '#8B5CF6',
    default: '#64748B'
  };
  return colors[slug] || colors.default;
};
</script>

<style scoped>
.report-card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  border-radius: 12px;
  text-transform: uppercase;
}

.trending-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  background: #EF4444;
  color: #ffffff;
  border-radius: 12px;
}

.card-content {
  padding: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.meta-item .icon {
  font-size: 14px;
}

.card-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.stat .icon {
  font-size: 14px;
}
</style>
