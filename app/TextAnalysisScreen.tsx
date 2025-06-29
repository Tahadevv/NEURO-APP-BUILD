import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { PenTool, Send, RefreshCw, Brain, Sparkles, TrendingUp, Heart, Zap, ArrowLeft, CheckCircle, AlertCircle, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileNavbar from '../components/MobileNavbar';

const { width, height } = Dimensions.get('window');

const TextAnalysisScreen = ({ navigation }: any) => {
  const [textContent, setTextContent] = useState('');
  const [textContext, setTextContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [wordCount, setWordCount] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [textContent]);

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
      const history = await AsyncStorage.getItem('text_analysis_history');
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
      await AsyncStorage.setItem('text_analysis_history', JSON.stringify(updatedHistory));
      setAnalysisHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  };

  const analyzeText = async () => {
    if (!textContent.trim()) {
      Alert.alert('No Text', 'Please enter some text to analyze.');
      return;
    }

    if (wordCount < 10) {
      Alert.alert('Text Too Short', 'Please enter at least 10 words for better analysis.');
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

      console.log('Sending text analysis:', {
        content: textContent,
        context: textContext,
      });

      const response = await fetch('http://mohib.eastus.cloudapp.azure.com:8000/mental-health/analyze/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: textContent,
          context: textContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Text analysis response:', data);

      // Mock data for demonstration
      const mockResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        text: textContent,
        context: textContext,
        wordCount: wordCount,
        primary: 'Optimistic',
        confidence: 82,
        emotions: [
          { name: 'Optimistic', score: 82, color: '#10B981' },
          { name: 'Hopeful', score: 12, color: '#3B82F6' },
          { name: 'Neutral', score: 4, color: '#6B7280' },
          { name: 'Slightly Anxious', score: 2, color: '#F59E0B' },
        ],
        sentiment: {
          overall: 'Positive',
          intensity: 'Moderate',
          keywords: ['hope', 'future', 'positive', 'growth']
        },
        insights: [
          'Your writing reflects an optimistic outlook on life',
          'Strong positive sentiment with hopeful undertones',
          'Consider sharing this positive energy with others'
        ]
      };

      setResults(mockResult);
      saveAnalysisHistory(mockResult);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze the text. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setTextContent('');
    setTextContext('');
    setResults(null);
    setWordCount(0);
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
        <PenTool size={28} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Text Analysis</Text>
        <Text style={styles.headerSubtitle}>AI-powered text emotion detection</Text>
      </View>
    </Animated.View>
  );

  const renderTextInput = () => (
    <Animated.View 
      style={[
        styles.inputSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC'] as [string, string]}
        style={styles.inputCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.inputHeader}>
          <FileText size={32} color="#059669" style={styles.inputIcon} />
          <Text style={styles.inputTitle}>Share Your Thoughts</Text>
          <Text style={styles.inputSubtitle}>
            Write about your feelings, experiences, or thoughts for AI analysis
          </Text>
        </View>

        <View style={styles.textInputContainer}>
          <Text style={styles.inputLabel}>How are you feeling today?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts, feelings, or experiences..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={textContent}
            onChangeText={setTextContent}
            maxLength={1000}
          />
          <View style={styles.wordCountContainer}>
            <Text style={styles.wordCountText}>
              {wordCount} words {wordCount < 10 && '(minimum 10 recommended)'}
            </Text>
          </View>
        </View>

        <View style={styles.contextInputContainer}>
          <Text style={styles.inputLabel}>Additional Context (Optional)</Text>
          <TextInput
            style={styles.contextInput}
            placeholder="Any specific events, circumstances, or background..."
            placeholderTextColor="#9CA3AF"
            value={textContext}
            onChangeText={setTextContext}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={analyzeText}
          disabled={analyzing || wordCount < 10}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#059669', '#047857'] as [string, string]}
            style={[
              styles.analyzeButtonGradient,
              { opacity: wordCount < 10 ? 0.5 : 1 }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Brain size={20} color="#FFFFFF" />
            <Text style={styles.analyzeButtonText}>
              {analyzing ? 'Analyzing...' : 'Analyze Text'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
            colors={['#059669', '#047857'] as [string, string]}
            style={styles.analyzingIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={styles.analyzingTitle}>Analyzing Your Text</Text>
          <Text style={styles.analyzingSubtitle}>
            Our AI is processing your words and emotions
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
            <Text style={styles.progressText}>Processing text patterns...</Text>
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
            <Sparkles size={24} color="#059669" style={styles.resultsIcon} />
            <Text style={styles.resultsTitle}>Text Analysis Complete</Text>
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
            colors={['#059669', '#047857'] as [string, string]}
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

        <View style={styles.sentimentContainer}>
          <Text style={styles.sentimentTitle}>Sentiment Analysis</Text>
          <View style={styles.sentimentGrid}>
            <View style={styles.sentimentItem}>
              <Text style={styles.sentimentLabel}>Overall</Text>
              <Text style={styles.sentimentValue}>{results?.sentiment.overall}</Text>
            </View>
            <View style={styles.sentimentItem}>
              <Text style={styles.sentimentLabel}>Intensity</Text>
              <Text style={styles.sentimentValue}>{results?.sentiment.intensity}</Text>
            </View>
            <View style={styles.sentimentItem}>
              <Text style={styles.sentimentLabel}>Words</Text>
              <Text style={styles.sentimentValue}>{results?.wordCount}</Text>
            </View>
          </View>
          
          <View style={styles.keywordsContainer}>
            <Text style={styles.keywordsTitle}>Key Emotions Detected</Text>
            <View style={styles.keywordsList}>
              {results?.sentiment.keywords.map((keyword: string, index: number) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
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
      <Text style={styles.historyTitle}>Recent Text Analyses</Text>
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
              colors={['#ECFDF5', '#D1FAE5'] as [string, string]}
              style={styles.historyIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <PenTool size={24} color="#059669" />
            </LinearGradient>
            <View style={styles.historyContent}>
              <Text style={styles.historyEmotion}>{item.primary}</Text>
              <Text style={styles.historyConfidence}>{item.confidence}%</Text>
              <Text style={styles.historyWords}>{item.wordCount} words</Text>
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
        
        {!results && renderTextInput()}
        
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
  inputSection: {
    padding: 20,
  },
  inputCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  inputHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inputIcon: {
    marginBottom: 12,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  inputSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  wordCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  wordCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  contextInputContainer: {
    marginBottom: 24,
  },
  contextInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  analyzingContainer: {
    padding: 20,
  },
  analyzingCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#059669',
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
    backgroundColor: '#059669',
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
    shadowColor: '#059669',
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
  sentimentContainer: {
    marginBottom: 24,
  },
  sentimentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sentimentGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sentimentItem: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sentimentLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  sentimentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  keywordsContainer: {
    marginTop: 16,
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  keywordText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
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
    shadowColor: '#059669',
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
  historyWords: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default TextAnalysisScreen; 