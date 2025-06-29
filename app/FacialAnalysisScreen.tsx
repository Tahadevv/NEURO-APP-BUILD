import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, Upload, RefreshCw, Brain, Sparkles, TrendingUp, Heart, Zap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileNavbar from '../components/MobileNavbar';

const { width, height } = Dimensions.get('window');

const FacialAnalysisScreen = ({ navigation }: any) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  
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
      const history = await AsyncStorage.getItem('facial_analysis_history');
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
      await AsyncStorage.setItem('facial_analysis_history', JSON.stringify(updatedHistory));
      setAnalysisHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResults(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResults(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
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

      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://mohib.eastus.cloudapp.azure.com:8000/emotion/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Facial analysis response:', data);

      // Mock result for demo
      const mockResult = {
        primary: 'Happy',
        confidence: 87,
        emotions: [
          { name: 'Happy', score: 87, color: '#10B981' },
          { name: 'Neutral', score: 8, color: '#6B7280' },
          { name: 'Surprised', score: 3, color: '#F59E0B' },
          { name: 'Sad', score: 2, color: '#EF4444' },
        ],
        insights: [
          'Your facial expression shows genuine happiness',
          'High confidence in positive emotional state',
          'Consider sharing this mood with others'
        ]
      };

      setResults(mockResult);
      saveAnalysisHistory(mockResult);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setResults(null);
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
        <Brain size={28} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Facial Analysis</Text>
        <Text style={styles.headerSubtitle}>AI-powered emotion detection</Text>
      </View>
    </Animated.View>
  );

  const renderImageUpload = () => (
    <Animated.View 
      style={[
        styles.uploadSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC'] as [string, string]}
        style={styles.uploadCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.uploadHeader}>
          <Camera size={32} color="#3B82F6" style={styles.uploadIcon} />
          <Text style={styles.uploadTitle}>Upload Your Photo</Text>
          <Text style={styles.uploadSubtitle}>
            Our AI will analyze your facial expressions to detect emotions
          </Text>
        </View>

        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={resetAnalysis}
                activeOpacity={0.8}
              >
                <RefreshCw size={16} color="#6B7280" />
                <Text style={styles.actionButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.analyzeButton}
                onPress={analyzeImage}
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
                    {analyzing ? 'Analyzing...' : 'Analyze Emotions'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.uploadOptions}>
            <TouchableOpacity 
              style={styles.uploadOption}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE'] as [string, string]}
                style={styles.uploadOptionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Camera size={32} color="#3B82F6" />
                <Text style={styles.uploadOptionText}>Take Photo</Text>
                <Text style={styles.uploadOptionSubtext}>Use camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.uploadOption}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F0FDF4', '#DCFCE7'] as [string, string]}
                style={styles.uploadOptionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Upload size={32} color="#059669" />
                <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
                <Text style={styles.uploadOptionSubtext}>Select existing photo</Text>
              </LinearGradient>
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
            colors={['#3B82F6', '#1D4ED8'] as [string, string]}
            style={styles.analyzingIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={styles.analyzingTitle}>Analyzing Your Emotions</Text>
          <Text style={styles.analyzingSubtitle}>
            Our AI is processing your facial expressions
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
            <Text style={styles.progressText}>Processing...</Text>
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
            <Sparkles size={24} color="#3B82F6" style={styles.resultsIcon} />
            <Text style={styles.resultsTitle}>Analysis Complete</Text>
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
            colors={['#3B82F6', '#1D4ED8'] as [string, string]}
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
      <Text style={styles.historyTitle}>Recent Analyses</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyList}
      >
        {analysisHistory.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.historyItem}
            onPress={() => {
              setImage(item.image);
              setResults(item);
            }}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image }} style={styles.historyImage} />
            <View style={styles.historyContent}>
              <Text style={styles.historyEmotion}>{item.primary}</Text>
              <Text style={styles.historyConfidence}>{item.confidence}%</Text>
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
        
        {!image && !results && renderImageUpload()}
        
        {image && !analyzing && !results && renderImageUpload()}
        
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
  uploadSection: {
    padding: 20,
  },
  uploadCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  uploadHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadOptions: {
    gap: 16,
  },
  uploadOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadOptionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 2,
  },
  uploadOptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
  analyzingContainer: {
    padding: 20,
  },
  analyzingCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
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
    shadowColor: '#3B82F6',
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
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  historyImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
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
  },
});

export default FacialAnalysisScreen; 