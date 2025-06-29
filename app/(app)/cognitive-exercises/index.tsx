import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const EXERCISES = [
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Improve your spatial memory and concentration',
    icon: 'memory',
    color: '#3B82F6',
    level: 'Beginner',
    benefits: ['Memory', 'Focus', 'Spatial Awareness']
  },
  {
    id: 'pattern-match',
    title: 'Pattern Match',
    description: 'Enhance cognitive flexibility and pattern recognition',
    icon: 'pattern',
    color: '#4F46E5',
    level: 'Intermediate',
    benefits: ['Pattern Recognition', 'Speed', 'Attention']
  },
  {
    id: 'emotion-puzzle',
    title: 'Emotion Puzzle',
    description: 'Develop emotional intelligence and mindfulness',
    icon: 'psychology',
    color: '#EC4899',
    level: 'All Levels',
    benefits: ['Emotional Intelligence', 'Empathy', 'Self-awareness']
  },
  {
    id: 'breathing-exercise',
    title: 'Breathing Exercise',
    description: 'Practice stress management and relaxation',
    icon: 'self-improvement',
    color: '#10B981',
    level: 'All Levels',
    benefits: ['Stress Relief', 'Focus', 'Calmness']
  },
  {
    id: 'word-association',
    title: 'Word Association',
    description: 'Improve cognitive flexibility and creativity',
    icon: 'psychology-alt',
    color: '#F59E0B',
    level: 'Advanced',
    benefits: ['Creativity', 'Vocabulary', 'Mental Flexibility']
  },
];

export default function CognitiveExercises() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#3B82F6', '#4F46E5']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Cognitive Exercises</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Train your brain with scientifically designed exercises
        </Text>

        {EXERCISES.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => router.push(`/cognitive-exercises/${exercise.id}`)}
          >
            <View style={[styles.iconContainer, { backgroundColor: exercise.color }]}>
              <MaterialIcons name={exercise.icon} size={32} color="white" />
            </View>
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{exercise.level}</Text>
                </View>
              </View>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              <View style={styles.benefitsContainer}>
                {exercise.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitBadge}>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  exerciseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    color: 'white',
  },
}); 