import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Animated } from 'react-native';
import { Brain, Lightbulb, Puzzle, Clock, ArrowRight, Award, Zap, Target, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';

const CognitiveExercisesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All', icon: Brain },
    { id: 'memory', name: 'Memory', icon: Puzzle },
    { id: 'focus', name: 'Focus', icon: Target },
    { id: 'problem', name: 'Problem Solving', icon: Lightbulb }
  ];
  
  const games = [
    {
      id: 1,
      title: 'Memory Match',
      description: 'Match pairs of cards in the fewest attempts',
      icon: Puzzle,
      gradient: ['#667eea', '#764ba2'],
      category: 'memory',
      duration: '5 min',
      level: 'Easy',
      progress: 85
    },
    {
      id: 2,
      title: 'Number Sequence',
      description: 'Remember and repeat number sequences',
      icon: Lightbulb,
      gradient: ['#f093fb', '#f5576c'],
      category: 'memory',
      duration: '10 min',
      level: 'Medium',
      progress: 60
    },
    {
      id: 3,
      title: 'Focus Challenge',
      description: 'Identify specific patterns among distractions',
      icon: Target,
      gradient: ['#4facfe', '#00f2fe'],
      category: 'focus',
      duration: '7 min',
      level: 'Hard',
      progress: 45
    },
    {
      id: 4,
      title: 'Logic Puzzles',
      description: 'Solve reasoning puzzles with increasing difficulty',
      icon: Brain,
      gradient: ['#43e97b', '#38f9d7'],
      category: 'problem',
      duration: '15 min',
      level: 'Medium',
      progress: 70
    }
  ];
  
  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const renderGameCard = ({ item: game }: { item: any }) => (
    <TouchableOpacity
      style={styles.gameCardContainer}
      onPress={() => {}}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={game.gradient}
        style={styles.gameCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gameCardContent}>
          <View style={styles.gameHeader}>
            <View style={styles.gameIconContainer}>
              <game.icon size={24} color="#FFFFFF" />
            </View>
            <View style={styles.gameProgressContainer}>
              <View style={styles.gameProgressBar}>
                <View style={[styles.gameProgressFill, { width: `${game.progress}%` }]} />
              </View>
              <Text style={styles.gameProgressText}>{game.progress}%</Text>
            </View>
          </View>
          
          <View style={styles.gameTextContainer}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
            
            <View style={styles.gameMetaContainer}>
              <View style={styles.gameTags}>
                <View style={styles.gameTag}>
                  <Clock size={12} color="#FFFFFF" />
                  <Text style={styles.gameTagText}>{game.duration}</Text>
                </View>
                <View style={[styles.gameTag, styles.gameTagLevel]}>
                  <Zap size={12} color="#FFFFFF" />
                  <Text style={styles.gameTagText}>{game.level}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Start</Text>
                <ArrowRight size={14} color="#FFFFFF" style={styles.startButtonIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#F8FAFC", "#E0E7FF"]} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Brain size={24} color="#3B82F6" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Cognitive Exercises</Text>
        </View>
        <View style={styles.headerAccentBar} />

        {/* Stats Banner */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Your Progress</Text>
            <TouchableOpacity style={styles.statsLinkContainer}>
              <Text style={styles.statsLink}>View Details</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Weekly Goal</Text>
              <Text style={styles.progressValue}>3/5 exercises</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>
          
          <View style={styles.statsFooter}>
            <View style={styles.statItem}>
              <Award size={16} color="#FCD34D" style={styles.statIcon} />
              <Text style={styles.statText}>5 day streak</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#34D399" style={styles.statIcon} />
              <Text style={styles.statText}>Level 3</Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <category.icon 
                size={16} 
                color={selectedCategory === category.id ? "#FFFFFF" : "#6B7280"} 
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Game Cards */}
        <FlatList
          data={filteredGames}
          renderItem={renderGameCard}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.gamesList}
        />
        
        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommended For You</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.recommendationCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIconContainer}>
                <Brain size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.recommendationSubtitle}>Based on your activity</Text>
            </View>
            <Text style={styles.recommendationText}>
              Challenge yourself with more Focus exercises to improve your concentration and mental clarity.
            </Text>
            <TouchableOpacity style={styles.recommendationButton}>
              <Text style={styles.recommendationButtonText}>View Recommendation</Text>
              <ArrowRight size={14} color="#3B82F6" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Emergency Button */}
        <EmergencyButton />
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
    padding: 16,
    paddingBottom: 80,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '800',
  },
  headerAccentBar: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    width: 60,
    marginBottom: 18,
    marginLeft: 32,
  },
  statsBanner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statIcon: {
    marginRight: 6,
  },
  statText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  gamesList: {
    marginBottom: 20,
  },
  gameCardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gameCardContent: {
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gameIconContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  gameProgressContainer: {
    alignItems: 'flex-end',
  },
  gameProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gameProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  gameProgressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gameTextContainer: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  gameMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTags: {
    flexDirection: 'row',
  },
  gameTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  gameTagLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gameTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startButtonIcon: {
    marginLeft: 6,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  recommendationCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationIconContainer: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginRight: 10,
  },
  recommendationSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  recommendationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  recommendationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 6,
  },
});

export default CognitiveExercisesScreen; 