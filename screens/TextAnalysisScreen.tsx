import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { PenTool, Send, RefreshCw, Brain, Sparkles, TrendingUp, Heart, Zap, ArrowLeft, CheckCircle, AlertCircle, FileText, Activity, Shield, Lightbulb } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileNavbar from '../components/MobileNavbar';
import { InferenceClient } from "@huggingface/inference";

const { width, height } = Dimensions.get('window');

// Hugging Face Token
const HF_TOKEN = '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';

// Initialize Hugging Face client
const client = new InferenceClient(HF_TOKEN);

interface EmotionData {
  label: string;
  score: number;
  color: string;
}

interface TextAnalysisResult {
  id: number;
  timestamp: string;
  text: string;
  context: string;
  wordCount: number;
  primary_emotion: string;
  confidence: number;
  emotions: EmotionData[];
  stress_level: number;
  mental_health_score: number;
  insights: string[];
  recommendations: string[];
  emergency_contact?: string;
}

const TextAnalysisScreen = ({ navigation }: any) => {
  const [textContent, setTextContent] = useState('');
  const [textContext, setTextContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<TextAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<TextAnalysisResult[]>([]);
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

  const saveAnalysisHistory = async (newResult: TextAnalysisResult) => {
    try {
      const updatedHistory = [newResult, ...analysisHistory.slice(0, 9)]; // Keep last 10
      await AsyncStorage.setItem('text_analysis_history', JSON.stringify(updatedHistory));
      setAnalysisHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  };

  const getEmotionColor = (emotion: string): string => {
    const colorMap: { [key: string]: string } = {
      'joy': '#10B981',
      'love': '#EC4899',
      'optimism': '#3B82F6',
      'relief': '#8B5CF6',
      'surprise': '#F59E0B',
      'neutral': '#6B7280',
      'confusion': '#F97316',
      'disappointment': '#EF4444',
      'nervousness': '#7C3AED',
      'disgust': '#059669',
      'embarrassment': '#DC2626',
      'sadness': '#1E40AF',
      'fear': '#7C2D12',
      'anger': '#DC2626',
      'grief': '#1F2937',
      'pride': '#F59E0B',
      'excitement': '#6366F1',
      'admiration': '#3B82F6',
      'amusement': '#7C3AED',
      'approval': '#059669',
      'caring': '#EC4899',
      'curiosity': '#F59E0B',
      'desire': '#DC2626',
      'disapproval': '#EF4444',
      'realization': '#6B7280',
      'remorse': '#1E40AF',
      'annoyance': '#F97316',
      'gratitude': '#10B981'
    };
    return colorMap[emotion.toLowerCase()] || '#6B7280';
  };

  const analyzeEmotionsWithHF = async (text: string) => {
    try {
      const output = await client.textClassification({
        model: "SamLowe/roberta-base-go_emotions",
        inputs: text,
        provider: "hf-inference",
      });

      console.log('Hugging Face emotion analysis:', output);

      // Process the results
      const emotions = output.map((item: any) => ({
        label: item.label,
        score: Math.round(item.score * 100),
        color: getEmotionColor(item.label)
      }));

      // Sort by score and get top emotions
      const sortedEmotions = emotions.sort((a: EmotionData, b: EmotionData) => b.score - a.score);
      const topEmotions = sortedEmotions.slice(0, 6);

      return {
        emotions: topEmotions,
        primary_emotion: topEmotions[0].label,
        confidence: topEmotions[0].score
      };
    } catch (error) {
      console.error('Error analyzing emotions with HF:', error);
      throw error;
    }
  };

  const getMistralRecommendations = async (emotionData: any, text: string, context: string) => {
    try {
      const prompt = `As a mental health AI assistant, analyze this text and provide helpful insights and recommendations:

Text: "${text}"
Context: ${context || 'No specific context provided'}

Emotion Analysis:
Primary Emotion: ${emotionData.primary_emotion}
Confidence: ${emotionData.confidence}%
Top Emotions: ${emotionData.emotions.map((e: EmotionData) => `${e.label} (${e.score}%)`).join(', ')}

Please provide:
1. 3-4 specific insights about the emotional state and mental health
2. 3-4 personalized recommendations for mental wellness
3. Stress management techniques if negative emotions are high
4. Emergency contact suggestion if concerning mental health patterns are detected

Format as JSON with keys: insights, recommendations, emergency_contact`;

      const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      console.log('Mistral AI response:', chatCompletion);

      // Try to parse JSON from the response
      try {
        const responseText = chatCompletion.choices[0]?.message?.content;
        if (!responseText) {
          return createFallbackInsights(emotionData, text);
        }
        
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd !== 0) {
          const parsed = JSON.parse(responseText.substring(jsonStart, jsonEnd));
          return parsed;
        } else {
          return createFallbackInsights(emotionData, text);
        }
      } catch {
        return createFallbackInsights(emotionData, text);
      }
    } catch (error) {
      console.error('Error getting Mistral recommendations:', error);
      return createFallbackInsights(emotionData, text);
    }
  };

  const createFallbackInsights = (emotionData: any, text: string) => {
    const primaryEmotion = emotionData.primary_emotion;
    const isPositive = ['joy', 'love', 'optimism', 'relief', 'excitement', 'gratitude', 'pride'].includes(primaryEmotion.toLowerCase());
    
    const insights = [
      `Your text reflects a ${isPositive ? 'positive' : 'challenging'} emotional state`,
      `Primary emotion detected: ${primaryEmotion}`,
      `${isPositive ? 'Consider sharing this positive energy' : 'Consider seeking support'}`
    ];

    const recommendations = isPositive ? [
      'Maintain your positive outlook',
      'Share your good feelings with others',
      'Continue your wellness routine'
    ] : [
      'Practice mindfulness techniques',
      'Consider talking to someone you trust',
      'Engage in self-care activities'
    ];

    return {
      insights,
      recommendations,
      emergency_contact: null
    };
  };

  const calculateMentalHealthMetrics = (emotions: EmotionData[]) => {
    // Define negative emotions for stress calculation
    const negativeEmotions = ['sadness', 'fear', 'anger', 'disgust', 'grief', 'remorse', 'annoyance', 'disappointment', 'nervousness', 'embarrassment'];
    const positiveEmotions = ['joy', 'love', 'optimism', 'relief', 'excitement', 'gratitude', 'pride', 'admiration', 'amusement', 'approval', 'caring'];

    // Calculate stress level based on negative emotions
    const negativeScore = emotions
      .filter(e => negativeEmotions.includes(e.label.toLowerCase()))
      .reduce((sum, e) => sum + e.score, 0);
    
    const stressLevel = Math.min(100, Math.round(negativeScore * 1.5));

    // Calculate mental health score
    const positiveScore = emotions
      .filter(e => positiveEmotions.includes(e.label.toLowerCase()))
      .reduce((sum, e) => sum + e.score, 0);
    
    const mentalHealthScore = Math.max(0, Math.min(100, positiveScore - negativeScore + 50));

    return { stressLevel, mentalHealthScore };
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
      // Step 1: Analyze emotions with Hugging Face
      console.log('Analyzing emotions with Hugging Face...');
      const emotionData = await analyzeEmotionsWithHF(textContent);

      // Step 2: Calculate mental health metrics
      const { stressLevel, mentalHealthScore } = calculateMentalHealthMetrics(emotionData.emotions);

      // Step 3: Get AI insights and recommendations from Mistral
      console.log('Getting recommendations from Mistral AI...');
      const aiInsights = await getMistralRecommendations(emotionData, textContent, textContext);

      // Step 4: Create comprehensive result
      const result: TextAnalysisResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        text: textContent,
        context: textContext,
        wordCount: wordCount,
        primary_emotion: emotionData.primary_emotion,
        confidence: emotionData.confidence,
        emotions: emotionData.emotions,
        stress_level: stressLevel,
        mental_health_score: mentalHealthScore,
        insights: aiInsights.insights || [],
        recommendations: aiInsights.recommendations || [],
        emergency_contact: aiInsights.emergency_contact || undefined
      };

      console.log('Text analysis result:', result);
      setResults(result);
      saveAnalysisHistory(result);
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

  const getStressLevelColor = (level: number) => {
    if (level >= 70) return '#EF4444';
    if (level >= 40) return '#F59E0B';
    return '#10B981';
  };

  const getMentalHealthColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
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
        <Text style={styles.headerSubtitle}>AI-powered emotion & mental health detection</Text>
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
            Our AI is processing your words and emotions with Hugging Face & Mistral AI
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
            <Text style={styles.progressText}>Processing with AI models...</Text>
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

        {/* Primary Emotion */}
        <View style={styles.primaryEmotionContainer}>
          <LinearGradient
            colors={['#059669', '#047857'] as [string, string]}
            style={styles.primaryEmotionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CheckCircle size={32} color="#FFFFFF" style={styles.checkIcon} />
            <Text style={styles.primaryEmotionText}>{results?.primary_emotion}</Text>
            <Text style={styles.primaryEmotionLabel}>Primary Emotion</Text>
            <View style={styles.confidenceContainer}>
              <TrendingUp size={16} color="#FFFFFF" />
              <Text style={styles.confidenceText}>
                <Text style={styles.confidenceValue}>{results?.confidence}%</Text> confidence
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Mental Health Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Mental Health Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Activity size={24} color={getStressLevelColor(results?.stress_level || 0)} />
              <Text style={styles.metricValue}>{results?.stress_level}%</Text>
              <Text style={styles.metricLabel}>Stress Level</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Heart size={24} color={getMentalHealthColor(results?.mental_health_score || 0)} />
              <Text style={styles.metricValue}>{results?.mental_health_score}%</Text>
              <Text style={styles.metricLabel}>Mental Health Score</Text>
            </View>
          </View>
        </View>

        {/* Emotion Breakdown */}
        <View style={styles.emotionsBreakdown}>
          <Text style={styles.breakdownTitle}>Emotion Breakdown</Text>
          {results?.emotions.map((emotion: EmotionData, index: number) => (
            <View key={emotion.label} style={styles.emotionItem}>
              <View style={styles.emotionHeader}>
                <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                <Text style={styles.emotionName}>{emotion.label}</Text>
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

        {/* AI Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>
            <Lightbulb size={20} color="#F59E0B" style={styles.insightIcon} />
            AI Insights
          </Text>
          {results?.insights.map((insight: string, index: number) => (
            <View key={index} style={styles.insightItem}>
              <Zap size={16} color="#F59E0B" style={styles.insightIcon} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>
            <Shield size={20} color="#10B981" style={styles.recommendationIcon} />
            Personalized Recommendations
          </Text>
          {results?.recommendations.map((recommendation: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <CheckCircle size={16} color="#10B981" style={styles.recommendationIcon} />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        {results?.emergency_contact && (
          <View style={styles.emergencyContainer}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.emergencyText}>{results.emergency_contact}</Text>
          </View>
        )}
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
              <Text style={styles.historyEmotion}>{item.primary_emotion}</Text>
              <Text style={styles.historyConfidence}>{item.confidence}%</Text>
              <Text style={styles.historyWords}>{item.wordCount} words</Text>
              <Text style={styles.historyStress}>Stress: {item.stress_level}%</Text>
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
  metricsContainer: {
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
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    marginRight: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    marginRight: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    fontWeight: '600',
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
    marginBottom: 2,
  },
  historyStress: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default TextAnalysisScreen; 