module.exports = ({ config }) => ({
  ...config,
  scheme: 'cogniscan',
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}),
  },
  plugins: [...(config.plugins || []), 'expo-notifications', 'expo-local-authentication'],
});
