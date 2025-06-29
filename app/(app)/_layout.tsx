import { Tabs } from 'expo-router';
import { Brain, MessageCircle, Siren, Dumbbell, Lotus, Moon, Sun, Users } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="emotion-tracker"
        options={{
          title: 'Emotions',
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat-support"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cognitive-exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: 'Meditate',
          tabBarIcon: ({ color, size }) => <Lotus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sleep-tracker"
        options={{
          title: 'Sleep',
          tabBarIcon: ({ color, size }) => <Moon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="daily-affirmations"
        options={{
          title: 'Affirm',
          tabBarIcon: ({ color, size }) => <Sun size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="social-support"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color, size }) => <Siren size={size} color={color} />,
        }}
      />
    </Tabs>
  );
} 