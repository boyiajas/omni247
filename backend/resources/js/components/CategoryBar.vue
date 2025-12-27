<template>
  <div class="category-bar">
    <div class="category-container">
      <button
        v-for="category in categories"
        :key="category.slug"
        class="category-chip"
        :class="{ active: selectedCategory === category.slug }"
        @click="selectCategory(category.slug)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['category-change']);
const selectedCategory = ref('all');

const selectCategory = (slug) => {
  selectedCategory.value = slug;
  emit('category-change', slug);
};
</script>

<style scoped>
.category-bar {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 0;
  position: sticky;
  top: 56px;
  z-index: 100;
}

.category-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-container::-webkit-scrollbar {
  display: none;
}

.category-chip {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.category-chip:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.category-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}
</style>
