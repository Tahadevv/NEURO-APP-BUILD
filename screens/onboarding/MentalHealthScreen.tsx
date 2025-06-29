import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, ArrowLeft, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const mentalHealthGoals = [
  {
    id: 'stress',
    label: 'Reduce Stress & Anxiety',
    description: 'Learn techniques to manage daily stress',
  },
  {
    id: 'sleep',
    label: 'Improve Sleep Quality',
    description: 'Develop better sleep habits',
  },
  {
    id: 'mood',
    label: 'Enhance Mood',
    description: 'Build emotional resilience',
  },
  {
    id: 'focus',
    label: 'Boost Focus',
    description: 'Improve concentration and productivity',
  },
  {
    id: 'relationships',
    label: 'Better Relationships',
    description: 'Strengthen social connections',
  },
  {
    id: 'mindfulness',
    label: 'Practice Mindfulness',
    description: 'Live more in the present moment',
  },
];



export const MentalHealthScreen = () => {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showMainContent, setShowMainContent] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const {
    name,
    age,
    selectedGender,
    sleep_hours_actual,
    sleep_hours_target,
  } = useLocalSearchParams();
  
  console.log(name, age, selectedGender, sleep_hours_actual, sleep_hours_target); 

  useEffect(() => {
    // Start with the intro animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // After 2 seconds, fade out intro and show main content
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowMainContent(true);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = async () => {
    if (selectedGoals.length === 0) {
      console.log('Please select at least one goal');
      return;
    }

    // Map selected goal IDs to their labels
    const selectedGoalLabels = mentalHealthGoals
      .filter(goal => selectedGoals.includes(goal.id))
      .map(goal => goal.label);

    // Build the final object
    const onboardingData = {
      name,
      age: Number(age),
      gender: 
        selectedGender === 'male' ? 'Male' :
        selectedGender === 'female' ? 'Female' :
        selectedGender === 'non-binary' ? 'Non-binary' :
        selectedGender === 'prefer not to say' ? 'Prefer not to say' :
        selectedGender, // fallback
      sleep_hours_actual: Number(sleep_hours_actual),
      sleep_hours_target: Number(sleep_hours_target),
      goals: selectedGoalLabels,
    };

    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      // POST to the API
      const response = await fetch('http://mohib.eastus.cloudapp.azure.com:8000/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail || data)
        );
      }

      console.log('Profile updated:', data);

      // Navigate to home or show success
      router.replace('/home');
    } catch (error) {
      console.error('Profile update error:', error);
      // Optionally show an alert
      // Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  if (!showMainContent) {
    return (
      <LinearGradient
        colors={['#3B82F6', '#4F46E5']}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.introContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Brain size={60} color="#3B82F6" />
          </View>
          <Text style={styles.introTitle}>Neuro Care</Text>
          <Text style={styles.introSubtitle}>Your Mental Wellness Partner</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#3B82F6', '#4F46E5']}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ArrowLeft size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Heart size={40} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Your Goals</Text>
          <Text style={styles.subtitle}>Select what you'd like to focus on</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.goalsContainer}>
            {mentalHealthGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalButton,
                  selectedGoals.includes(goal.id) && styles.goalButtonSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
              >
                <Text
                  style={[
                    styles.goalLabel,
                    selectedGoals.includes(goal.id) && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
                <Text
                  style={[
                    styles.goalDescription,
                    selectedGoals.includes(goal.id) &&
                      styles.goalDescriptionSelected,
                  ]}
                >
                  {goal.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedGoals.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedGoals.length === 0}
          >
            <Text style={styles.nextButtonText}>Get Started</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={styles.progressDot} />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  backText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    backgroundColor: '#fff',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalsContainer: {
    gap: 12,
  },
  goalButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
  },
  goalButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalLabelSelected: {
    color: '#3B82F6',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalDescriptionSelected: {
    color: '#4B5563',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  progressDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    textAlign: 'center',
  },
}); 