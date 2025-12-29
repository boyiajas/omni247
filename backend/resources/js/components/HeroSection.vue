<template>
  <section class="hero-section">
    <div class="hero-background">
      <!-- Digital world map pattern -->
      <div class="world-map-bg"></div>
      <div class="hero-overlay"></div>
    </div>
    
    <div class="hero-container">
      <div class="hero-content">
        <span class="hero-eyebrow">Mobile incident intelligence</span>
        <h1 class="hero-title">See what is happening. Report what matters.</h1>
        <p class="hero-subtitle">
          Omni247 turns community reports into verified, location-accurate alerts for safer neighborhoods.
          Share incidents with media, track updates, and stay informed in real time.
        </p>

        <div class="hero-points">
          <div class="point-item">Verified reports and credibility scoring</div>
          <div class="point-item">Anonymous or public submissions</div>
          <div class="point-item">Agency response coordination</div>
        </div>

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
          <a href="#features" class="btn btn-large btn-outline">Explore Features</a>
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

.hero-eyebrow {
  display: inline-block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
  font-weight: 700;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 18px;
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
  margin: 28px 0 32px;
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

.hero-points {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.point-item {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

  .hero-points {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-large {
    padding: 12px 24px;
  }
}
</style>
