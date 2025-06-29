import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const BasicInfoScreen = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleNext = () => {
    if (!name || !age) {
      // Show error (implement toast later)
      console.log('Please fill in all fields');
      return;
    }

    // Store data in AsyncStorage
    // AsyncStorage.setItem('userBasicInfo', JSON.stringify({ name, age }));

    // Navigate to next screen
    

    router.push({
      pathname: '/(auth)/onboarding/gender',
      params: {
        name,
        age,
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Brain size={40} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Let's get to know you better</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>What's your name?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>How old are you?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor="#9CA3AF"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.nextButton, (!name || !age) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!name || !age}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>

              <View style={styles.progressContainer}>
                <View style={styles.progressDot} />
                <View style={[styles.progressDot, styles.progressDotInactive]} />
                <View style={[styles.progressDot, styles.progressDotInactive]} />
                <View style={[styles.progressDot, styles.progressDotInactive]} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
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
  form: {
    gap: 24,
  },
  inputGroup: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#1F2937',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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