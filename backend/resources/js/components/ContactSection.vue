<template>
  <section id="contact" class="contact-section">
    <div class="contact-container">
      <div class="contact-card">
        <div class="contact-text">
          <h2>Need help or a partnership?</h2>
          <p>
            Reach out to our support team or request an agency onboarding.
            We respond within one business day.
          </p>
        </div>
        <div class="contact-actions">
          <a class="contact-btn primary" href="mailto:support@omni247.com">Email Support</a>
          <a class="contact-btn outline" href="/client-login">Client Portal</a>
        </div>
      </div>
      <div class="contact-meta">
        <div class="meta-item">
          <span class="meta-label">Support</span>
          <span class="meta-value">support@omni247.com</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Agency onboarding</span>
          <span class="meta-value">partners@omni247.com</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Hours</span>
          <span class="meta-value">Mon–Fri, 08:00–18:00</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.contact-section {
  padding: 40px 16px 56px;
  background: #f8fafc;
}

.contact-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}

.contact-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.contact-text h2 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.contact-text p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

.contact-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.contact-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.contact-btn.primary {
  background: #2563eb;
  color: #ffffff;
}

.contact-btn.primary:hover {
  background: #1d4ed8;
}

.contact-btn.outline {
  background: #ffffff;
  color: #2563eb;
  border-color: #2563eb;
}

.contact-btn.outline:hover {
  background: #eff6ff;
}

.contact-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  padding: 0 4px;
}

.meta-item {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
}

.meta-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 13px;
  color: #0f172a;
}

@media (max-width: 900px) {
  .contact-card {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .contact-actions {
    width: 100%;
    flex-direction: column;
  }

  .contact-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
