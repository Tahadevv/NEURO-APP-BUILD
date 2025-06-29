import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Heart, Shield, Activity, ArrowRight, Smile, MessageCircle, AlertCircle, Puzzle, Zap, Music, BookOpen, Users, Sun, Moon, Sparkles, TrendingUp, Star, Clock } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);
  const pulseAnim = new Animated.Value(1);

  // Quick access cards with enhanced design
  const quickAccessCards = [
    {
      title: 'Emotion Tracker',
      description: 'Monitor your daily mood patterns',
      icon: Smile,
      path: '/emotion-tracker',
      gradient: ['#3B82F6', '#1D4ED8'] as const,
      iconGradient: ['#FFFFFF', '#E0E7FF'] as const,
      stats: '98% accuracy',
      time: '2 min'
    },
    {
      title: 'Chat Support',
      description: 'Talk to an AI therapy assistant',
      icon: MessageCircle,
      path: '/chat-support',
      gradient: ['#10B981', '#059669'] as const,
      iconGradient: ['#FFFFFF', '#D1FAE5'] as const,
      stats: '24/7 available',
      time: 'Instant'
    },
    {
      title: 'Emergency SOS',
      description: 'Get immediate help when needed',
      icon: AlertCircle,
      path: '/emergency',
      gradient: ['#EF4444', '#DC2626'] as const,
      iconGradient: ['#FFFFFF', '#FEE2E2'] as const,
      stats: 'Always ready',
      time: '0 sec'
    },
  ];
  
  // Activities with enhanced design
  const activities = [
    {
      title: 'Cognitive Games',
      icon: Puzzle,
      path: '/cognitive-exercises',
      gradient: ['#6366F1', '#4F46E5'] as const,
      description: 'Brain training exercises',
      progress: 75
    },
    {
      title: 'Meditation',
      icon: Zap,
      path: '/meditation',
      gradient: ['#F59E0B', '#D97706'] as const,
      description: 'Mindfulness sessions',
      progress: 60
    },
    {
      title: 'Sleep Sounds',
      icon: Music,
      path: '/sleep-tracker',
      gradient: ['#14B8A6', '#0D9488'] as const,
      description: 'Restful sleep aid',
      progress: 85
    },
    {
      title: 'Affirmations',
      icon: BookOpen,
      path: '/daily-affirmations',
      gradient: ['#EC4899', '#DB2777'] as const,
      description: 'Daily positive thoughts',
      progress: 90
    },
    {
      title: 'Support Group',
      icon: Users,
      path: '/social-support',
      gradient: ['#8B5CF6', '#7C3AED'] as const,
      description: 'Community connection',
      progress: 45
    },
    {
      title: 'Mood Journal',
      icon: Sun,
      path: '/mood-journal',
      gradient: ['#F97316', '#EA580C'] as const,
      description: 'Track your feelings',
      progress: 70
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for hero section
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderHeroSection = () => (
    <Animated.View 
      style={[
        styles.heroContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.heroIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Brain size={36} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Neuro Care</Text>
            <Text style={styles.heroSubtitle}>Your AI mental health companion</Text>
          </View>
        </View>
        <Text style={styles.heroDescription}>
          Take control of your mental wellbeing with AI-powered tools and personalized insights.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statItem}>
            <TrendingUp size={16} color="#FFFFFF" />
            <Text style={styles.statText}>98% accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color="#FFFFFF" />
            <Text style={styles.statText}>24/7 support</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color="#FFFFFF" />
            <Text style={styles.statText}>AI-powered</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/dashboard')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startButtonText}>Start Your Journey</Text>
            <ArrowRight size={18} color="#3B82F6" style={styles.startButtonIcon} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderActivitiesSection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activities</Text>
        <Text style={styles.sectionSubtitle}>Choose your wellness path</Text>
      </View>
      <View style={styles.activitiesGrid}>
        {activities.map((activity, index) => (
          <Animated.View
            key={activity.title}
            style={[
              styles.activityItemContainer,
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
              style={styles.activityItem}
              onPress={() => router.push(activity.path)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={activity.gradient}
                style={styles.activityGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.activityIconContainer}>
                  <activity.icon size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${activity.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{activity.progress}%</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderQuickAccessSection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Text style={styles.sectionSubtitle}>Essential tools at your fingertips</Text>
      </View>
      {quickAccessCards.map((card, index) => (
        <Animated.View
          key={card.title}
          style={[
            styles.cardContainer,
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
            style={styles.card}
            onPress={() => router.push(card.path)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconGradient}>
                    <card.icon size={24} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                  <View style={styles.cardStats}>
                    <Text style={styles.cardStatsText}>{card.stats}</Text>
                    <Text style={styles.cardTimeText}>{card.time}</Text>
                  </View>
                </View>
                <View style={styles.cardArrowContainer}>
                  <ArrowRight size={20} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderEmergencySection = () => (
    <Animated.View
      style={[
        styles.emergencyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => router.push('/emergency')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#EF4444', '#DC2626', '#B91C1C']}
          style={styles.emergencyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <AlertCircle size={20} color="#FFFFFF" style={styles.emergencyIcon} />
          <Text style={styles.emergencyText}>Emergency Support</Text>
          <Text style={styles.emergencySubtext}>24/7 immediate assistance</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        style={styles.backgroundGradient}
      >
        <Header title="Neuro Care" showBackButton={false} />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeroSection()}
          {renderActivitiesSection()}
          {renderQuickAccessSection()}
          {renderEmergencySection()}
        </ScrollView>
      </LinearGradient>
      
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroContainer: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    minHeight: 240,
    maxWidth: 420,
    alignSelf: 'center',
  },
  heroGradient: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    overflow: 'hidden',
  },
  heroIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 18,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  startButton: {
    borderRadius: 14,
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
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  startButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '700',
  },
  startButtonIcon: {
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityItemContainer: {
    width: '48%',
    marginBottom: 10,
  },
  activityItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  activityGradient: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 6,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
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
  cardGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cardIconContainer: {
    marginRight: 12,
  },
  cardIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatsText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginRight: 8,
  },
  cardTimeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  cardArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyContainer: {
    marginTop: 8,
  },
  emergencyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyIcon: {
    marginBottom: 4,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  emergencySubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen; 