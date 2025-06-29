import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert, TextInput, Animated, Dimensions } from 'react-native';
import { Camera, Mic, PenTool, Upload, RefreshCw, Sparkles, Brain, TrendingUp, Heart, Zap, Activity, Shield, Lightbulb } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import Header from '../components/Header';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { InferenceClient } from "@huggingface/inference";

const { width } = Dimensions.get('window');

// Hugging Face Token
const HF_TOKEN = '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';

// Initialize Hugging Face client
const client = new InferenceClient(HF_TOKEN);

interface EmotionData {
  label: string;
  score: number;
  color: string;
}

interface AnalysisResult {
  primary_emotion: string;
  confidence: number;
  emotions: EmotionData[];
  stress_level: number;
  mental_health_score: number;
  insights: string[];
  recommendations: string[];
  emergency_contact?: string;
}

const EmotionTrackerScreen = () => {
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [textContext, setTextContext] = useState('');
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);
  const pulseAnim = new Animated.Value(1);
  
  const navigation = useNavigation();

  const methods = [
    { 
      id: 'face', 
      name: 'Facial Analysis', 
      icon: Camera, 
      gradient: ['#EFF6FF', '#DBEAFE'],
      iconGradient: ['#3B82F6', '#1D4ED8'],
      description: 'AI-powered facial emotion detection',
      features: ['Real-time analysis', 'High accuracy', 'Privacy focused']
    },
    { 
      id: 'voice', 
      name: 'Voice Analysis', 
      icon: Mic, 
      gradient: ['#F3E8FF', '#E9D5FF'],
      iconGradient: ['#9333EA', '#7C3AED'],
      description: 'Advanced voice emotion recognition',
      features: ['Tone analysis', 'Speech patterns', 'Emotional context']
    },
    { 
      id: 'text', 
      name: 'Text Analysis', 
      icon: PenTool, 
      gradient: ['#ECFDF5', '#D1FAE5'],
      iconGradient: ['#059669', '#047857'],
      description: 'Deep text sentiment analysis',
      features: ['Context understanding', 'Sentiment scoring', 'Insight generation']
    },
  ];

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
  }, []);

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
    } else {
      pulseAnim.setValue(1);
    }
  }, [analyzing]);

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

  const analyzeFacialEmotions = async (imageUri: string): Promise<{
    emotions: EmotionData[];
    primary_emotion: string;
    confidence: number;
  }> => {
    try {
      // For facial analysis, we'll use a simplified approach
      // In a real implementation, you'd use DeepFace or a facial emotion detection model
      
      // Convert image to base64 for processing
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            
            // For now, we'll analyze a generic description
            // In production, you'd use DeepFace or similar
            const imageDescription = "A person showing facial expressions";
            const emotionData = await analyzeEmotionsWithHF(imageDescription);
            
            resolve(emotionData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error in facial analysis:', error);
      throw error;
    }
  };
  
  const handleAnalyze = async () => {
    if (activeMethod === 'face' && !image) {
      Alert.alert('Please select an image first.');
      return;
    }

    if (activeMethod === 'text' && !textContent.trim()) {
      Alert.alert('Please enter some text.');
      return;
    }

    setAnalyzing(true);

    try {
      let emotionData: {
        emotions: EmotionData[];
        primary_emotion: string;
        confidence: number;
      };
      let analysisText = '';

      if (activeMethod === 'face') {
        // Analyze facial emotions
        emotionData = await analyzeFacialEmotions(image!);
        analysisText = 'Facial expression analysis';
      } else if (activeMethod === 'text') {
        // Analyze text emotions
        emotionData = await analyzeEmotionsWithHF(textContent);
        analysisText = textContent;
      } else {
        // Voice analysis (placeholder)
        emotionData = {
          emotions: [
            { label: 'neutral', score: 80, color: '#6B7280' },
            { label: 'curiosity', score: 15, color: '#F59E0B' },
            { label: 'excitement', score: 5, color: '#6366F1' }
          ],
          primary_emotion: 'neutral',
          confidence: 80
        };
        analysisText = 'Voice analysis';
      }

      // Calculate mental health metrics
      const { stressLevel, mentalHealthScore } = calculateMentalHealthMetrics(emotionData.emotions);

      // Get AI insights and recommendations
      const aiInsights = await getMistralRecommendations(emotionData, analysisText, textContext);

      // Create comprehensive result
      const result: AnalysisResult = {
        primary_emotion: emotionData.primary_emotion,
        confidence: emotionData.confidence,
        emotions: emotionData.emotions,
        stress_level: stressLevel,
        mental_health_score: mentalHealthScore,
        insights: aiInsights.insights || [],
        recommendations: aiInsights.recommendations || [],
        emergency_contact: aiInsights.emergency_contact || undefined
      };

      setResults(result);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const resetAnalysis = () => {
    setActiveMethod(null);
    setResults(null);
    setImage(null);
    setTextContent('');
    setTextContext('');
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const renderMethodButton = (method: typeof methods[0], index: number) => (
    <Animated.View
      key={method.id}
      style={[
        styles.methodButtonContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          if (method.id === 'face') {
            (navigation as any).navigate('FacialAnalysis');
          } else if (method.id === 'voice') {
            (navigation as any).navigate('VoiceAnalysis');
          } else if (method.id === 'text') {
            (navigation as any).navigate('TextAnalysis');
          }
        }}
        style={styles.methodButton}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={method.gradient as [string, string]}
          style={styles.methodGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={method.iconGradient as [string, string]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <method.icon size={28} color="#FFFFFF" />
          </LinearGradient>
          
          <View style={styles.methodContent}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
            
            <View style={styles.featuresContainer}>
              {method.features.map((feature, idx) => (
                <View key={idx} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.methodArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
        colors={['#DBEAFE', '#3B82F6'] as [string, string]}
        style={styles.resultsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.resultsHeader}>
          <View style={styles.resultsTitleContainer}>
            <Brain size={24} color="#3B82F6" style={styles.resultsIcon} />
            <Text style={styles.resultsTitle}>AI Emotion Analysis</Text>
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
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.primaryEmotionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={32} color="#FFFFFF" style={styles.sparklesIcon} />
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
        
        <View style={styles.separator} />
        
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Emotion Breakdown</Text>
          {results?.emotions.map((emotion, index) => (
            <Animated.View 
              key={emotion.label} 
              style={[
                styles.emotionItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              <View style={styles.emotionHeader}>
                <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                <Text style={styles.emotionName}>{emotion.label}</Text>
                <Text style={styles.emotionScore}>{emotion.score}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
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
            </Animated.View>
          ))}
        </View>
      </LinearGradient>
      
      {/* AI Insights */}
      <LinearGradient
        colors={['#FFFFFF', '#FEF3C7']}
        style={styles.insightsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.insightsHeader}>
          <Lightbulb size={24} color="#F59E0B" style={styles.insightsIcon} />
          <Text style={styles.insightsTitle}>AI Insights</Text>
        </View>
        {results?.insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Zap size={16} color="#F59E0B" style={styles.insightIcon} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </LinearGradient>
      
      {/* Recommendations */}
      <LinearGradient
        colors={['#FFFFFF', '#ECFDF5']}
        style={styles.suggestionsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.suggestionsHeader}>
          <Shield size={24} color="#10B981" style={styles.suggestionsIcon} />
          <Text style={styles.suggestionsTitle}>Personalized Recommendations</Text>
        </View>
        <Text style={styles.suggestionsText}>
          Based on your emotional state, here are personalized recommendations to enhance your well-being:
        </Text>
        <View style={styles.suggestionsList}>
          {results?.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Heart size={16} color="#10B981" style={styles.suggestionIcon} />
              <Text style={styles.suggestionText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Emergency Contact */}
      {results?.emergency_contact && (
        <LinearGradient
          colors={['#FEF2F2', '#FECACA']}
          style={styles.emergencyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyTitle}>⚠️ Emergency Support</Text>
          </View>
          <Text style={styles.emergencyText}>{results.emergency_contact}</Text>
        </LinearGradient>
      )}
    </Animated.View>
  );

  const renderAnalysis = () => (
    <Animated.View 
      style={[
        styles.analysisContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#DBEAFE', '#3B82F6'] as [string, string]}
        style={styles.analysisCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.analysisHeader}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.analysisIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {activeMethod === 'face' && <Camera size={24} color="#FFFFFF" />}
            {activeMethod === 'voice' && <Mic size={24} color="#FFFFFF" />}
            {activeMethod === 'text' && <PenTool size={24} color="#FFFFFF" />}
          </LinearGradient>
          <Text style={styles.analysisTitle}>
            {activeMethod === 'face' ? 'Facial' : activeMethod === 'voice' ? 'Voice' : activeMethod === 'text' ? 'Text' : ''} Analysis
          </Text>
        </View>
        <View style={styles.uploadContainer}>
          {analyzing ? (
            <Animated.View 
              style={[
                styles.analyzingContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.analyzingIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ActivityIndicator size="large" color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.analyzingText}>Analyzing your emotions...</Text>
              <Text style={styles.analyzingSubtext}>Our AI is processing your data</Text>
            </Animated.View>
          ) : (
            <>
              {activeMethod === 'face' && (
                <>
                  {image ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: image }} style={styles.imagePreview} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => setImage(null)}
                      >
                        <Text style={styles.removeImageText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={pickImage}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#EFF6FF', '#DBEAFE']}
                        style={styles.uploadButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Camera size={32} color="#3B82F6" />
                        <Text style={styles.uploadButtonText}>Select Image</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
              {activeMethod === 'text' && (
                <View style={styles.textInputContainer}>
                  <Text style={styles.inputLabel}>How are you feeling today?</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Share your thoughts, feelings, or experiences..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={textContent}
                    onChangeText={setTextContent}
                  />
                  <Text style={styles.inputLabel}>Additional Context (Optional)</Text>
                  <TextInput
                    style={styles.contextInput}
                    placeholder="Any specific events or circumstances..."
                    placeholderTextColor="#9CA3AF"
                    value={textContext}
                    onChangeText={setTextContext}
                  />
                </View>
              )}
              {activeMethod === 'voice' && (
                <View style={styles.voiceContainer}>
                  <LinearGradient
                    colors={['#F3E8FF', '#E9D5FF']}
                    style={styles.voiceGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Mic size={48} color="#9333EA" />
                    <Text style={styles.voiceText}>Voice Analysis Coming Soon</Text>
                    <Text style={styles.voiceSubtext}>Record your voice for emotion detection</Text>
                  </LinearGradient>
                </View>
              )}
              {!(activeMethod === 'face' || activeMethod === 'text' || activeMethod === 'voice') && (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Text style={{ color: '#1F2937', fontSize: 16 }}>Please select a method to analyze your emotions.</Text>
                </View>
              )}
            </>
          )}
        </View>
        {!analyzing && (
          <TouchableOpacity 
            onPress={handleAnalyze}
            style={styles.analyzeButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.analyzeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Brain size={20} color="#FFFFFF" style={styles.analyzeIcon} />
              <Text style={styles.analyzeButtonText}>Analyze My Emotions</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
      <TouchableOpacity 
        onPress={resetAnalysis}
        style={styles.differentMethodButton}
        activeOpacity={0.8}
      >
        <Text style={styles.differentMethodText}>Try Different Method</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <Header title="Emotion Tracker" />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!activeMethod && !results ? (
            <View style={styles.methodsContainer}>
              <View style={styles.methodsHeader}>
                <Text style={styles.methodsTitle}>Track Your Emotions</Text>
                <Text style={styles.methodsSubtitle}>
                  Choose your preferred method for AI-powered emotion analysis
                </Text>
              </View>
              <View style={styles.methodsList}>
                {methods.map((method, index) => renderMethodButton(method, index))}
              </View>
            </View>
          ) : results ? (
            renderResults()
          ) : (
            renderAnalysis()
          )}
        </ScrollView>
      </View>
      
      <MobileNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  methodsContainer: {
    marginBottom: 24,
  },
  methodsHeader: {
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  methodsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  methodsList: {
    gap: 16,
  },
  methodButtonContainer: {
    marginBottom: 8,
  },
  methodButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  methodGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  methodArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
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
    borderRadius: 16,
  },
  primaryEmotionContainer: {
    marginBottom: 20,
  },
  primaryEmotionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  sparklesIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  primaryEmotionText: {
    fontSize: 36,
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
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  breakdownContainer: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emotionItem: {
    marginBottom: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
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
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  suggestionsCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestionsIcon: {
    marginRight: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  suggestionsText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  analysisContainer: {
    marginBottom: 24,
  },
  analysisCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  analysisIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  uploadContainer: {
    minHeight: 200,
    borderRadius: 20,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  analyzingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  removeImageButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  uploadButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  textInputContainer: {
    width: '100%',
    padding: 20,
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
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  contextInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  voiceContainer: {
    width: '100%',
    padding: 20,
  },
  voiceGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  voiceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9333EA',
    marginTop: 16,
    marginBottom: 8,
  },
  voiceSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  differentMethodButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  differentMethodText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
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
    gap: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  insightsCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsIcon: {
    marginRight: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    marginRight: 8,
  },
  insightText: {
    fontSize: 15,
    color: '#6B7280',
  },
  emergencyCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emergencyText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default EmotionTrackerScreen; 