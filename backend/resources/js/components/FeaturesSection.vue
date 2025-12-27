<template>
  <section id="features" class="features-section">
    <div class="features-container">
      <h2 class="section-title">Powerful Features</h2>
      <p class="section-subtitle">Everything you need to report and track incidents</p>
      
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon">📸</div>
          <h3 class="feature-title">Photo Evidence</h3>
          <p class="feature-desc">Capture incidents with photos and videos for accurate reporting</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">📍</div>
          <h3 class="feature-title">GPS Tracking</h3>
          <p class="feature-desc">Automatic location tagging ensures precision</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">🔔</div>
          <h3 class="feature-title">Real-time Updates</h3>
          <p class="feature-desc">Get notified about incidents near you instantly</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">💬</div>
          <h3 class="feature-title">Community Engagement</h3>
          <p class="feature-desc">Comment, rate, and engage with other users</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">🔒</div>
          <h3 class="feature-title">Privacy Controls</h3>
          <p class="feature-desc">Report anonymously or publicly - you choose</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">Analytics</h3>
          <p class="feature-desc">Track trends and patterns in your area</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.features-section {
  padding: 32px 16px;
  background: #f8fafc;
}

.features-container {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.feature {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s;
}

.feature:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
