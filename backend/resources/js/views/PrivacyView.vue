<template>
  <div class="privacy-page">
    <nav class="simple-nav">
      <router-link to="/" class="back-link">← Back to Home</router-link>
      <div class="logo">Omni247</div>
    </nav>

    <div class="content-container">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last Updated: April 2026</p>

      <section>
        <h2>1. Introduction</h2>
        <p>Omni247 ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use the Omni247 mobile application and our website.</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Location Data</h3>
        <p>We collect precise location data through our mobile application to allow you to report incidents accurately on our community map. This is essential for the core functionality of the service.</p>
        
        <h3>2.2 Media Content</h3>
        <p>We collect photos and videos that you voluntarily upload while submitting incident reports. This media is used to verify and document reported events.</p>

        <h3>2.3 User Account Data</h3>
        <p>When you register, we collect your name, email address, and phone number to manage your account and facilitate secure communication.</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the Omni247 services.</li>
          <li>To display incident reports on the interactive community map.</li>
          <li>To verify report authenticity through our moderation systems.</li>
          <li>To send critical safety alerts and updates regarding your reports.</li>
          <li>To improve the app's performance and user experience.</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal data. Because Omni247 is a community safety tool, incident report data (including the specific location and attached media) is shared publicly on the map for transparency and community awareness.</p>
      </section>

      <section>
        <h2>5. Your Rights and Choices</h2>
        <p>You can manage your profile information within the app settings. You have the right to request the deletion of your account and all associated personal data by contacting our support team.</p>
      </section>

      <section>
        <h2>6. Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
        <p class="contact-info">
          Email: support@omni-247.com<br>
          Website: https://omni-247.com
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
// Minimal logic for the static page
</script>

<style scoped>
.privacy-page {
  background: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
}

.simple-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.back-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.logo {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.content-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #0f172a;
}

.last-updated {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 32px;
}

h2 {
  font-size: 22px;
  margin: 32px 0 16px;
  color: #0f172a;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 8px;
}

h3 {
  font-size: 18px;
  margin: 20px 0 12px;
  color: #334155;
}

p, li {
  line-height: 1.6;
  margin-bottom: 16px;
  color: #475569;
}

ul {
  padding-left: 20px;
}

.contact-info {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .simple-nav {
    padding: 15px 20px;
  }
  .content-container {
    margin: 0;
    border-radius: 0;
    padding: 24px;
  }
}
</style>
