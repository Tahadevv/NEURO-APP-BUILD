import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Mic, Play, Pause, Square, RefreshCw, Brain, Sparkles, TrendingUp, Heart, Zap, ArrowLeft, CheckCircle, AlertCircle, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileNavbar from '../components/MobileNavbar';

const { width, height } = Dimensions.get('window');

const VoiceAnalysisScreen = ({ navigation }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadAnalysisHistory();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  useEffect(() => {
    if (analyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
    }
  }, [analyzing]);

  const loadAnalysisHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('voice_analysis_history');
      if (history) {
        setAnalysisHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  };

  const saveAnalysisHistory = async (newResult: any) => {
    try {
      const updatedHistory = [newResult, ...analysisHistory.slice(0, 9)]; // Keep last 10
      await AsyncStorage.setItem('voice_analysis_history', JSON.stringify(updatedHistory));
      setAnalysisHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Mock recording functionality
      setIsRecording(true);
      setRecordingTime(0);
      
      // Simulate recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Stop recording after 30 seconds (demo)
      setTimeout(() => {
        stopRecording();
        clearInterval(timer);
      }, 30000);
      
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Failed', 'Unable to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioUri('mock-audio-uri'); // Mock audio URI
  };

  const playRecording = () => {
    setIsPlaying(true);
    // Mock play functionality
    setTimeout(() => setIsPlaying(false), 5000);
  };

  const pauseRecording = () => {
    setIsPlaying(false);
  };

  const analyzeVoice = async () => {
    if (!audioUri) {
      Alert.alert('No Recording', 'Please record your voice first.');
      return;
    }

    setAnalyzing(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        setAnalyzing(false);
        return;
      }

      // Mock API call
      setTimeout(() => {
        const mockResult = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          audioUri: audioUri,
          duration: recordingTime,
          primary: 'Calm',
          confidence: 78,
          emotions: [
            { name: 'Calm', score: 78, color: '#10B981' },
            { name: 'Neutral', score: 15, color: '#6B7280' },
            { name: 'Slightly Anxious', score: 5, color: '#F59E0B' },
            { name: 'Happy', score: 2, color: '#3B82F6' },
          ],
          voiceMetrics: {
            pitch: 'Medium',
            pace: 'Steady',
            volume: 'Clear',
            clarity: 'Good'
          },
          insights: [
            'Your voice tone indicates a calm and composed state',
            'Steady pace suggests good emotional regulation',
            'Consider this mood for important conversations'
          ]
        };

        setResults(mockResult);
        saveAnalysisHistory(mockResult);
        setAnalyzing(false);
      }, 3000);

    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze the voice. Please try again.');
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAudioUri(null);
    setResults(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Mic size={28} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Voice Analysis</Text>
        <Text style={styles.headerSubtitle}>AI-powered voice emotion detection</Text>
      </View>
    </Animated.View>
  );

  const renderRecordingSection = () => (
    <Animated.View 
      style={[
        styles.recordingSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC'] as [string, string]}
        style={styles.recordingCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.recordingHeader}>
          <Volume2 size={32} color="#9333EA" style={styles.recordingIcon} />
          <Text style={styles.recordingTitle}>Record Your Voice</Text>
          <Text style={styles.recordingSubtitle}>
            Speak naturally for 30 seconds to analyze your emotional state
          </Text>
        </View>

        {!audioUri ? (
          <View style={styles.recordingControls}>
            {!isRecording ? (
              <TouchableOpacity 
                style={styles.recordButton}
                onPress={startRecording}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9333EA', '#7C3AED'] as [string, string]}
                  style={styles.recordButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Mic size={32} color="#FFFFFF" />
                  <Text style={styles.recordButtonText}>Start Recording</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.recordingActive}>
                <Animated.View 
                  style={[
                    styles.recordingWave,
                    {
                      transform: [{ scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2]
                      })}]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626'] as [string, string]}
                    style={styles.recordingWaveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Square size={32} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                <Text style={styles.recordingStatus}>Recording...</Text>
                <TouchableOpacity 
                  style={styles.stopButton}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stopButtonText}>Stop Recording</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.playbackControls}>
            <View style={styles.playbackInfo}>
              <Text style={styles.playbackDuration}>{formatTime(recordingTime)}</Text>
              <Text style={styles.playbackStatus}>Recording Complete</Text>
            </View>
            
            <View style={styles.playbackButtons}>
              {!isPlaying ? (
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={playRecording}
                  activeOpacity={0.8}
                >
                  <Play size={24} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.pauseButton}
                  onPress={pauseRecording}
                  activeOpacity={0.8}
                >
                  <Pause size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.analyzeButton}
                onPress={analyzeVoice}
                disabled={analyzing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8'] as [string, string]}
                  style={styles.analyzeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Brain size={20} color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>
                    {analyzing ? 'Analyzing...' : 'Analyze Voice'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.rerecordButton}
              onPress={resetAnalysis}
              activeOpacity={0.8}
            >
              <RefreshCw size={16} color="#6B7280" />
              <Text style={styles.rerecordButtonText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const renderAnalyzing = () => (
    <Animated.View 
      style={[
        styles.analyzingContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC'] as [string, string]}
        style={styles.analyzingCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.analyzingContent}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED'] as [string, string]}
            style={styles.analyzingIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={styles.analyzingTitle}>Analyzing Your Voice</Text>
          <Text style={styles.analyzingSubtitle}>
            Our AI is processing your voice patterns and tone
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Processing voice patterns...</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderResults = () => (
    <Animated.View 
      style={[
        styles.resultsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC'] as [string, string]}
        style={styles.resultsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.resultsHeader}>
          <View style={styles.resultsTitleContainer}>
            <Sparkles size={24} color="#9333EA" style={styles.resultsIcon} />
            <Text style={styles.resultsTitle}>Voice Analysis Complete</Text>
          </View>
          <TouchableOpacity 
            onPress={resetAnalysis}
            style={styles.resetButton}
          >
            <RefreshCw size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.primaryEmotionContainer}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED'] as [string, string]}
            style={styles.primaryEmotionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CheckCircle size={32} color="#FFFFFF" style={styles.checkIcon} />
            <Text style={styles.primaryEmotionText}>{results?.primary}</Text>
            <Text style={styles.primaryEmotionLabel}>Primary Emotion</Text>
            <View style={styles.confidenceContainer}>
              <TrendingUp size={16} color="#FFFFFF" />
              <Text style={styles.confidenceText}>
                <Text style={styles.confidenceValue}>{results?.confidence}%</Text> confidence
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.voiceMetricsContainer}>
          <Text style={styles.metricsTitle}>Voice Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pitch</Text>
              <Text style={styles.metricValue}>{results?.voiceMetrics.pitch}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pace</Text>
              <Text style={styles.metricValue}>{results?.voiceMetrics.pace}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>{results?.voiceMetrics.volume}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Clarity</Text>
              <Text style={styles.metricValue}>{results?.voiceMetrics.clarity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.emotionsBreakdown}>
          <Text style={styles.breakdownTitle}>Emotion Breakdown</Text>
          {results?.emotions.map((emotion: any, index: number) => (
            <View key={emotion.name} style={styles.emotionItem}>
              <View style={styles.emotionHeader}>
                <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                <Text style={styles.emotionName}>{emotion.name}</Text>
                <Text style={styles.emotionScore}>{emotion.score}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${emotion.score}%`,
                        backgroundColor: emotion.color
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>AI Insights</Text>
          {results?.insights.map((insight: string, index: number) => (
            <View key={index} style={styles.insightItem}>
              <Zap size={16} color="#F59E0B" style={styles.insightIcon} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderHistory = () => (
    <Animated.View 
      style={[
        styles.historyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.historyTitle}>Recent Voice Analyses</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyList}
      >
        {analysisHistory.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.historyItem}
            onPress={() => setResults(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F3E8FF', '#E9D5FF'] as [string, string]}
              style={styles.historyIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Mic size={24} color="#9333EA" />
            </LinearGradient>
            <View style={styles.historyContent}>
              <Text style={styles.historyEmotion}>{item.primary}</Text>
              <Text style={styles.historyConfidence}>{item.confidence}%</Text>
              <Text style={styles.historyDuration}>{formatTime(item.duration)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#F8FAFC', '#E0E7FF'] as [string, string]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        {!audioUri && !results && renderRecordingSection()}
        
        {audioUri && !analyzing && !results && renderRecordingSection()}
        
        {analyzing && renderAnalyzing()}
        
        {results && renderResults()}
        
        {analysisHistory.length > 0 && !analyzing && renderHistory()}
      </ScrollView>
      
      <MobileNavbar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerIcon: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recordingSection: {
    padding: 20,
  },
  recordingCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#9333EA',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  recordingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingIcon: {
    marginBottom: 12,
  },
  recordingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  recordingActive: {
    alignItems: 'center',
  },
  recordingWave: {
    marginBottom: 16,
  },
  recordingWaveGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordingStatus: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 16,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playbackControls: {
    alignItems: 'center',
  },
  playbackInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playbackDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  playbackStatus: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  playbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rerecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  rerecordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  analyzingContainer: {
    padding: 20,
  },
  analyzingCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  analyzingContent: {
    alignItems: 'center',
  },
  analyzingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#9333EA',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsIcon: {
    marginRight: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  primaryEmotionContainer: {
    marginBottom: 24,
  },
  primaryEmotionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  primaryEmotionText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  primaryEmotionLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  confidenceValue: {
    fontWeight: '700',
  },
  voiceMetricsContainer: {
    marginBottom: 24,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  emotionsBreakdown: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emotionItem: {
    marginBottom: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  emotionScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  historyContainer: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  historyList: {
    paddingRight: 20,
  },
  historyItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#9333EA',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyContent: {
    alignItems: 'center',
  },
  historyEmotion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyConfidence: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  historyDuration: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default VoiceAnalysisScreen; 