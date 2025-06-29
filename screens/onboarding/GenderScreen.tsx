import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Brain, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';


const genderOptions = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export const GenderScreen = () => {
  const router = useRouter();
  const { name, age } = useLocalSearchParams();
  console.log(name, age);

  const [selectedGender, setSelectedGender] = useState('');

  const handleNext = () => {
    if (!selectedGender) {
      // Show error (implement toast later)
      console.log('Please select your gender');
      return;
    }

    // Store data in AsyncStorage
    // AsyncStorage.setItem('userGender', selectedGender);

    // Navigate to next screen
    

    router.push({
      pathname: '/(auth)/onboarding/sleep',
      params: {
        name,
        age,
        selectedGender,
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
            <Brain size={40} color="#3B82F6" />
          </View>
          <Text style={styles.title}>How do you identify?</Text>
          <Text style={styles.subtitle}>This helps us provide relevant content</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.optionsContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedGender === option.id && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedGender(option.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === option.id && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !selectedGender && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!selectedGender}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
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
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#3B82F6',
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
}); 