<template>
  <section id="how-it-works" class="how-section">
    <div class="how-container">
      <div class="how-header">
        <span class="how-eyebrow">How it works</span>
        <h2 class="how-title">From report to response in minutes.</h2>
        <p class="how-subtitle">
          A clear, verified workflow keeps every update useful and actionable.
        </p>
      </div>

      <div class="how-steps">
        <div class="step-card">
          <div class="step-index">01</div>
          <h3>Capture the incident</h3>
          <p>Add photos, video, or audio with automatic GPS and timestamps.</p>
        </div>
        <div class="step-card">
          <div class="step-index">02</div>
          <h3>Verify and enrich</h3>
          <p>Moderators and community confirmations keep the feed accurate.</p>
        </div>
        <div class="step-card">
          <div class="step-index">03</div>
          <h3>Notify the right people</h3>
          <p>Alerts go out to nearby users and agency teams instantly.</p>
        </div>
        <div class="step-card">
          <div class="step-index">04</div>
          <h3>Track updates</h3>
          <p>Follow responses, closures, and verified outcomes in real time.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.how-section {
  padding: 48px 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.how-container {
  max-width: 1400px;
  margin: 0 auto;
}

.how-header {
  text-align: center;
  margin-bottom: 28px;
}

.how-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #2563eb;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 10px;
}

.how-title {
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.how-subtitle {
  font-size: 16px;
  color: #64748b;
}

.how-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.step-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  position: relative;
  overflow: hidden;
}

.step-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.18), transparent 70%);
}

.step-index {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 12px;
}

.step-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.step-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .how-title {
    font-size: 24px;
  }
}
</style>
