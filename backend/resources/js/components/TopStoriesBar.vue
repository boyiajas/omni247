<template>
  <section class="top-stories-bar">
    <div class="stories-container">
      <div class="stories-scroll">
        <a
          v-for="(category, index) in categories"
          :key="index"
          :href="category.link"
          class="story-link"
          :class="{ active: activeCategory === category.id }"
          @click="handleCategoryClick(category, $event)"
        >
          {{ category.title }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const activeCategory = ref('trending');

const categories = [
  { id: 'trending', title: 'Trending', link: '#trending' },
  { id: 'high-priority', title: 'High Priority', link: '#high-priority' },
  { id: 'news', title: 'News', link: '#news' },
  { id: 'positive', title: 'Positive', link: '#positive' },
];

const handleCategoryClick = (category, event) => {
  event.preventDefault();
  activeCategory.value = category.id;
  // Could emit event to parent or filter content based on category
};
</script>

<style scoped>
.top-stories-bar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.stories-container {
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.stories-scroll {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 12px 16px;
}

.stories-scroll::-webkit-scrollbar {
  display: none;
}

.story-link {
  flex-shrink: 0;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  text-decoration: none;
  white-space: nowrap;
  border-right: 1px solid #e2e8f0;
  transition: all 0.2s;
  position: relative;
}

.story-link:last-child {
  border-right: none;
}

.story-link:hover {
  color: #2563eb;
  background: #f8fafc;
}

.story-link.active {
  color: #2563eb;
  font-weight: 600;
}

.story-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #2563eb;
  transition: all 0.3s;
  transform: translateX(-50%);
}

.story-link:hover::after,
.story-link.active::after {
  width: 80%;
}

@media (max-width: 768px) {
  .story-link {
    padding: 8px 20px;
    font-size: 13px;
  }
}
</style>
