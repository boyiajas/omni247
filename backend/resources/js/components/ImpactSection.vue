<template>
  <section id="impact" class="impact-section">
    <div class="impact-container">
      <div class="impact-copy">
        <span class="impact-eyebrow">Impact snapshot</span>
        <h2 class="impact-title">Make every report count.</h2>
        <p class="impact-text">
          Omni247 helps communities surface what matters and gives agencies a single, trusted
          stream of incident intelligence. Track response speed, reduce false positives, and
          keep residents informed.
        </p>
        <div class="impact-list">
          <div class="impact-item">
            <span class="impact-icon">⚡</span>
            <div>
              <h4>Faster verification</h4>
              <p>Multi-source validation reduces noise and highlights urgency.</p>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-icon">📍</span>
            <div>
              <h4>Location-first alerts</h4>
              <p>Give residents accurate, nearby updates with smarter routing.</p>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-icon">🧠</span>
            <div>
              <h4>Trend intelligence</h4>
              <p>Spot emerging issues before they escalate.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="impact-panel">
        <div class="metric">
          <span class="metric-value">24/7</span>
          <span class="metric-label">Coverage</span>
        </div>
        <div class="metric">
          <span class="metric-value">1 tap</span>
          <span class="metric-label">To alert nearby users</span>
        </div>
        <div class="metric">
          <span class="metric-value">Trusted</span>
          <span class="metric-label">Verification workflow</span>
        </div>
        <div class="metric wide">
          <span class="metric-label">Built for responders, citizens, and agencies.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.impact-section {
  padding: 48px 16px;
  background: #0f172a;
  color: #ffffff;
}

.impact-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 32px;
  align-items: center;
}

.impact-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #93c5fd;
  font-weight: 700;
  margin-bottom: 12px;
  display: inline-block;
}

.impact-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 14px;
}

.impact-text {
  font-size: 16px;
  color: #cbd5f5;
  line-height: 1.6;
  margin-bottom: 20px;
}

.impact-list {
  display: grid;
  gap: 12px;
}

.impact-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.impact-icon {
  font-size: 20px;
}

.impact-item h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.impact-item p {
  font-size: 13px;
  color: #cbd5f5;
}

.impact-panel {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(15, 23, 42, 0.4));
  border-radius: 16px;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.metric {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.metric-label {
  font-size: 12px;
  color: #cbd5f5;
}

.metric.wide {
  grid-column: 1 / -1;
  text-align: left;
}

@media (max-width: 960px) {
  .impact-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .impact-title {
    font-size: 24px;
  }
}
</style>
