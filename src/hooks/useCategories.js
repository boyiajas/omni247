import { useCallback, useEffect, useState } from 'react';
import categoriesAPI from '../services/api/categories';
import { categoryColors, colors } from '../theme/colors';

const FALLBACK_CATEGORIES = [
  { backendId: 1, slug: 'crime', label: 'Crime & Emergency', icon: 'shield-alert', color: categoryColors.crime },
  { backendId: 2, slug: 'accident', label: 'Accidents', icon: 'car-brake-alert', color: categoryColors.accident },
  { backendId: 3, slug: 'event', label: 'Events & Celebrations', icon: 'party-popper', color: categoryColors.event },
  { backendId: 4, slug: 'environment', label: 'Environment', icon: 'leaf', color: categoryColors.environment },
  { backendId: 5, slug: 'politics', label: 'Politics', icon: 'account-tie', color: categoryColors.politics },
  { backendId: 6, slug: 'infrastructure', label: 'Infrastructure', icon: 'road', color: categoryColors.infrastructure },
  { backendId: 7, slug: 'other', label: 'Other', icon: 'alert-circle', color: categoryColors.other },
];

const normalizeCategory = (category) => {
  if (!category) return null;
  const slug = category.slug || category.label || String(category.backendId || category.id);
  return {
    backendId: category.id ?? category.backendId ?? slug,
    id: slug,
    slug,
    label: category.name || category.label,
    name: category.name || category.label,
    icon: category.icon || 'alert-circle',
    color: category.color || categoryColors[slug] || colors.primary,
    description: category.description,
    isEmergency: Boolean(category.is_emergency || category.isEmergency),
    isActive: category.is_active !== false && category.isActive !== false,
    order: category.order ?? 0,
    original: category,
  };
};

export const DEFAULT_CATEGORIES = FALLBACK_CATEGORIES.map(normalizeCategory);

const useCategories = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      const list = Array.isArray(response.data?.data) ? response.data.data : response.data;
      if (Array.isArray(list) && list.length) {
        const normalized = list
          .map(normalizeCategory)
          .filter(Boolean)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (normalized.length) {
          setCategories(normalized);
        }
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
  };
};

export default useCategories;
