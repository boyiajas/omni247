<template>
  <section class="showcase-section">
    <div class="showcase-container">
      <div class="showcase-card">
        <div class="showcase-copy">
          <span class="showcase-eyebrow">Mobile experience</span>
          <h2 class="showcase-title">Built for fast reporting on the go.</h2>
          <p class="showcase-text">
            Log incidents in seconds, attach media, and watch updates flow across the map. The
            Omni247 app keeps you informed with real-time alerts and credibility signals.
          </p>
          <div class="showcase-tags">
            <span>Live alerts</span>
            <span>Map-first reports</span>
            <span>Privacy controls</span>
            <span>Community rating</span>
          </div>
        </div>
        <div class="showcase-visual">
          <div class="phone-frame">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="screen-header">Global Eye</div>
              <div class="screen-card">
                <span class="badge">Trending</span>
                <div class="screen-title">Road Block on N2</div>
                <div class="screen-meta">12 mins ago · 3 km away</div>
              </div>
              <div class="screen-card muted">
                <div class="screen-title">Power outage reported</div>
                <div class="screen-meta">Verified · 25 mins ago</div>
              </div>
            </div>
          </div>
          <div class="showcase-glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.showcase-section {
  padding: 48px 16px;
  background: #ffffff;
}

.showcase-container {
  max-width: 1400px;
  margin: 0 auto;
}

.showcase-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 28px;
  align-items: center;
  background: #f8fafc;
  border-radius: 18px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.showcase-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.15), transparent 50%);
  pointer-events: none;
}

.showcase-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #2563eb;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 12px;
}

.showcase-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}

.showcase-text {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 18px;
}

.showcase-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.showcase-tags span {
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
}

.showcase-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.phone-frame {
  width: 220px;
  height: 420px;
  background: #0f172a;
  border-radius: 28px;
  padding: 18px 12px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  position: relative;
  z-index: 1;
}

.phone-notch {
  width: 80px;
  height: 10px;
  background: #1e293b;
  border-radius: 8px;
  margin: 0 auto 14px;
}

.phone-screen {
  background: #ffffff;
  height: calc(100% - 30px);
  border-radius: 18px;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.screen-header {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.screen-card {
  background: #eff6ff;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #dbeafe;
}

.screen-card.muted {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: #ef4444;
  padding: 3px 8px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.screen-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.screen-meta {
  font-size: 11px;
  color: #64748b;
}

.showcase-glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25), transparent 70%);
  filter: blur(20px);
  top: 50%;
  left: 50%;
  transform: translate(-20%, -40%);
}

@media (max-width: 960px) {
  .showcase-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .showcase-visual {
    margin-top: 20px;
  }
}

@media (max-width: 640px) {
  .showcase-card {
    padding: 24px;
  }

  .showcase-title {
    font-size: 24px;
  }
}
</style>
