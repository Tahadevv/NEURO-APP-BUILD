import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { User, Calendar, TrendingUp, Heart, Moon, CheckCircle2, PenTool, Mic, Brain, Activity, Target, Zap } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_MAX_WIDTH = 440;

const DashboardScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [emotionTrends, setEmotionTrends] = useState<any[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [sleepStats, setSleepStats] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setProfile({
      name: 'Taha',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      streak: 5,
      lastCheckIn: '2025-06-10',
    });
    setEmotionTrends([
      { value: 70, label: 'Mon' },
      { value: 60, label: 'Tue' },
      { value: 80, label: 'Wed' },
      { value: 50, label: 'Thu' },
      { value: 90, label: 'Fri' },
      { value: 60, label: 'Sat' },
      { value: 75, label: 'Sun' },
    ]);
    setRecentAnalyses([
      { type: 'Facial', result: 'Happy', date: '2025-06-10', confidence: 92 },
      { type: 'Text', result: 'Stressed', date: '2025-06-09', confidence: 78 },
      { type: 'Voice', result: 'Calm', date: '2025-06-08', confidence: 85 },
    ]);
    setGoals([
      { label: 'Reduce Stress & Anxiety', progress: 0.7 },
      { label: 'Improve Sleep Quality', progress: 0.5 },
    ]);
    setSleepStats({ actual: 6.5, target: 8 });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'emotion':
        router.push('/emotion-tracker');
        break;
      case 'journal':
        router.push('/mood-journal');
        break;
      case 'sleep':
        router.push('/sleep-tracker');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F8FAFF', '#FFFFFF']}
        style={styles.gradientBackground}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInset={{ bottom: 80 }}
      >
        <View style={styles.contentWrap}>
          {/* Premium Header */}
          <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
            <View style={styles.headerGradient}>
              <LinearGradient
                colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.headerGradientInner}
              >
                <View style={styles.headerRow}>
                  <View style={styles.headerIconWrap}>
                    <LinearGradient
                      colors={['#4F46E5', '#3B82F6']}
                      style={styles.headerIconGradient}
                    >
                      <Brain size={28} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Your mental wellness overview</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Premium Profile Card */}
          <Animated.View style={[styles.profileCardContainer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.profileCard}
            >
              <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: profile?.avatar }} style={styles.avatar} />
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakNumber}>{profile?.streak}</Text>
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile?.name}</Text>
                  <View style={styles.streakRow}>
                    <Zap size={16} color="#F59E0B" />
                    <Text style={styles.streakText}>Day {profile?.streak} streak</Text>
                  </View>
                  <Text style={styles.lastCheckIn}>Last check-in: {profile?.lastCheckIn}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Premium Stats Grid */}
          <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.statCardGradient}
              >
                <Activity size={24} color="#4F46E5" />
                <Text style={styles.statNumber}>75%</Text>
                <Text style={styles.statLabel}>Mood Score</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                style={styles.statCardGradient}
              >
                <Target size={24} color="#10B981" />
                <Text style={styles.statNumber}>70%</Text>
                <Text style={styles.statLabel}>Goal Progress</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
                style={styles.statCardGradient}
              >
                <Moon size={24} color="#F59E0B" />
                <Text style={styles.statNumber}>6.5h</Text>
                <Text style={styles.statLabel}>Sleep Avg</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Premium Mood Trends */}
          <Animated.View style={[styles.trendsCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.trendsCardInner}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <TrendingUp size={20} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Mood Trends</Text>
                  <Text style={styles.sectionSubtitle}>Last 7 days</Text>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <LineChart
                  data={emotionTrends}
                  height={140}
                  width={Math.min(SCREEN_WIDTH - 80, CONTENT_MAX_WIDTH - 60)}
                  color="#4F46E5"
                  thickness={3}
                  hideDataPoints
                  areaChart
                  startFillColor="rgba(79, 70, 229, 0.2)"
                  endFillColor="rgba(59, 130, 246, 0.1)"
                  yAxisColor="rgba(79, 70, 229, 0.2)"
                  xAxisColor="rgba(79, 70, 229, 0.2)"
                  xAxisLabelTextStyle={{ color: '#6366F1', fontSize: 12 }}
                  noOfSections={4}
                  rulesColor="rgba(79, 70, 229, 0.1)"
                  backgroundColor="transparent"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Premium Recent Analyses */}
          <Animated.View style={[styles.analysesCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.analysesCardInner}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Calendar size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Recent Analyses</Text>
                  <Text style={styles.sectionSubtitle}>Your latest insights</Text>
                </View>
              </View>
              {recentAnalyses.map((item, idx) => (
                <View key={idx} style={styles.analysisItem}>
                  <View style={styles.analysisIcon}>
                    {item.type === 'Facial' && <User size={18} color="#4F46E5" />}
                    {item.type === 'Text' && <PenTool size={18} color="#10B981" />}
                    {item.type === 'Voice' && <Mic size={18} color="#8B5CF6" />}
                  </View>
                  <View style={styles.analysisContent}>
                    <Text style={styles.analysisType}>{item.type} Analysis</Text>
                    <Text style={styles.analysisResult}>{item.result}</Text>
                  </View>
                  <View style={styles.analysisMeta}>
                    <Text style={styles.analysisConfidence}>{item.confidence}%</Text>
                    <Text style={styles.analysisDate}>{item.date}</Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </Animated.View>

          {/* Premium Goals */}
          <Animated.View style={[styles.goalsCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.9)']}
              style={styles.goalsCardInner}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Target size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Your Goals</Text>
                  <Text style={styles.sectionSubtitle}>Track your progress</Text>
                </View>
              </View>
              {goals.map((goal, idx) => (
                <View key={idx} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalLabel}>{goal.label}</Text>
                    <Text style={styles.goalPercent}>{Math.round(goal.progress * 100)}%</Text>
                  </View>
                  <View style={styles.goalBarContainer}>
                    <LinearGradient
                      colors={['#4F46E5', '#3B82F6']}
                      style={[styles.goalBarFill, { width: `${goal.progress * 100}%` }]}
                    />
                  </View>
                </View>
              ))}
            </LinearGradient>
          </Animated.View>

          {/* Premium Quick Actions */}
          <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('emotion')}
              >
                <LinearGradient
                  colors={['#4F46E5', '#3B82F6']}
                  style={styles.quickActionGradient}
                >
                  <TrendingUp size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Track Emotion</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('journal')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.quickActionGradient}
                >
                  <PenTool size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Add Journal</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('sleep')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.quickActionGradient}
                >
                  <Heart size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Sleep Tracker</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <MobileNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrollContent: { alignItems: 'center', padding: 0, paddingBottom: 70 },
  contentWrap: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 0,
  },
  headerSection: { width: '100%', marginBottom: 24 },
  headerGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerGradientInner: { padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconWrap: {
    marginRight: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: '#1F2937', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  headerSubtitle: { color: '#6B7280', fontSize: 16, fontWeight: '500' },
  profileCardContainer: { width: '100%', marginBottom: 24 },
  profileCard: {
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
  profileContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  streakBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  streakNumber: { color: '#fff', fontSize: 12, fontWeight: '900' },
  profileInfo: { flex: 1 },
  profileName: { color: '#1F2937', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  streakText: { color: '#F59E0B', fontSize: 16, fontWeight: '700', marginLeft: 6 },
  lastCheckIn: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  statNumber: { color: '#1F2937', fontSize: 24, fontWeight: '900', marginTop: 8, marginBottom: 4 },
  statLabel: { color: '#6B7280', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  trendsCard: { width: '100%', marginBottom: 24 },
  trendsCardInner: {
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIconWrap: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  sectionTitle: { color: '#1F2937', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  sectionSubtitle: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  chartContainer: {
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  analysesCard: { width: '100%', marginBottom: 24 },
  analysesCardInner: {
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
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  analysisIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisContent: { flex: 1 },
  analysisType: { color: '#6B7280', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  analysisResult: { color: '#1F2937', fontSize: 16, fontWeight: '800' },
  analysisMeta: { alignItems: 'flex-end' },
  analysisConfidence: { color: '#10B981', fontSize: 14, fontWeight: '900', marginBottom: 2 },
  analysisDate: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  goalsCard: { width: '100%', marginBottom: 24 },
  goalsCardInner: {
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
  goalItem: { marginBottom: 20 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalLabel: { color: '#1F2937', fontSize: 16, fontWeight: '700', flex: 1 },
  goalPercent: { color: '#4F46E5', fontSize: 16, fontWeight: '900' },
  goalBarContainer: {
    height: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  goalBarFill: { height: 12, borderRadius: 6 },
  quickActionsContainer: { width: '100%', marginBottom: 24 },
  quickActionsTitle: { color: '#1F2937', fontSize: 20, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 64) / 3 - 8, // Equal width for all buttons
    height: 100, // Fixed height for consistency
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  quickActionGradient: {
    width: '100%',
    height: '100%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  quickActionText: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '800', 
    marginTop: 8, 
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DashboardScreen;