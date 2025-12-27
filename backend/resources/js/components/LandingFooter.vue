<template>
  <footer class="landing-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-column">
          <h4 class="footer-heading">Omni247</h4>
          <p class="footer-text">Community-powered incident reporting for safer cities</p>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-heading">Quick Links</h4>
          <a href="#" class="footer-link">About Us</a>
          <a href="#" class="footer-link">How It Works</a>
          <a href="#" class="footer-link">Contact</a>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-heading">Legal</h4>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <a href="#" class="footer-link">Cookie Policy</a>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-heading">Download App</h4>
          <a href="#" class="app-button">
            <span>📱</span> App Store
          </a>
          <a href="#" class="app-button">
            <span>🤖</span> Play Store
          </a>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© 2024 Omni247. All rights reserved.</p>
        <div class="social-links">
          <a href="#" class="social-icon" aria-label="Twitter">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
          </a>
          <a href="#" class="social-icon" aria-label="Facebook">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          <a href="#" class="social-icon" aria-label="Instagram">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="#1e293b" stroke-width="2"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#1e293b" stroke-width="2"/>
            </svg>
          </a>
          <a href="#" class="social-icon" aria-label="LinkedIn">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.landing-footer {
  background: #1e293b;
  color: #cbd5e1;
  padding: 32px 16px 16px;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-heading {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.footer-text {
  font-size: 13px;
  line-height: 1.5;
}

.footer-link {
  font-size: 13px;
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #ffffff;
}

.app-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #334155;
  border-radius: 6px;
  font-size: 13px;
  color: #ffffff;
  text-decoration: none;
  transition: background 0.2s;
}

.app-button:hover {
  background: #475569;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.copyright {
  font-size: 12px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #334155;
  border-radius: 50%;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
}

.social-icon:hover {
  background: #2563eb;
  color: #ffffff;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
