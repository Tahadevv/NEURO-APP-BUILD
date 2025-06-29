import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Image, Easing, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const EMOTIONS = [
  {
    name: 'Happiness',
    description: 'A state of well-being and contentment',
    synonyms: ['Joy', 'Delight', 'Pleasure', 'Contentment', 'Bliss'],
    color: '#F59E0B',
    icon: 'sentiment-very-satisfied',
  },
  {
    name: 'Sadness',
    description: 'A feeling of sorrow or unhappiness',
    synonyms: ['Grief', 'Sorrow', 'Melancholy', 'Despair', 'Gloom'],
    color: '#3B82F6',
    icon: 'sentiment-very-dissatisfied',
  },
  {
    name: 'Anger',
    description: 'A strong feeling of displeasure and hostility',
    synonyms: ['Rage', 'Fury', 'Wrath', 'Irritation', 'Resentment'],
    color: '#EF4444',
    icon: 'sentiment-very-dissatisfied',
  },
  {
    name: 'Fear',
    description: 'An unpleasant emotion caused by the threat of danger',
    synonyms: ['Anxiety', 'Terror', 'Dread', 'Panic', 'Apprehension'],
    color: '#8B5CF6',
    icon: 'sentiment-very-dissatisfied',
  },
  {
    name: 'Surprise',
    description: 'A feeling of astonishment or amazement',
    synonyms: ['Astonishment', 'Amazement', 'Wonder', 'Awe', 'Shock'],
    color: '#EC4899',
    icon: 'sentiment-very-satisfied',
  },
  {
    name: 'Disgust',
    description: 'A feeling of revulsion or strong disapproval',
    synonyms: ['Revulsion', 'Repulsion', 'Loathing', 'Aversion', 'Contempt'],
    color: '#10B981',
    icon: 'sentiment-very-dissatisfied',
  },
  {
    name: 'Love',
    description: 'A strong feeling of affection and attachment',
    synonyms: ['Affection', 'Devotion', 'Passion', 'Adoration', 'Fondness'],
    color: '#F43F5E',
    icon: 'favorite',
  },
  {
    name: 'Guilt',
    description: 'A feeling of responsibility for wrongdoing',
    synonyms: ['Remorse', 'Regret', 'Shame', 'Contrition', 'Self-reproach'],
    color: '#6366F1',
    icon: 'sentiment-very-dissatisfied',
  },
];

const SCENARIOS = [
  {
    emotion: 'Happiness',
    text: 'You just received a promotion at work after years of hard work.',
    explanation: 'Achieving a long-term goal often brings feelings of happiness and accomplishment.',
  },
  {
    emotion: 'Sadness',
    text: 'Your best friend is moving to another country.',
    text: 'Your best friend is moving to another country.',
    explanation: 'Loss of close relationships can trigger feelings of sadness and grief.',
  },
  {
    emotion: 'Anger',
    text: 'Someone cut in line in front of you after you waited for 30 minutes.',
    explanation: 'Perceived injustice or disrespect can lead to feelings of anger.',
  },
  {
    emotion: 'Fear',
    text: 'You hear a loud noise in the middle of the night while home alone.',
    explanation: 'Unexpected threats or danger can trigger fear responses.',
  },
  {
    emotion: 'Surprise',
    text: 'Your friends throw you a surprise birthday party.',
    explanation: 'Unexpected positive events can create feelings of surprise and joy.',
  },
  {
    emotion: 'Disgust',
    text: 'You see someone spit on the sidewalk in front of you.',
    explanation: 'Violations of social norms or hygiene can trigger disgust.',
  },
  {
    emotion: 'Love',
    text: 'Your partner surprises you with breakfast in bed.',
    explanation: 'Acts of kindness and affection can strengthen feelings of love.',
  },
  {
    emotion: 'Guilt',
    text: 'You forgot your friend\'s birthday.',
    explanation: 'Failing to meet social expectations can lead to feelings of guilt.',
  },
];

const INITIAL_TIME = 20;
const TIME_PENALTY = 5;
const TIME_BONUS = 3;
const STREAK_MULTIPLIER = 0.5;
const LEVEL_THRESHOLD = 3;
const MAX_TIME = 30;
const MIN_TIME = 10;

export default function EmotionPuzzle() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameStarted, setGameStarted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  const getScenario = () => {
    const availableScenarios = SCENARIOS.filter(
      scenario => scenario.emotion !== currentScenario?.emotion
    );
    const randomIndex = Math.floor(Math.random() * availableScenarios.length);
    return availableScenarios[randomIndex];
  };

  const animateScenario = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(INITIAL_TIME);
    setGameStarted(true);
    setCurrentScenario(getScenario());
    setShowExplanation(false);
  };

  const handleEmotionSelect = (emotion: string) => {
    if (!gameStarted || showExplanation) return;

    const isCorrect = emotion === currentScenario.emotion;
    const timeBonus = Math.floor(timeLeft * TIME_BONUS);
    const streakBonus = Math.floor(streak * STREAK_MULTIPLIER);
    const levelBonus = level * 2;

    if (isCorrect) {
      const points = 10 + timeBonus + streakBonus + levelBonus;
      setScore(score + points);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
      
      // Adjust time based on performance
      const newTime = Math.min(
        MAX_TIME,
        Math.max(
          MIN_TIME,
          timeLeft + TIME_BONUS - (level * 0.5)
        )
      );
      setTimeLeft(newTime);

      if ((score + points) >= level * 30) {
        setLevel(level + 1);
      }

      setTimeout(() => {
        setCurrentScenario(getScenario());
        setShowExplanation(false);
        animateScenario();
      }, 1500);
    } else {
      shakeAnimation();
      setStreak(0);
      // Penalize time for incorrect answers
      const newTime = Math.max(MIN_TIME, timeLeft - TIME_PENALTY);
      setTimeLeft(newTime);
    }

    setShowExplanation(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0 && !showExplanation) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showExplanation) {
      shakeAnimation();
      setStreak(0);
      setGameStarted(false);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, showExplanation]);

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Emotion Puzzle</Text>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Level</Text>
          <Text style={styles.infoValue}>{level}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Score</Text>
          <Text style={styles.infoValue}>{score}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Streak</Text>
          <Text style={styles.infoValue}>{streak}🔥</Text>
        </View>
      </View>

      {!gameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.instructions}>
            Identify the emotion in each scenario. Time management is crucial!
            Higher levels introduce more complex emotions and shorter time limits.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View 
          style={[
            styles.gameContainer,
            { transform: [{ translateX: shakeAnim }] }
          ]}
        >
          <Animated.View 
            style={[
              styles.scenarioContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.scenarioText}>{currentScenario.text}</Text>
          </Animated.View>

          <View style={styles.emotionsContainer}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion.name}
                style={[
                  styles.emotionButton,
                  {
                    backgroundColor: emotion.color,
                    opacity: showExplanation ? 
                      (emotion.name === currentScenario.emotion ? 1 : 0.5) : 1,
                  },
                ]}
                onPress={() => handleEmotionSelect(emotion.name)}
                disabled={showExplanation}
              >
                <MaterialIcons name={emotion.icon} size={24} color="white" />
                <Text style={styles.emotionText}>{emotion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {showExplanation && (
            <Animated.View 
              style={[
                styles.explanationContainer,
                { backgroundColor: EMOTIONS.find(e => e.name === currentScenario.emotion)?.color }
              ]}
            >
              <Text style={styles.explanationText}>{currentScenario.explanation}</Text>
              <View style={styles.synonymsContainer}>
                <Text style={styles.synonymsTitle}>Synonyms:</Text>
                <View style={styles.synonymsList}>
                  {EMOTIONS.find(e => e.name === currentScenario.emotion)?.synonyms.map(
                    (synonym, index) => (
                      <Text key={index} style={styles.synonymText}>{synonym}</Text>
                    )
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}
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
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scenarioContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  scenarioText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  emotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 10,
    minWidth: 150,
    justifyContent: 'center',
  },
  emotionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanationContainer: {
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  explanationText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  synonymsContainer: {
    alignItems: 'center',
  },
  synonymsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  synonymsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  synonymText: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
}); 