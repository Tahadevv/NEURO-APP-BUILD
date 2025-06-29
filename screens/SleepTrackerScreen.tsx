import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal,
  TextInput,
  Switch,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { Moon, Clock, Calendar, Music, ArrowRight, LineChart, Heart, Play, Pause, Plus, X, Target, TrendingUp, AlertCircle, Zap, Star, Activity } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';
import { BarChart } from 'react-native-chart-kit';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

interface SleepSession {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  totalSleep: number; // in hours
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  sleepQuality: number; // 0-100
  notes: string;
}

interface SleepGoal {
  targetHours: number;
  bedTime: string;
  wakeTime: string;
  daysActive: string[];
}

interface SleepSound {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  isPlaying: boolean;
  uri?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_MAX_WIDTH = 440;

const SleepTrackerScreen = () => {
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [sleepGoal, setSleepGoal] = useState<SleepGoal>({
    targetHours: 8,
    bedTime: '22:00',
    wakeTime: '06:00',
    daysActive: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });
  const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [playingSound, setPlayingSound] = useState<SleepSound | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const sleepSounds: SleepSound[] = [
    { id: '1', name: 'Gentle Rain', category: 'Nature', duration: 45, isPlaying: false },
    { id: '2', name: 'Ocean Waves', category: 'Nature', duration: 60, isPlaying: false },
    { id: '3', name: 'Forest Evening', category: 'Nature', duration: 30, isPlaying: false },
    { id: '4', name: 'White Noise', category: 'Ambient', duration: 60, isPlaying: false },
    { id: '5', name: 'Soft Static', category: 'Ambient', duration: 45, isPlaying: false },
    { id: '6', name: 'Body Scan Meditation', category: 'Guided', duration: 20, isPlaying: false },
  ];

  useEffect(() => {
    loadSleepData();
    loadSleepGoal();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Pulse animation for tracking button
  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  const loadSleepData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@sleep_sessions');
      if (stored) {
        setSleepSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sleep data:', error);
    }
  };

  const saveSleepData = async (data: SleepSession[]) => {
    try {
      await AsyncStorage.setItem('@sleep_sessions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save sleep data:', error);
    }
  };

  const loadSleepGoal = async () => {
    try {
      const stored = await AsyncStorage.getItem('@sleep_goal');
      if (stored) {
        setSleepGoal(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sleep goal:', error);
    }
  };

  const saveSleepGoal = async (goal: SleepGoal) => {
    try {
      await AsyncStorage.setItem('@sleep_goal', JSON.stringify(goal));
    } catch (error) {
      console.error('Failed to save sleep goal:', error);
    }
  };

  const startSleepTracking = () => {
    const now = new Date();
    const newSession: SleepSession = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      bedTime: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      wakeTime: '',
      totalSleep: 0,
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      sleepQuality: 0,
      notes: ''
    };
    
    setCurrentSession(newSession);
    setIsTracking(true);
    Alert.alert('Sleep Tracking Started', 'Your sleep session is now being tracked. Tap "End Session" when you wake up.');
  };

  const endSleepTracking = () => {
    if (!currentSession) return;
    
    const now = new Date();
    const bedTime = new Date(`2000-01-01T${currentSession.bedTime}`);
    const wakeTime = new Date(`2000-01-01T${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`);
    
    let totalHours = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
    if (totalHours < 0) totalHours += 24; // Handle overnight sleep
    
    // Simulate sleep stage analysis (in real app, this would come from wearable data)
    const deepSleep = Math.round(totalHours * 0.25 * 10) / 10;
    const lightSleep = Math.round(totalHours * 0.55 * 10) / 10;
    const remSleep = Math.round(totalHours * 0.20 * 10) / 10;
    
    // Calculate sleep quality based on duration and consistency
    let quality = 100;
    if (totalHours < 6) quality -= 30;
    else if (totalHours > 9) quality -= 20;
    else if (totalHours >= 7 && totalHours <= 8) quality += 10;
    
    const completedSession: SleepSession = {
      ...currentSession,
      wakeTime: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      totalSleep: Math.round(totalHours * 10) / 10,
      deepSleep,
      lightSleep,
      remSleep,
      sleepQuality: Math.max(0, Math.min(100, quality))
    };
    
    const updatedSessions = [completedSession, ...sleepSessions];
    setSleepSessions(updatedSessions);
    saveSleepData(updatedSessions);
    
    setCurrentSession(null);
    setIsTracking(false);
    
    Alert.alert(
      'Sleep Session Complete',
      `You slept for ${completedSession.totalSleep} hours.\nSleep Quality: ${completedSession.sleepQuality}/100`,
      [{ text: 'OK' }]
    );
  };

  const playSleepSound = async (sleepSound: SleepSound) => {
    try {
      if (playingSound?.id === sleepSound.id) {
        // Stop current sound
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        setPlayingSound(null);
        setSound(null);
        return;
      }

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // For demo purposes, we'll use a simple beep sound
      // In a real app, you'd load actual audio files from your assets
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }, // Demo sound
        { shouldPlay: false, isLooping: true },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setPlayingSound(null);
            }
          } else {
            setPlayingSound(null);
          }
        }
      );

      setSound(newSound);
      setPlayingSound(sleepSound);
      
      // Play the sound
      await newSound.playAsync();
      console.log(`Playing sleep sound: ${sleepSound.name}`);
      
      // Auto-stop after duration (for demo)
      setTimeout(async () => {
        if (newSound) {
          await newSound.stopAsync();
          await newSound.unloadAsync();
        }
        setPlayingSound(null);
        setSound(null);
      }, sleepSound.duration * 60 * 1000); // Convert minutes to milliseconds
      
    } catch (error) {
      console.error('Error playing sleep sound:', error);
      Alert.alert('Audio Error', 'Could not play sleep sound. Please try again.');
      setPlayingSound(null);
      setSound(null);
    }
  };

  const getSleepInsights = () => {
    if (sleepSessions.length === 0) return null;
    
    const recentSessions = sleepSessions.slice(0, 7);
    const avgSleep = recentSessions.reduce((sum, session) => sum + session.totalSleep, 0) / recentSessions.length;
    const avgQuality = recentSessions.reduce((sum, session) => sum + session.sleepQuality, 0) / recentSessions.length;
    
    const insights = [];
    
    if (avgSleep < 7) {
      insights.push('You\'re getting less sleep than recommended. Try going to bed earlier.');
    } else if (avgSleep > 9) {
      insights.push('You\'re sleeping more than average. Consider if you need this much sleep.');
    }
    
    if (avgQuality < 70) {
      insights.push('Your sleep quality could improve. Try reducing screen time before bed.');
    }
    
    if (recentSessions.length >= 3) {
      const consistency = recentSessions.every((session, i) => {
        if (i === 0) return true;
        const prevSession = recentSessions[i - 1];
        const timeDiff = Math.abs(new Date(session.bedTime).getTime() - new Date(prevSession.bedTime).getTime());
        return timeDiff < 60 * 60 * 1000; // Within 1 hour
      });
      
      if (!consistency) {
        insights.push('Your sleep schedule is inconsistent. Try going to bed at the same time each night.');
      }
    }
    
    return insights;
  };

  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    const weekData = days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      const session = sleepSessions.find(s => s.date === dateStr);
      
      return {
        day,
        deepSleep: session?.deepSleep || 0,
        lightSleep: session?.lightSleep || 0,
        rem: session?.remSleep || 0,
        total: session?.totalSleep || 0
      };
    });

    return {
      labels: weekData.map(item => item.day),
      datasets: [
        {
          data: weekData.map(item => item.total),
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const renderSleepSound = (sleepSound: SleepSound) => (
    <View key={sleepSound.id} style={styles.soundCard}>
      <LinearGradient
        colors={playingSound?.id === sleepSound.id 
          ? ['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']
          : ['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']
        }
        style={styles.soundCardGradient}
      >
        <View style={styles.soundInfo}>
          <Text style={styles.soundName}>{sleepSound.name}</Text>
          <Text style={styles.soundCategory}>{sleepSound.category}</Text>
          <Text style={styles.soundDuration}>{sleepSound.duration} min</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.soundButton,
            playingSound?.id === sleepSound.id && styles.soundButtonActive
          ]}
          onPress={() => playSleepSound(sleepSound)}
        >
          <LinearGradient
            colors={playingSound?.id === sleepSound.id 
              ? ['#4F46E5', '#3B82F6']
              : ['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']
            }
            style={styles.soundButtonGradient}
          >
            {playingSound?.id === sleepSound.id ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color="#4F46E5" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const insights = getSleepInsights();
  const chartData = getChartData();
  const lastSession = sleepSessions[0];

  const chartCardHorizontalPadding = 32;
  const trendsCardHorizontalPadding = 32;
  const chartWidth = Math.min(SCREEN_WIDTH - chartCardHorizontalPadding - trendsCardHorizontalPadding, CONTENT_MAX_WIDTH - 64);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F8FAFF', '#FFFFFF']}
        style={styles.gradientBackground}
      />
      
      <Header title="Sleep Tracker" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          
          {/* Premium Sleep Tracking Controls */}
          <Animated.View style={[styles.trackingCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isTracking ? ['#EF4444', '#DC2626'] : ['#4F46E5', '#3B82F6']}
              style={styles.trackingGradient}
            >
              <View style={styles.trackingHeader}>
                <View style={styles.trackingIconContainer}>
                  <Moon size={24} color="#FFFFFF" />
                </View>
                <View style={styles.trackingTextContainer}>
                  <Text style={styles.trackingTitle}>
                    {isTracking ? 'Sleep Tracking Active' : 'Start Sleep Tracking'}
                  </Text>
                  <Text style={styles.trackingSubtitle}>
                    {isTracking 
                      ? 'Tap "End Session" when you wake up' 
                      : 'Track your sleep patterns and quality'
                    }
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.trackingButton}
                onPress={isTracking ? endSleepTracking : startSleepTracking}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                  style={styles.trackingButtonGradient}
                >
                  <Text style={styles.trackingButtonText}>
                    {isTracking ? 'End Session' : 'Start Tracking'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Premium Last Night's Sleep */}
          {lastSession && (
            <Animated.View style={[styles.lastNightCard, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
                style={styles.lastNightCardGradient}
              >
                <View style={styles.lastNightHeader}>
                  <View style={styles.lastNightIconContainer}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                      style={styles.lastNightIconGradient}
                    >
                      <Star size={20} color="#10B981" />
                    </LinearGradient>
                  </View>
                  <View style={styles.lastNightTextContainer}>
                    <Text style={styles.lastNightTitle}>Last Night's Sleep</Text>
                    <Text style={styles.lastNightDate}>{lastSession.date}</Text>
                  </View>
                </View>
                
                <View style={styles.sleepStats}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                      style={styles.statCardGradient}
                    >
                      <Text style={styles.statLabel}>Total Sleep</Text>
                      <Text style={styles.statValue}>{lastSession.totalSleep}h</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                      style={styles.statCardGradient}
                    >
                      <Text style={styles.statLabel}>Deep Sleep</Text>
                      <Text style={styles.statValue}>{lastSession.deepSleep}h</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
                      style={styles.statCardGradient}
                    >
                      <Text style={styles.statLabel}>Quality</Text>
                      <Text style={styles.statValue}>{lastSession.sleepQuality}/100</Text>
                    </LinearGradient>
                  </View>
                </View>
                
                <View style={styles.sleepTiming}>
                  <Text style={styles.timingText}>
                    Bed: {lastSession.bedTime} | Wake: {lastSession.wakeTime}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Premium Sleep Insights */}
          {insights && insights.length > 0 && (
            <Animated.View style={[styles.insightsCard, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['rgba(239, 246, 255, 0.95)', 'rgba(219, 234, 254, 0.9)']}
                style={styles.insightsCardGradient}
              >
                <View style={styles.insightsHeader}>
                  <View style={styles.insightsIconContainer}>
                    <LinearGradient
                      colors={['rgba(37, 99, 235, 0.1)', 'rgba(30, 64, 175, 0.05)']}
                      style={styles.insightsIconGradient}
                    >
                      <TrendingUp size={18} color="#2563EB" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.insightsTitle}>Sleep Insights</Text>
                </View>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <AlertCircle size={16} color="#2563EB" />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </LinearGradient>
            </Animated.View>
          )}
          
          {/* Premium Sleep Trends */}
          <Animated.View style={[styles.trendsCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.trendsCardGradient}
            >
              <View style={styles.trendsHeader}>
                <View style={styles.trendsIconContainer}>
                  <LinearGradient
                    colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                    style={styles.trendsIconGradient}
                  >
                    <Activity size={20} color="#4F46E5" />
                  </LinearGradient>
                </View>
                <View style={styles.trendsTextContainer}>
                  <Text style={styles.sectionTitle}>Sleep Trends</Text>
                  <View style={styles.timeRangeContainer}>
                    {['week', 'month'].map(range => (
                      <TouchableOpacity
                        key={range}
                        onPress={() => setTimeRange(range)}
                        style={[
                          styles.timeRangeButton,
                          timeRange === range && styles.timeRangeButtonActive
                        ]}
                      >
                        <Text style={[
                          styles.timeRangeText,
                          timeRange === range && styles.timeRangeTextActive
                        ]}>
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix="h"
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                    style: {
                      borderRadius: 16
                    }
                  }}
                  style={styles.chart}
                />
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Premium Sleep Sounds */}
          <Animated.View style={[styles.soundsSection, { opacity: fadeAnim }]}>
            <View style={styles.soundsHeader}>
              <View style={styles.soundsIconContainer}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
                  style={styles.soundsIconGradient}
                >
                  <Music size={20} color="#F59E0B" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Sleep Sounds</Text>
            </View>
            <View style={styles.soundsGrid}>
              {sleepSounds.map(sound => renderSleepSound(sound))}
            </View>
          </Animated.View>
          
          {/* Premium Sleep Goal */}
          <Animated.View style={[styles.goalCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['#4F46E5', '#3B82F6']}
              style={styles.goalGradient}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalIconContainer}>
                  <Target size={20} color="#FFFFFF" />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>Sleep Goal</Text>
                  <Text style={styles.goalText}>
                    Target: {sleepGoal.targetHours}h | Bed: {sleepGoal.bedTime} | Wake: {sleepGoal.wakeTime}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.goalButton}
                onPress={() => setShowGoalModal(true)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                  style={styles.goalButtonGradient}
                >
                  <Text style={styles.goalButtonText}>Edit Goal</Text>
                  <ArrowRight size={16} color="#4F46E5" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
          
          {/* Emergency Button */}
          <EmergencyButton />
        </Animated.View>
      </ScrollView>
      
      <MobileNavbar />

      {/* Premium Sleep Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={styles.modalOverlayGradient}
          />
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.modalContentGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Sleep Goal</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowGoalModal(false)}
                >
                  <LinearGradient
                    colors={['rgba(107, 114, 128, 0.1)', 'rgba(75, 85, 99, 0.05)']}
                    style={styles.closeButtonGradient}
                  >
                    <X size={24} color="#6B7280" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={styles.goalForm}>
                <Text style={styles.formLabel}>Target Sleep Hours</Text>
                <TextInput
                  style={styles.formInput}
                  value={sleepGoal.targetHours.toString()}
                  onChangeText={(text) => setSleepGoal(prev => ({ ...prev, targetHours: parseInt(text) || 8 }))}
                  keyboardType="numeric"
                  placeholder="8"
                />
                
                <Text style={styles.formLabel}>Bedtime</Text>
                <TextInput
                  style={styles.formInput}
                  value={sleepGoal.bedTime}
                  onChangeText={(text) => setSleepGoal(prev => ({ ...prev, bedTime: text }))}
                  placeholder="22:00"
                />
                
                <Text style={styles.formLabel}>Wake Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={sleepGoal.wakeTime}
                  onChangeText={(text) => setSleepGoal(prev => ({ ...prev, wakeTime: text }))}
                  placeholder="06:00"
                />
              </View>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  saveSleepGoal(sleepGoal);
                  setShowGoalModal(false);
                }}
              >
                <LinearGradient
                  colors={['#4F46E5', '#3B82F6']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  contentWrapper: { 
    width: '100%', 
    maxWidth: CONTENT_MAX_WIDTH, 
    alignSelf: 'center' 
  },
  trackingCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  trackingGradient: {
    padding: 24,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
  },
  trackingTextContainer: { flex: 1 },
  trackingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  trackingButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  trackingButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  lastNightCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  lastNightCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  lastNightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lastNightIconContainer: {
    marginRight: 16,
    borderRadius: 12,
    padding: 10,
  },
  lastNightIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  lastNightTextContainer: { flex: 1 },
  lastNightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  lastNightDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  sleepTiming: {
    alignItems: 'center',
  },
  timingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  insightsCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  insightsCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsIconContainer: {
    marginRight: 12,
    borderRadius: 12,
    padding: 10,
  },
  insightsIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  trendsCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  trendsCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trendsIconContainer: {
    marginRight: 16,
    borderRadius: 12,
    padding: 10,
  },
  trendsIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  trendsTextContainer: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeRangeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  soundsSection: {
    marginBottom: 24,
  },
  soundsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  soundsIconContainer: {
    marginRight: 16,
    borderRadius: 12,
    padding: 10,
  },
  soundsIconGradient: {
    borderRadius: 12,
    padding: 10,
  },
  soundsGrid: {
    gap: 12,
  },
  soundCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  soundCardGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  soundInfo: { flex: 1 },
  soundName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  soundCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  soundDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  soundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButtonActive: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  goalCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  goalGradient: {
    padding: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
  },
  goalTextContainer: { flex: 1 },
  goalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  goalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
  },
  goalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalContentGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonGradient: {
    padding: 12,
    borderRadius: 16,
  },
  goalForm: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SleepTrackerScreen; 