import { Stack } from 'expo-router';

export default function CognitiveExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Cognitive Exercises',
        }}
      />
      <Stack.Screen
        name="memory-matrix"
        options={{
          title: 'Memory Matrix',
        }}
      />
      <Stack.Screen
        name="pattern-match"
        options={{
          title: 'Pattern Match',
        }}
      />
      <Stack.Screen
        name="emotion-puzzle"
        options={{
          title: 'Emotion Puzzle',
        }}
      />
      <Stack.Screen
        name="breathing-exercise"
        options={{
          title: 'Breathing Exercise',
        }}
      />
      <Stack.Screen
        name="word-association"
        options={{
          title: 'Word Association',
        }}
      />
    </Stack>
  );
} 