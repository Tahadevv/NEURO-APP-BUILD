import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
          <Slot />
        </View>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 