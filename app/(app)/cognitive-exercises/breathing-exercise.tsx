import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Easing, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const BREATHING_PATTERNS = [
  {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 4,
    description: 'A simple technique to calm the mind and body',
    color: '#F59E0B',
    level: 1,
    sound: 'box',
  },
  {
    name: '4-7-8 Breathing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfterExhale: 0,
    description: 'Promotes relaxation and better sleep',
    color: '#3B82F6',
    level: 2,
    sound: '478',
  },
  {
    name: 'Alternate Nostril',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 0,
    description: 'Balances the nervous system',
    color: '#10B981',
    level: 3,
    sound: 'alternate',
  },
  {
    name: 'Lion\'s Breath',
    inhale: 4,
    hold: 0,
    exhale: 6,
    holdAfterExhale: 0,
    description: 'Releases tension and stress',
    color: '#EC4899',
    level: 4,
    sound: 'lion',
  },
  {
    name: 'Ocean Breath',
    inhale: 4,
    hold: 0,
    exhale: 6,
    holdAfterExhale: 0,
    description: 'Creates a calming effect like ocean waves',
    color: '#8B5CF6',
    level: 5,
    sound: 'ocean',
  },
];

const SOUNDS = {
  box: require('../assets/sounds/box.mp3'),
  '478': require('../assets/sounds/478.mp3'),
  alternate: require('../assets/sounds/alternate.mp3'),
  lion: require('../assets/sounds/lion.mp3'),
  ocean: require('../assets/sounds/ocean.mp3'),
};

export default function BreathingExercise() {
  const [currentPattern, setCurrentPattern] = useState(BREATHING_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalBreathingTime, setTotalBreathingTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotationAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const circleSize = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.5)).current;
  const phaseTextOpacity = useRef(new Animated.Value(1)).current;
  const isTransitioning = useRef(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async (pattern: typeof BREATHING_PATTERNS[0]) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        SOUNDS[pattern.sound as keyof typeof SOUNDS],
        { shouldPlay: false }
      );
      await newSound.setVolumeAsync(0.5);
      setSound(newSound);
      setIsSoundLoaded(true);
    } catch (error) {
      console.log('Error loading sound:', error);
      setIsSoundLoaded(false);
    }
  };

  const playSound = async () => {
    if (sound && isSoundLoaded && !isTransitioning.current) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    }
  };

  const animateCircle = (toValue: number, duration: number) => {
    return new Promise((resolve) => {
      Animated.timing(circleSize, {
        toValue,
        duration: duration * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(resolve);
    });
  };

  const fadeInOut = (toValue: number, duration: number) => {
    return new Promise((resolve) => {
      Animated.timing(fadeAnim, {
        toValue,
        duration: duration * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(resolve);
    });
  };

  const animatePhaseText = () => {
    Animated.sequence([
      Animated.timing(phaseTextOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(phaseTextOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    loadSound(currentPattern);
  }, [currentPattern]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isTransitioning.current) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    let breathingCycle: NodeJS.Timeout;

    const runBreathingCycle = async () => {
      if (!isPlaying || isTransitioning.current) return;
      isTransitioning.current = true;

      try {
        // Inhale
        setPhase('inhale');
        animatePhaseText();
        setSecondsLeft(currentPattern.inhale);
        Vibration.vibrate(100);
        await animateCircle(1.5, 1, currentPattern.inhale * 1000);
        playSound();

        if (!isPlaying) return;

        // Hold after inhale
        if (currentPattern.hold > 0) {
          setPhase('hold');
          animatePhaseText();
          setSecondsLeft(currentPattern.hold);
          Vibration.vibrate(200);
          await new Promise((resolve) => setTimeout(resolve, currentPattern.hold * 1000));
        }

        if (!isPlaying) return;

        // Exhale
        setPhase('exhale');
        animatePhaseText();
        setSecondsLeft(currentPattern.exhale);
        Vibration.vibrate(100);
        await animateCircle(1, 0.7, currentPattern.exhale * 1000);
        playSound();

        if (!isPlaying) return;

        // Hold after exhale
        if (currentPattern.holdAfterExhale > 0) {
          setPhase('holdAfterExhale');
          animatePhaseText();
          setSecondsLeft(currentPattern.holdAfterExhale);
          Vibration.vibrate(200);
          await new Promise((resolve) => setTimeout(resolve, currentPattern.holdAfterExhale * 1000));
        }

        if (!isPlaying) return;

        setCompletedCycles((prev) => prev + 1);
        setTotalBreathingTime((prev) => 
          prev + currentPattern.inhale + currentPattern.hold + 
          currentPattern.exhale + currentPattern.holdAfterExhale
        );

        if (completedCycles + 1 >= 5) {
          setLevel((prev) => Math.min(prev + 1, 5));
          Vibration.vibrate([100, 200, 100]);
        }

      } finally {
        isTransitioning.current = false;
      }

      breathingCycle = setTimeout(runBreathingCycle, 100);
    };

    if (isPlaying && !isTransitioning.current) {
      runBreathingCycle();
    }

    return () => {
      if (breathingCycle) {
        clearTimeout(breathingCycle);
      }
    };
  }, [isPlaying, currentPattern]);

  const startExercise = async () => {
    if (isTransitioning.current) return;
    await loadSound(currentPattern);
    setIsPlaying(true);
    setCompletedCycles(0);
    setTotalBreathingTime(0);
    Vibration.vibrate(300);
  };

  const pauseExercise = () => {
    setIsPlaying(false);
    if (sound) {
      sound.stopAsync();
    }
    Vibration.vibrate(150);
  };

  const selectPattern = async (pattern: typeof BREATHING_PATTERNS[0]) => {
    if (isTransitioning.current) return;
    setCurrentPattern(pattern);
    setIsPlaying(false);
    setPhase('inhale');
    setSecondsLeft(pattern.inhale);
    circleSize.setValue(1);
    circleOpacity.setValue(0.5);
    await loadSound(pattern);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'holdAfterExhale':
        return 'Hold';
      default:
        return '';
    }
  };

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Breathing Exercise</Text>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Level</Text>
          <Text style={styles.infoValue}>{level}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cycles</Text>
          <Text style={styles.infoValue}>{completedCycles}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{totalBreathingTime}s</Text>
        </View>
      </View>

      <Animated.View 
        style={[
          styles.patternContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.patternName}>{currentPattern.name}</Text>
        <Text style={styles.patternDescription}>{currentPattern.description}</Text>
      </Animated.View>

      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              width: circleSize,
              height: circleSize,
              opacity: circleOpacity,
              transform: [
                {
                  rotate: rotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.Text 
            style={[
              styles.phaseText,
              { opacity: phaseTextOpacity }
            ]}
          >
            {getPhaseText()}
          </Animated.Text>
          <Text style={styles.timerText}>{secondsLeft}s</Text>
        </Animated.View>
      </View>

      <View style={styles.controlsContainer}>
        {!isPlaying ? (
          <TouchableOpacity style={styles.startButton} onPress={startExercise}>
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={pauseExercise}>
            <MaterialIcons name="pause" size={24} color="white" />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.patternsContainer}>
        {BREATHING_PATTERNS.map((pattern) => (
          <TouchableOpacity
            key={pattern.name}
            style={[
              styles.patternButton,
              {
                backgroundColor: pattern.color,
                opacity: pattern.level <= level ? 1 : 0.5,
              },
            ]}
            onPress={() => selectPattern(pattern)}
            disabled={pattern.level > level || isTransitioning.current}
          >
            <MaterialIcons 
              name={pattern === currentPattern ? "radio-button-checked" : "radio-button-unchecked"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.patternButtonText}>{pattern.name}</Text>
            {pattern.level > level && (
              <View style={styles.lockIcon}>
                <MaterialIcons name="lock" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  patternContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  patternName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  patternDescription: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timerText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  controlsContainer: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patternsContainer: {
    gap: 10,
  },
  patternButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 10,
  },
  patternButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  lockIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 5,
    borderRadius: 10,
  },
}); 