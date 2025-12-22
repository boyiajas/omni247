import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useCategories from '../../hooks/useCategories';

export default function ReportCategoryScreen({ navigation }) {
  const { categories } = useCategories();

  const handleCategorySelect = (category) => {
    navigation.navigate('ReportMedia', { category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What would you like to report?</Text>
        <Text style={styles.headerSubtitle}>Select a category for your report</Text>
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
          <Text style={styles.continueButtonText}>Continue</Text>
          <Icon name="arrow-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutralDark,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.neutralMedium,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralLight,
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
    color: colors.neutralDark,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  continueButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginRight: 8,
  },
});
