import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import useThemedStyles from '../theme/useThemedStyles';

const SplashScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
    },
    logo: {
      width: 150,
      height: 150,
    },
  }));

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;
