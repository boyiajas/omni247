<template>
  <section id="news" class="news-grid-section">
    <div class="news-container">
      <div class="section-header">
        <h2 class="section-title">Latest Reports</h2>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading reports...</p>
      </div>

      <div v-else-if="reports.length === 0" class="empty-state">
        <p>No reports found</p>
      </div>
      
      <div v-else class="grid">
        <ReportCard
          v-for="report in reports"
          :key="report.id"
          :report="report"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import ReportCard from './ReportCard.vue';

defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.news-grid-section {
  padding: 24px 16px;
  background: #ffffff;
}

.news-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.loading-state,
.empty-state {
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
  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
