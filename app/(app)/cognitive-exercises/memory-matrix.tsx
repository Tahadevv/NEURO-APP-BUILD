import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const GRID_SIZES = [4, 5, 6, 7, 8];
const INITIAL_TIME = 30;
const LEVEL_THRESHOLDS = [5, 10, 15, 20, 25];

export default function MemoryMatrix() {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(GRID_SIZES[0]);
  const [showPattern, setShowPattern] = useState(true);
  const [patternDuration, setPatternDuration] = useState(2000);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  const generateGrid = () => {
    const newGrid = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));
    const cellsToLight = Math.min(3 + level, gridSize * gridSize);
    
    for (let i = 0; i < cellsToLight; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * gridSize);
        col = Math.floor(Math.random() * gridSize);
      } while (newGrid[row][col]);
      newGrid[row][col] = true;
    }
    
    return newGrid;
  };

  const startGame = () => {
    setGrid(generateGrid());
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setGameStarted(true);
    setShowPattern(true);
    setCombo(0);
    setMaxCombo(0);
    setGridSize(GRID_SIZES[0]);
    setPatternDuration(2000);
  };

  const handleCellPress = (row: number, col: number) => {
    if (!gameStarted || showPattern) return;
    
    const newGrid = [...grid];
    if (newGrid[row][col]) {
      newGrid[row][col] = false;
      setGrid(newGrid);
      setScore(score + 1);
      setCombo(combo + 1);
      setMaxCombo(Math.max(maxCombo, combo + 1));
      
      if (newGrid.every(row => row.every(cell => !cell))) {
        // Level up logic
        const newLevel = level + 1;
        setLevel(newLevel);
        
        // Adjust grid size based on level
        const newGridSizeIndex = Math.min(
          Math.floor(newLevel / 5),
          GRID_SIZES.length - 1
        );
        setGridSize(GRID_SIZES[newGridSizeIndex]);
        
        // Adjust pattern duration based on level
        setPatternDuration(Math.max(1000, 2000 - (newLevel * 100)));
        
        setGrid(generateGrid());
        setShowPattern(true);
      }
    } else {
      setCombo(0);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      Alert.alert(
        'Game Over',
        `Your score: ${score}\nLevel reached: ${level}\nMax Combo: ${maxCombo}`,
        [{ text: 'Play Again', onPress: startGame }]
      );
      setGameStarted(false);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (showPattern) {
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
        })
      ]).start(() => {
        setShowPattern(false);
      });
    }
  }, [showPattern]);

  return (
    <LinearGradient
      colors={['#3B82F6', '#4F46E5']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Memory Matrix</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>Level: {level}</Text>
        <Text style={styles.infoText}>Score: {score}</Text>
        <Text style={styles.infoText}>Time: {timeLeft}s</Text>
        <Text style={styles.infoText}>Combo: {combo}x</Text>
      </View>

      {!gameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.instructions}>
            Remember the highlighted cells and tap them in sequence. 
            Each level increases the number of cells to remember and the grid size.
            Build combos for bonus points!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      cell && styles.litCell
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                  />
                ))}
              </View>
            ))}
          </Animated.View>
        </View>
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
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 5,
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
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    width: '100%',
    aspectRatio: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    margin: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  litCell: {
    backgroundColor: 'white',
  },
}); 