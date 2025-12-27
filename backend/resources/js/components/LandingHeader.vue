<template>
  <header class="landing-header">
    <div class="header-container">
      <div class="logo-section">
        <div class="brand">
          <img src="/images/omni247-logo.png" alt="Omni247" class="logo" />
          <span class="brand-name">Omni247</span>
        </div>
      </div>
      
      <nav class="nav-links">
        <a href="#features" class="nav-link">Features</a>
        <a href="#about" class="nav-link">About</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
      
      <div class="portal-buttons">
        <router-link to="/client-login" class="btn btn-outline">Client Portal</router-link>
        <router-link to="/admin-login" class="btn btn-primary">Admin Portal</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.landing-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 40px;
  width: auto;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  font-size: 14px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2563eb;
}

.portal-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.btn-outline:hover {
  background: #eff6ff;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .portal-buttons {
    gap: 8px;
  }
  
  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
