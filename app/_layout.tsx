import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

// Disable error overlays and warnings in Expo Go
LogBox.ignoreLogs([
  'Network request failed',
  'TypeError: Network request failed',
  'Warning:',
  'Error:',
  'Possible Unhandled Promise Rejection',
  'Unhandled promise rejection',
]);

// Disable error overlay completely
if (__DEV__) {
  LogBox.ignoreAllLogs();
}

export default function RootLayout() {
  useEffect(() => {
    // Disable error overlays on mount
    if (__DEV__) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Only log to console, don't show overlay
        originalConsoleError.apply(console, args);
      };

      // Global error handler to suppress error overlays
      const originalError = global.Error;
      global.Error = function(...args) {
        const error = new originalError(...args);
        // Don't show overlay, just log
        console.log('Error caught and suppressed:', error.message);
        return error;
      };

      // Handle unhandled promise rejections
      const originalUnhandledRejection = global.onunhandledrejection;
      global.onunhandledrejection = (event) => {
        console.log('Unhandled promise rejection suppressed:', event.reason);
        event.preventDefault();
      };
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#000' }
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
