module.exports = {
  project: {
    ios: {},
    android: {
      sourceDir: './android',
      appName: 'app',
      manifestPath: 'app/src/main/AndroidManifest.xml',
      packageName: 'com.omni247.app',
    },
  },
  assets: ['./src/assets/fonts/', './src/assets/sounds/'],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
};
