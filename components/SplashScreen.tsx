import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Heart, Activity, Shield, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [animationStep, setAnimationStep] = useState(1);
  const fadeAnim = new Animated.Value(0);
  
  // Features to show in splash screens
  const splashFeatures = [
    {
      title: 'AI Emotion Analysis',
      description: 'Track your emotional state through facial, voice, and text analysis.',
      icon: Brain,
      color: '#3B82F6'
    },
    {
      title: 'Personalized Therapy',
      description: 'Receive AI-generated coping mechanisms tailored to your needs.',
      icon: Heart,
      color: '#EC4899'
    },
    {
      title: 'Mental Health Dashboard',
      description: 'Visualize your emotional patterns and progress over time.',
      icon: Activity,
      color: '#10B981'
    },
    {
      title: 'Privacy Focused',
      description: 'Your data is encrypted and never shared with third parties.',
      icon: Shield,
      color: '#8B5CF6'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen < splashFeatures.length) {
      setCurrentScreen(currentScreen + 1);
    } 
    
    if (currentScreen === splashFeatures.length) {
      setCurrentScreen(currentScreen + 1); // Show the auth screen instead of navigating to Home
    }
  };

  // For the first screen, show the original splash
  if (currentScreen === 0) {
    return (
      <LinearGradient
        colors={['#3B82F6', '#4F46E5']}
        style={styles.container}
      >
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <View style={styles.logoCircle}>
            <Brain size={64} color="#3B82F6" />
          </View>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Neuro Care</Text>
          <Text style={styles.subtitle}>AI-powered mental health companion</Text>
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <ArrowRight size={16} color="#3B82F6" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // For feature screens
  if (currentScreen <= splashFeatures.length) {
    const feature = splashFeatures[currentScreen - 1];
    return (
      <LinearGradient
        colors={['#3B82F6', '#4F46E5']}
        style={styles.container}
      >
        <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
          <feature.icon size={40} color="#FFFFFF" />
        </View>
        
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
        
        <View style={styles.dotsContainer}>
          {splashFeatures.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot,
                { backgroundColor: currentScreen - 1 === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)' }
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentScreen < splashFeatures.length ? 'Next' : 'Get Started'}
          </Text>
          <ArrowRight size={16} color="#3B82F6" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Final screen with login/signup options
  return (
    <LinearGradient
      colors={['#3B82F6', '#4F46E5']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Brain size={40} color="#3B82F6" />
        </View>
      </View>
      
      <Text style={styles.title}>Welcome to Neuro Care</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.ghostButton]}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.ghostButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 128,
    height: 128,
    backgroundColor: '#FFFFFF',
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 32,
  },
  featureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  primaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  nextButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SplashScreen; 