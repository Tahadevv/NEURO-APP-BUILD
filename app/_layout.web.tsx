import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function WebLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
          contentStyle: { backgroundColor: '#000' }
        }}
      />
    </View>
  );
} 