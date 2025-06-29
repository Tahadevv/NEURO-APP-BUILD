import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated, Easing, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Wind, CheckCircle, ArrowLeft, Plus, Play, Pause, Volume2, Clock, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InferenceClient } from '@huggingface/inference';
import * as Speech from 'expo-speech';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HF_TOKEN = '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';
const MEDITATION_HISTORY_KEY = '@meditation_sessions';

const MeditationScreen = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const breathAnim = useRef(new Animated.Value(1)).current;
  const [currentScriptStep, setCurrentScriptStep] = useState(0);
  const [scriptSteps, setScriptSteps] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isBreathingIn, setIsBreathingIn] = useState(true);

  // Load history on mount
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(MEDITATION_HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    })();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Breathing animation
  React.useEffect(() => {
    if (sessionActive) {
      const breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { 
            toValue: 1.3, 
            duration: 4000, 
            useNativeDriver: true, 
            easing: Easing.inOut(Easing.ease) 
          }),
          Animated.timing(breathAnim, { 
            toValue: 1, 
            duration: 4000, 
            useNativeDriver: true, 
            easing: Easing.inOut(Easing.ease) 
          })
        ])
      );
      
      breathingLoop.start();
      
      // Update breathing state
      const interval = setInterval(() => {
        setIsBreathingIn(prev => !prev);
      }, 4000);
      
      return () => {
        breathingLoop.stop();
        clearInterval(interval);
      };
    } else {
      breathAnim.setValue(1);
      setIsBreathingIn(true);
    }
  }, [sessionActive]);

  // When script changes, split into steps
  React.useEffect(() => {
    if (script) {
      const steps = script.split(/\n|\. /).map(s => s.trim()).filter(Boolean);
      setScriptSteps(steps);
      setCurrentScriptStep(0);
    } else {
      setScriptSteps([]);
      setCurrentScriptStep(0);
    }
  }, [script]);

  // Auto-advance to next step after TTS
  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (sessionActive && scriptSteps.length > 0) {
      Speech.stop();
      Speech.speak(scriptSteps[currentScriptStep], {
        language: 'en',
        rate: 0.95,
        onDone: () => {
          timeout = setTimeout(() => {
            if (currentScriptStep < scriptSteps.length - 1) {
              setCurrentScriptStep(currentScriptStep + 1);
            } else {
              setSessionActive(false);
              saveSession();
              Alert.alert('Session Complete', 'Great job! Your meditation session is complete.');
            }
          }, 1200);
        },
      });
    }
    return () => {
      Speech.stop();
      if (timeout) clearTimeout(timeout);
    };
  }, [currentScriptStep, sessionActive]);

  // HuggingFace Inference API call
  const generateScript = async () => {
    if (!userPrompt.trim()) {
      Alert.alert('Please enter your mood or focus for the session.');
      return;
    }
    setLoading(true);
    setScript('');
    try {
      const client = new InferenceClient(HF_TOKEN);
      const chatCompletion = await client.chatCompletion({
        provider: 'novita',
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [
          { role: 'user', content: `Generate a personalized meditation script for: ${userPrompt}` }
        ],
      });
      const text = chatCompletion.choices?.[0]?.message?.content || 'Could not generate script. Try again.';
      setScript(text);
    } catch (err) {
      setScript('Error generating meditation script.');
    }
    setLoading(false);
  };

  // Start session
  const startSession = () => {
    setSessionActive(true);
    setProgress(0);
    setCurrentScriptStep(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 1;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setSessionActive(false);
        saveSession();
        Alert.alert('Session Complete', 'Great job! Your meditation session is complete.');
      }
    }, 1500);
  };

  // Save session to history
  const saveSession = async () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      script,
      userPrompt,
    };
    const updated = [newEntry, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(MEDITATION_HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F8FAFF', '#FFFFFF']}
        style={styles.gradientBackground}
      />
      
      {/* Premium Header */}
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.95)', 'rgba(59, 130, 246, 0.9)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => history.length ? setShowHistory(true) : null}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.backButtonGradient}
            >
              <Brain size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AI Meditation</Text>
            <Text style={styles.headerSubtitle}>Personalized mindfulness sessions</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {/* Premium Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.heroCard}
            >
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={['#4F46E5', '#3B82F6']}
                  style={styles.heroIconGradient}
                >
                  <Sparkles size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>Personalized Meditation</Text>
              <Text style={styles.heroSubtitle}>Let AI create a unique meditation experience tailored to your current state of mind</Text>
            </LinearGradient>
          </View>

          {/* Premium Input Section */}
          <View style={styles.inputSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.inputCard}
            >
              <Text style={styles.inputLabel}>Describe your mood, focus, or goal</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., I'm feeling anxious about work, help me find calm..."
                placeholderTextColor="#9CA3AF"
                value={userPrompt}
                onChangeText={setUserPrompt}
                editable={!loading && !sessionActive}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity 
                style={styles.generateButton} 
                onPress={generateScript} 
                disabled={loading || sessionActive}
              >
                <LinearGradient 
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#4F46E5', '#3B82F6']} 
                  style={styles.generateGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Plus size={20} color="#fff" />
                  )}
                  <Text style={styles.generateButtonText}>
                    {loading ? 'Generating...' : 'Generate Session'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Premium Script Section */}
          {script ? (
            <Animated.View style={[styles.scriptSection, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
                style={styles.scriptCard}
              >
                <View style={styles.scriptHeader}>
                  <View style={styles.scriptIconContainer}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                      style={styles.scriptIconGradient}
                    >
                      <Wind size={20} color="#10B981" />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={styles.scriptTitle}>Your Meditation Script</Text>
                    <Text style={styles.scriptSubtitle}>AI-generated for your needs</Text>
                  </View>
                </View>
                <ScrollView style={styles.scriptScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.scriptText}>{script}</Text>
                </ScrollView>
                {!sessionActive && (
                  <TouchableOpacity style={styles.startButton} onPress={startSession}>
                    <LinearGradient 
                      colors={['#10B981', '#059669']} 
                      style={styles.startGradient}
                    >
                      <Play size={20} color="#fff" />
                      <Text style={styles.startButtonText}>Start Session</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </Animated.View>
          ) : null}

          {/* Premium Active Session */}
          {sessionActive && scriptSteps.length > 0 && (
            <Animated.View style={[styles.sessionSection, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
                style={styles.sessionCard}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionIconContainer}>
                    <LinearGradient
                      colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
                      style={styles.sessionIconGradient}
                    >
                      <Clock size={20} color="#F59E0B" />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={styles.sessionTitle}>Guided Meditation</Text>
                    <Text style={styles.sessionSubtitle}>Follow the breathing rhythm</Text>
                  </View>
                </View>
                
                <View style={styles.breathingContainer}>
                  <Animated.View 
                    style={[styles.breathingCircle, { transform: [{ scale: breathAnim }] }]}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#3B82F6', '#10B981']}
                      style={styles.breathingCircleGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.breathingInner}>
                      <Text style={styles.breathingText}>
                        {isBreathingIn ? 'Breathe In' : 'Breathe Out'}
                      </Text>
                    </View>
                  </Animated.View>
                </View>

                <View style={styles.scriptStepContainer}>
                  <Text style={styles.scriptStepText}>{scriptSteps[currentScriptStep]}</Text>
                  <TouchableOpacity 
                    style={styles.replayButton} 
                    onPress={() => Speech.speak(scriptSteps[currentScriptStep], { language: 'en', rate: 0.95 })}
                  >
                    <LinearGradient
                      colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                      style={styles.replayButtonGradient}
                    >
                      <Volume2 size={16} color="#4F46E5" />
                      <Text style={styles.replayButtonText}>Replay</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBarContainer}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={[styles.progressBar, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}% Complete</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Premium History Button */}
          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={() => setShowHistory(true)}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.historyButtonGradient}
            >
              <CheckCircle size={20} color="#4F46E5" />
              <Text style={styles.historyButtonText}>View Session History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Premium History Modal */}
      <Modal 
        visible={showHistory} 
        animationType="slide" 
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.historyModal}>
          <LinearGradient
            colors={['#EEF2FF', '#F8FAFF', '#FFFFFF']}
            style={styles.historyModalBackground}
          />
          <View style={styles.historyModalContent}>
            <View style={styles.historyHeader}>
              <TouchableOpacity 
                style={styles.closeHistory} 
                onPress={() => setShowHistory(false)}
              >
                <LinearGradient
                  colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                  style={styles.closeHistoryGradient}
                >
                  <ArrowLeft size={24} color="#4F46E5" />
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.historyTitleContainer}>
                <Text style={styles.historyTitleModal}>Meditation History</Text>
                <Text style={styles.historySubtitleModal}>Your mindfulness journey</Text>
              </View>
            </View>
            
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {history.length === 0 ? (
                <View style={styles.emptyHistoryContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
                    style={styles.emptyHistoryCard}
                  >
                    <Text style={styles.emptyHistory}>No sessions yet</Text>
                    <Text style={styles.emptyHistorySubtitle}>Start your first meditation session to see your history here</Text>
                  </LinearGradient>
                </View>
              ) : history.map((item, idx) => (
                <View key={idx} style={styles.historyItemContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
                    style={styles.historyItem}
                  >
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>Completed</Text>
                      </View>
                    </View>
                    <Text style={styles.historyPrompt}>"{item.userPrompt}"</Text>
                    <Text style={styles.historyScript}>{item.script}</Text>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonGradient: {
    padding: 12,
    borderRadius: 16,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  content: { padding: 20 },
  contentWrapper: { alignItems: 'center' },
  heroSection: { width: '100%', marginBottom: 24 },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  heroIconContainer: {
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  inputSection: { width: '100%', marginBottom: 24 },
  inputCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  inputLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  scriptSection: { width: '100%', marginBottom: 24 },
  scriptCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scriptIconContainer: {
    marginRight: 12,
    borderRadius: 12,
    padding: 10,
  },
  scriptIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  scriptTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 2 },
  scriptSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  scriptScroll: { 
    maxHeight: 200, 
    marginBottom: 20,
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  scriptText: { fontSize: 15, color: '#374151', lineHeight: 24 },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  sessionSection: { width: '100%', marginBottom: 24 },
  sessionCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sessionIconContainer: {
    marginRight: 12,
    borderRadius: 12,
    padding: 10,
  },
  sessionIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  sessionTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 2 },
  sessionSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  breathingContainer: { marginBottom: 24 },
  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  breathingCircleGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    position: 'absolute',
  },
  breathingInner: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 60,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
  },
  scriptStepContainer: { width: '100%', marginBottom: 24 },
  scriptStepText: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    lineHeight: 26,
    minHeight: 60,
  },
  replayButton: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  replayButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  replayButtonText: { color: '#4F46E5', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  progressContainer: { width: '100%' },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: { height: 12, borderRadius: 6 },
  progressText: { color: '#6B7280', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  historyButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  historyButtonText: { color: '#4F46E5', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  historyModal: { flex: 1 },
  historyModalBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  historyModalContent: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeHistory: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeHistoryGradient: {
    padding: 12,
    borderRadius: 16,
  },
  historyTitleContainer: { flex: 1 },
  historyTitleModal: { fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 2 },
  historySubtitleModal: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  historyList: { flex: 1 },
  emptyHistoryContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyHistoryCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  emptyHistory: { color: '#6B7280', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyHistorySubtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  historyItemContainer: { marginBottom: 16 },
  historyItem: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.06)',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  historyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  historyBadgeText: { fontSize: 10, color: '#10B981', fontWeight: '700' },
  historyPrompt: { 
    fontSize: 14, 
    color: '#4F46E5', 
    marginBottom: 8, 
    fontWeight: '600',
    fontStyle: 'italic',
  },
  historyScript: { fontSize: 14, color: '#374151', lineHeight: 20 },
});

export default MeditationScreen; 