<template>
  <div class="landing-page">
    <LandingHeader />
    <HeroSection :stats="stats" />
    <TopStoriesBar />
    <FeaturedSection />
    <TrendingSection />
    <HowItWorksSection />
    <CategoryBar :categories="categories" @category-change="handleCategoryChange" />
    <NewsGrid :reports="reports" :loading="loading" />
    <FeaturesSection />
    <ImpactSection />
    <AppShowcaseSection />
    <AboutSection />
    <CTABanner :stats="stats" />
    <ContactSection />
    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LandingHeader from '../components/LandingHeader.vue';
import HeroSection from '../components/HeroSection.vue';
import TopStoriesBar from '../components/TopStoriesBar.vue';
import FeaturedSection from '../components/FeaturedSection.vue';
import TrendingSection from '../components/TrendingSection.vue';
import HowItWorksSection from '../components/HowItWorksSection.vue';
import CategoryBar from '../components/CategoryBar.vue';
import NewsGrid from '../components/NewsGrid.vue';
import FeaturesSection from '../components/FeaturesSection.vue';
import ImpactSection from '../components/ImpactSection.vue';
import AppShowcaseSection from '../components/AppShowcaseSection.vue';
import CTABanner from '../components/CTABanner.vue';
import AboutSection from '../components/AboutSection.vue';
import ContactSection from '../components/ContactSection.vue';
import LandingFooter from '../components/LandingFooter.vue';

const stats = ref({});
const categories = ref([]);
const reports = ref([]);
const loading = ref(false);
const selectedCategory = ref('all');

const fetchStats = async () => {
  try {
    const response = await fetch('/api/public/stats');
    const data = await response.json();
    if (data.success) {
      stats.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/public/categories');
    const data = await response.json();
    if (data.success) {
      categories.value = [
        { id: 'all', name: 'All', slug: 'all' },
        ...data.data
      ];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const fetchReports = async (category = 'all') => {
  loading.value = true;
  try {
    const url = category === 'all' 
      ? '/api/public/reports' 
      : `/api/public/reports?category=${category}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.success) {
      reports.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = (category) => {
  selectedCategory.value = category;
  fetchReports(category);
};

onMounted(() => {
  fetchStats();
  fetchCategories();
  fetchReports();
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #ffffff;
}
</style>
