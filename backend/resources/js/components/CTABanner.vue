<template>
  <section class="cta-banner">
    <div class="banner-background">
      <div class="world-map-bg"></div>
      <div class="banner-overlay"></div>
    </div>
    
    <div class="banner-container">
      <div class="banner-content">
        <div class="banner-text">
          <h2 class="banner-title">Get the Omni247 mobile app</h2>
          <p class="banner-subtitle">Submit verified reports with media and receive alerts where you are.</p>
        </div>
        
        <div class="banner-stats">
          <div class="stat">
            <div class="stat-value">{{ formatNumber(stats.total_reports) }}</div>
            <div class="stat-label">Reports</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ formatNumber(stats.active_users) }}</div>
            <div class="stat-label">Users</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.cities_covered }}</div>
            <div class="stat-label">Cities</div>
          </div>
        </div>
        
        <div class="banner-cta">
          <a href="#news" class="btn btn-primary">Browse Reports</a>
          <a href="/client-login" class="btn btn-outline">Client Portal</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
});

const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};
</script>

<style scoped>
.cta-banner {
  position: relative;
  color: #ffffff;
  padding: 48px 16px;
  overflow: hidden;
  margin-top: 32px;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.world-map-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/images/world-map-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.25;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%);
  opacity: 0.95;
}

.banner-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.banner-text {
  flex: 1;
  min-width: 280px;
}

.banner-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.banner-stats {
  display: flex;
  gap: 32px;
  padding: 0 20px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.banner-cta {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary {
  background: #ffffff;
  color: #1e40af;
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-outline {
  background: transparent;
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
  transform: translateY(-2px);
}

@media (max-width: 968px) {
  .cta-banner {
    padding: 32px 16px;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-text {
    text-align: center;
  }
  
  .banner-title {
    font-size: 24px;
  }
  
  .banner-stats {
    justify-content: center;
    gap: 24px;
    padding: 0;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .banner-cta {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .banner-stats {
    gap: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .banner-cta {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
