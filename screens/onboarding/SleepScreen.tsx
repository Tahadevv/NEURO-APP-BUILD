import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Brain, ArrowLeft, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';

type SleepKey = 'average' | 'ideal';

const sleepQuestions = [
  {
    id: 'average',
    question: 'How many hours do you usually sleep?',
    min: 4,
    max: 12,
    step: 0.5,
  },
  {
    id: 'ideal',
    question: 'How many hours would you like to sleep?',
    min: 4,
    max: 12,
    step: 0.5,
  },
];




export const SleepScreen = () => {
  const router = useRouter();
  const { name, age, selectedGender } = useLocalSearchParams();

  console.log(name, age, selectedGender);
  const [sleepHours, setSleepHours] = useState({
    average: 7,
    ideal: 8,
  });

  const handleNext = () => {
    // Store data in AsyncStorage
    // AsyncStorage.setItem('sleepPreferences', JSON.stringify(sleepHours));

    // Navigate to next screen

    console.log(selectedGender)
    

    router.push({
      pathname: '/(auth)/onboarding/mental-health',
      params: {
        name,
        age,
        selectedGender : selectedGender,
        sleep_hours_actual : sleepHours.average,
        sleep_hours_target : sleepHours.ideal, 
      },
    });
  };

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
            <Moon size={40} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Sleep Preferences</Text>
          <Text style={styles.subtitle}>Help us understand your sleep patterns</Text>
        </View>

        <View style={styles.card}>
          {sleepQuestions.map((question) => {
            const key = question.id as SleepKey;
            return (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.question}</Text>
                <Text style={styles.hoursText}>
                  {sleepHours[key]} hours
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={question.min}
                  maximumValue={question.max}
                  step={question.step}
                  value={sleepHours[key]}
                  onValueChange={(value) =>
                    setSleepHours((prev) => ({ ...prev, [key]: value }))
                  }
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#3B82F6"
                />
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeText}>{question.min}h</Text>
                  <Text style={styles.rangeText}>{question.max}h</Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
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
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
  },
  hoursText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
}); 