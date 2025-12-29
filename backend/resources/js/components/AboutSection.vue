<template>
  <section id="about" class="about-section">
    <div class="about-container">
      <div class="about-copy">
        <span class="eyebrow">Why Omni247</span>
        <h2 class="about-title">A safer city starts with verified, local insight.</h2>
        <p class="about-text">
          Omni247 turns community reports into trusted, geo-tagged updates that help residents,
          agencies, and responders coordinate faster. Every report is time-stamped, mapped, and
          built for clarity so you can act with confidence.
        </p>
        <div class="about-points">
          <div class="point">
            <span class="point-icon">✅</span>
            <span>Verification workflow reduces noise and duplicates.</span>
          </div>
          <div class="point">
            <span class="point-icon">🧭</span>
            <span>Precise location context for smarter decisions.</span>
          </div>
          <div class="point">
            <span class="point-icon">🤝</span>
            <span>Two-way engagement between communities and agencies.</span>
          </div>
        </div>
      </div>

      <div class="about-panel">
        <div class="panel-card">
          <h3>Built for the mobile app</h3>
          <p>Capture incidents with media, add context, and get updates in seconds.</p>
        </div>
        <div class="panel-card">
          <h3>Real-time visibility</h3>
          <p>Live alerts, trending hotspots, and rapid response coordination.</p>
        </div>
        <div class="panel-card">
          <h3>Privacy by design</h3>
          <p>Anonymous reporting with clear controls for visibility.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  padding: 48px 16px;
  background: #ffffff;
}

.about-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 32px;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #2563eb;
  margin-bottom: 12px;
}

.about-title {
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  line-height: 1.2;
}

.about-text {
  font-size: 16px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 20px;
}

.about-points {
  display: grid;
  gap: 10px;
}

.point {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
}

.point-icon {
  font-size: 16px;
}

.about-panel {
  display: grid;
  gap: 16px;
}

.panel-card {
  padding: 18px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.panel-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
}

.panel-card p {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .about-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .about-section {
    padding: 36px 16px;
  }

  .about-title {
    font-size: 24px;
  }
}
</style>
