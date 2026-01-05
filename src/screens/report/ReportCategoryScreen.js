import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useCategories from '../../hooks/useCategories';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

export default function ReportCategoryScreen({ navigation }) {
  const { categories } = useCategories();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles((palette) => ({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 20,
    },
    headerTitle: {
      ...typography.h2,
      color: palette.textPrimary,
      marginBottom: 8,
    },
    headerSubtitle: {
      ...typography.body,
      color: palette.textSecondary,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
    },
    categoryCard: {
      width: '48%',
      backgroundColor: palette.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    categoryIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    categoryLabel: {
      ...typography.body,
      color: palette.textPrimary,
      fontWeight: '500',
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      borderRadius: 12,
      paddingVertical: 16,
    },
    continueButtonText: {
      ...typography.body,
      color: palette.white,
      fontWeight: '600',
      marginRight: 8,
    },
  }));

  const handleCategorySelect = (category) => {
    navigation.navigate('ReportMedia', { category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('reportFlow.categoryTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('reportFlow.categorySubtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.slug || category.backendId}
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(category)}>
            <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
              <Icon name={category.icon} size={30} color={category.color} />
            </View>
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('ReportMedia')}>
          <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
          <Icon name="arrow-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
