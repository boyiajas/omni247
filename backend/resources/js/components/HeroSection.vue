<template>
  <section class="hero-section">
    <div class="hero-background">
      <!-- Digital world map pattern -->
      <div class="world-map-bg"></div>
      <div class="hero-overlay"></div>
    </div>
    
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Report. Track. Engage.</h1>
        <p class="hero-subtitle">
          Community-powered incident reporting for safer cities
        </p>
        
        <div class="stats-row">
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
        
        <div class="cta-buttons">
          <a href="#news" class="btn btn-large btn-primary">Browse Reports</a>
          <a href="#features" class="btn btn-large btn-outline">Learn More</a>
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
.hero-section {
  position: relative;
  color: #ffffff;
  padding: 48px 16px;
  overflow: hidden;
  min-height: 400px;
}

.hero-background {
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
  opacity: 0.3;
  filter: blur(1px);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%);
  opacity: 0.9;
}

.hero-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 32px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 32px;
  padding: 24px 0;
}

.stat {
  text-align: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.stat:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 6px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-large {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.btn-primary {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .stats-row {
    gap: 24px;
    flex-wrap: wrap;
  }
  
  .stat {
    padding: 10px 16px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .btn-large {
    padding: 12px 24px;
  }
}
</style>
