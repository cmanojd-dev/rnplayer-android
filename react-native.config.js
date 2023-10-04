module.exports = {
  dependencies: {
    'react-native-video': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-video/android-exoplayer',
        },
      },
    },
    expo: {
      platforms: {
        android: null,
        ios: null,
        macos: null,
      },
    },
  },
};
