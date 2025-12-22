import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, typography } from '../../theme/colors';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Global Awareness',
    subtitle: 'See Events Worldwide in Real-Time',
    description: 'Get instant access to verified events and incidents as they happen globally.',
    icon: '🌍',
  },
  {
    id: '2',
    title: 'Report Anything',
    subtitle: 'Report with Media & Precise Location',
    description: 'Upload videos, photos, audio with automatic GPS tagging and categorization.',
    icon: '📱',
  },
  {
    id: '3',
    title: 'Make an Impact',
    subtitle: 'Earn Rewards & Build Credibility',
    description: 'Get rated by community, earn points for accurate reports, and become verified.',
    icon: '⭐',
  },
  {
    id: '4',
    title: 'Privacy First',
    subtitle: 'Your Safety & Privacy Are Our Priority',
    description: 'Report anonymously, end-to-end encryption, and full control over your data.',
    icon: '🔒',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

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
        <Text style={styles.skipText}>Skip</Text>
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
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    /* ...typography.caption, */
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
    /*  ...typography.h2, */
    color: colors.neutralDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    /*  ...typography.h3, */
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    /* ...typography.body, */
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
    /* ...typography.body, */
    color: colors.white,
    fontWeight: '600',
  },
});