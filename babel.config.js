module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }]
    ],
    plugins: [
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
        },
      ],
      '@babel/plugin-proposal-export-namespace-from',
      'module:react-native-dotenv',
      'expo-router/babel'
    ],
  };
}; 