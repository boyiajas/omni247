<template>
  <div class="privacy-page">
    <LandingHeader />

    <main class="page-body">
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
          <p>You can manage your profile information within the app settings. You can also request account deletion and associated data deletion through our dedicated web page at <a href="https://omni-247.com/account-deletion">https://omni-247.com/account-deletion</a>.</p>
        </section>

        <section>
          <h2>6. Account Deletion</h2>
          <p>If you created an Omni247 account, you may request deletion of your account and associated personal data. We may retain limited records when required for fraud prevention, security, dispute resolution, or legal compliance.</p>
          <p>To submit a deletion request, use our account deletion page: <a href="https://omni-247.com/account-deletion">https://omni-247.com/account-deletion</a>.</p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
          <p class="contact-info">
            Email: support@omni247.com<br>
            Website: https://omni-247.com
          </p>
        </section>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup>
import LandingHeader from '@/components/LandingHeader.vue';
import LandingFooter from '@/components/LandingFooter.vue';
</script>

<style scoped>
.privacy-page {
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-body {
  flex: 1;
  padding: 40px 16px;
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
