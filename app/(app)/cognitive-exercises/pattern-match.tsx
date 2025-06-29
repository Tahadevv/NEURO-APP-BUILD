import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PATTERN_TYPES = {
  color: {
    name: 'Colors',
    items: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FF9F1C'],
    icon: 'palette',
  },
  shape: {
    name: 'Shapes',
    items: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'],
    icon: 'shapes',
  },
  number: {
    name: 'Numbers',
    items: [1, 2, 3, 4, 5, 6],
    icon: 'looks-6',
  },
  mixed: {
    name: 'Mixed',
    items: ['mixed'],
    icon: 'blur-on',
  },
};

const INITIAL_PATTERN_DURATION = 2000;
const MIN_PATTERN_DURATION = 500;
const LEVEL_THRESHOLD = 5;
const COMBO_MULTIPLIER = 0.5;

export default function PatternMatch() {
  const [pattern, setPattern] = useState<any[]>([]);
  const [userPattern, setUserPattern] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [patternType, setPatternType] = useState('color');
  const [showPattern, setShowPattern] = useState(true);
  const [patternDuration, setPatternDuration] = useState(INITIAL_PATTERN_DURATION);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const generatePattern = () => {
    const type = level >= 15 ? 'mixed' : patternType;
    const length = Math.min(3 + Math.floor(level / 2), 8);
    const newPattern = [];

    for (let i = 0; i < length; i++) {
      if (type === 'mixed') {
        const types = ['color', 'shape', 'number'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomItem = PATTERN_TYPES[randomType].items[
          Math.floor(Math.random() * PATTERN_TYPES[randomType].items.length)
        ];
        newPattern.push({ type: randomType, value: randomItem });
      } else {
        newPattern.push(PATTERN_TYPES[type].items[
          Math.floor(Math.random() * PATTERN_TYPES[type].items.length)
        ]);
      }
    }
    return newPattern;
  };

  const animatePattern = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: patternDuration,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPattern(false);
      setUserPattern([]);
    });
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
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setScore(0);
    setLevel(1);
    setGameStarted(true);
    setShowPattern(true);
    setCombo(0);
    setMaxCombo(0);
    setPerfectRounds(0);
    setPatternDuration(INITIAL_PATTERN_DURATION);
    animatePattern();
  };

  const handleItemPress = (item: any) => {
    if (!gameStarted || showPattern) return;

    const newUserPattern = [...userPattern, item];
    setUserPattern(newUserPattern);

    const isCorrect = patternType === 'mixed'
      ? item.type === pattern[userPattern.length].type && item.value === pattern[userPattern.length].value
      : item === pattern[userPattern.length];

    if (!isCorrect) {
      shakeAnimation();
      setCombo(0);
      Alert.alert(
        'Game Over',
        `Score: ${score}\nLevel: ${level}\nMax Combo: ${maxCombo}\nPerfect Rounds: ${perfectRounds}`,
        [{ text: 'Play Again', onPress: startGame }]
      );
      setGameStarted(false);
      return;
    }

    if (newUserPattern.length === pattern.length) {
      const basePoints = level * 10;
      const comboBonus = Math.floor(combo * COMBO_MULTIPLIER);
      const perfectBonus = perfectRounds * 5;
      const points = basePoints + comboBonus + perfectBonus;

      setScore(score + points);
      setCombo(combo + 1);
      setMaxCombo(Math.max(maxCombo, combo + 1));
      setPerfectRounds(perfectRounds + 1);

      // Level up
      const newLevel = level + 1;
      setLevel(newLevel);
      setPatternDuration(Math.max(MIN_PATTERN_DURATION, INITIAL_PATTERN_DURATION - (newLevel * 50)));

      // Change pattern type based on level
      if (newLevel % LEVEL_THRESHOLD === 0) {
        const types = Object.keys(PATTERN_TYPES);
        const nextType = types[(types.indexOf(patternType) + 1) % types.length];
        setPatternType(nextType);
      }

      const newPattern = generatePattern();
      setPattern(newPattern);
      setShowPattern(true);
      animatePattern();
    }
  };

  const renderItem = (item: any) => {
    if (patternType === 'mixed') {
      switch (item.type) {
        case 'color':
          return <View style={[styles.item, { backgroundColor: item.value }]} />;
        case 'shape':
          return (
            <View style={styles.item}>
              <MaterialIcons name={item.value} size={30} color="white" />
            </View>
          );
        case 'number':
          return <Text style={styles.numberText}>{item.value}</Text>;
      }
    }

    switch (patternType) {
      case 'color':
        return <View style={[styles.item, { backgroundColor: item }]} />;
      case 'shape':
        return (
          <View style={styles.item}>
            <MaterialIcons name={item} size={30} color="white" />
          </View>
        );
      case 'number':
        return <Text style={styles.numberText}>{item}</Text>;
    }
  };

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Pattern Match</Text>
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
          <Text style={styles.infoLabel}>Combo</Text>
          <Text style={styles.infoValue}>{combo}x</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Perfect</Text>
          <Text style={styles.infoValue}>{perfectRounds}⭐</Text>
        </View>
      </View>

      {!gameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.instructions}>
            Remember and repeat the pattern shown.
            Patterns can be colors, shapes, numbers, or mixed.
            Higher levels introduce more complex patterns!
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
          <View style={styles.patternTypeContainer}>
            <MaterialIcons 
              name={PATTERN_TYPES[patternType].icon} 
              size={24} 
              color="white" 
            />
            <Text style={styles.patternTypeText}>
              {PATTERN_TYPES[patternType].name}
            </Text>
          </View>

          <Animated.View 
            style={[
              styles.patternContainer,
              { opacity: fadeAnim }
            ]}
          >
            {pattern.map((item, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.patternItem,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                {renderItem(item)}
              </Animated.View>
            ))}
          </Animated.View>

          {!showPattern && (
            <View style={styles.optionsContainer}>
              {patternType === 'mixed' ? (
                <>
                  {Object.entries(PATTERN_TYPES).map(([type, data]) => (
                    type !== 'mixed' && (
                      <View key={type} style={styles.optionGroup}>
                        <Text style={styles.optionGroupTitle}>{data.name}</Text>
                        <View style={styles.optionRow}>
                          {data.items.map((item) => (
                            <TouchableOpacity
                              key={item}
                              style={styles.option}
                              onPress={() => handleItemPress({ type, value: item })}
                            >
                              {type === 'color' ? (
                                <View style={[styles.item, { backgroundColor: item }]} />
                              ) : type === 'shape' ? (
                                <MaterialIcons name={item} size={30} color="white" />
                              ) : (
                                <Text style={styles.numberText}>{item}</Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )
                  ))}
                </>
              ) : (
                <View style={styles.optionRow}>
                  {PATTERN_TYPES[patternType].items.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.option}
                      onPress={() => handleItemPress(item)}
                    >
                      {renderItem(item)}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
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
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  patternTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
  },
  patternTypeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  patternItem: {
    margin: 10,
  },
  optionsContainer: {
    gap: 20,
  },
  optionGroup: {
    marginBottom: 15,
  },
  optionGroupTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  item: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  numberText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
}); 