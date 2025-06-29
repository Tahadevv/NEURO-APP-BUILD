import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Easing, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORIES = {
  emotions: {
    name: 'Emotions',
    icon: 'mood',
    words: [
      { word: 'Happy', related: ['Joy', 'Content', 'Pleased', 'Delighted', 'Cheerful'] },
      { word: 'Sad', related: ['Grief', 'Sorrow', 'Melancholy', 'Down', 'Unhappy'] },
      { word: 'Angry', related: ['Furious', 'Enraged', 'Irritated', 'Annoyed', 'Mad'] },
      { word: 'Fear', related: ['Scared', 'Afraid', 'Terrified', 'Anxious', 'Nervous'] },
      { word: 'Surprise', related: ['Astonished', 'Amazed', 'Shocked', 'Startled', 'Stunned'] },
    ],
  },
  nature: {
    name: 'Nature',
    icon: 'landscape',
    words: [
      { word: 'Ocean', related: ['Sea', 'Water', 'Waves', 'Beach', 'Tide'] },
      { word: 'Mountain', related: ['Peak', 'Hill', 'Climb', 'Summit', 'Range'] },
      { word: 'Forest', related: ['Trees', 'Woods', 'Jungle', 'Wild', 'Green'] },
      { word: 'River', related: ['Stream', 'Flow', 'Water', 'Current', 'Bank'] },
      { word: 'Sky', related: ['Clouds', 'Blue', 'Air', 'Heaven', 'Space'] },
    ],
  },
  mindfulness: {
    name: 'Mindfulness',
    icon: 'self-improvement',
    words: [
      { word: 'Peace', related: ['Calm', 'Tranquil', 'Serene', 'Quiet', 'Still'] },
      { word: 'Focus', related: ['Concentrate', 'Attention', 'Present', 'Aware', 'Mindful'] },
      { word: 'Balance', related: ['Harmony', 'Equilibrium', 'Stability', 'Center', 'Align'] },
      { word: 'Breathe', related: ['Inhale', 'Exhale', 'Air', 'Calm', 'Relax'] },
      { word: 'Meditate', related: ['Reflect', 'Contemplate', 'Center', 'Quiet', 'Still'] },
    ],
  },
};

const INITIAL_TIME = 30;
const TIME_BONUS = 5;
const STREAK_MULTIPLIER = 0.5;
const LEVEL_THRESHOLD = 3;

export default function WordAssociation() {
  const [category, setCategory] = useState('emotions');
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const getRandomWord = () => {
    const words = CATEGORIES[category as keyof typeof CATEGORIES].words;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  const animateWord = () => {
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
    setCurrentWord(getRandomWord());
    setUserInput('');
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    if (!gameStarted || showFeedback) return;

    const currentWordObj = CATEGORIES[category as keyof typeof CATEGORIES].words.find(
      w => w.word === currentWord.word
    );

    if (!currentWordObj) return;

    const isCorrect = currentWordObj.related.some(
      word => word.toLowerCase() === userInput.toLowerCase()
    );

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * TIME_BONUS);
      const streakBonus = Math.floor(streak * STREAK_MULTIPLIER);
      const levelBonus = level * 2;
      const points = 10 + timeBonus + streakBonus + levelBonus;

      setScore(score + points);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
      setFeedbackText(`+${points} points!`);
      setFeedbackColor('#10B981');

      if ((score + points) >= level * 30) {
        setLevel(level + 1);
        setTimeLeft(INITIAL_TIME + (level * 2));
      }

      setTimeout(() => {
        setCurrentWord(getRandomWord());
        setUserInput('');
        setShowFeedback(false);
        setTimeLeft(INITIAL_TIME + (level * 2));
        animateWord();
      }, 1500);
    } else {
      shakeAnimation();
      setStreak(0);
      setFeedbackText('Try again!');
      setFeedbackColor('#EF4444');
    }

    setShowFeedback(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0 && !showFeedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showFeedback) {
      shakeAnimation();
      setStreak(0);
      setGameStarted(false);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, showFeedback]);

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Word Association</Text>
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
            Think of words related to the given word. Build streaks for bonus points!
            Higher levels introduce more challenging words.
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
              styles.wordContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.categoryText}>
              {CATEGORIES[category as keyof typeof CATEGORIES].name}
            </Text>
            <Text style={styles.wordText}>{currentWord.word}</Text>
          </Animated.View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Enter a related word..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              onSubmitEditing={checkAnswer}
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={checkAnswer}
            >
              <MaterialIcons name="check" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {showFeedback && (
            <Animated.View 
              style={[
                styles.feedbackContainer,
                { backgroundColor: feedbackColor }
              ]}
            >
              <Text style={styles.feedbackText}>{feedbackText}</Text>
            </Animated.View>
          )}
        </Animated.View>
      )}

      <View style={styles.categoriesContainer}>
        {Object.keys(CATEGORIES).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              {
                backgroundColor: category === cat ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={() => setCategory(cat)}
          >
            <MaterialIcons 
              name={CATEGORIES[cat as keyof typeof CATEGORIES].icon} 
              size={24} 
              color="white" 
            />
            <Text style={styles.categoryButtonText}>
              {CATEGORIES[cat as keyof typeof CATEGORIES].name}
            </Text>
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
  wordContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  categoryText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  wordText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    gap: 5,
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 