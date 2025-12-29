import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skipButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 1,
      padding: 10,
    },
    skipText: {
      color: colors.neutralMedium,
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.neutralLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
    },
    icon: {
      fontSize: 50,
    },
    title: {
      color: colors.neutralDark,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      color: colors.neutralMedium,
      textAlign: 'center',
      lineHeight: 24,
    },
    footer: {
      padding: 30,
      alignItems: 'center',
    },
    pagination: {
      flexDirection: 'row',
      marginBottom: 30,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 50,
      borderRadius: 25,
    },
    nextButtonText: {
      color: colors.white,
      fontWeight: '600',
    },
  }));

  const onboardingData = [
    {
      id: '1',
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
      description: t('onboarding.slide1.description'),
      icon: '🌍',
    },
    {
      id: '2',
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
      description: t('onboarding.slide2.description'),
      icon: '📱',
    },
    {
      id: '3',
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
      description: t('onboarding.slide3.description'),
      icon: '⭐',
    },
    {
      id: '4',
      title: t('onboarding.slide4.title'),
      subtitle: t('onboarding.slide4.subtitle'),
      description: t('onboarding.slide4.description'),
      icon: '🔒',
    },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Welcome');
    }
  };

  const handleSkip = () => {
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? colors.primary : colors.neutralLight },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
