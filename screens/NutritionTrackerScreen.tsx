import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { Brain, Utensils, Droplets, Apple, Coffee, PlusCircle, Info } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';

interface Nutrient {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface Meal {
  id: number;
  type: string;
  name: string;
  time: string;
  nutrients: string[];
  image?: string;
}

interface MealType {
  id: string;
  name: string;
}

const NutritionTrackerScreen = () => {
  const [mealType, setMealType] = useState('all');
  
  const mealTypes: MealType[] = [
    { id: 'all', name: 'All' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'snacks', name: 'Snacks' }
  ];
  
  const nutrients: Nutrient[] = [
    { 
      name: 'Omega-3', 
      current: 65, 
      target: 100, 
      unit: 'mg',
      color: '#3B82F6' 
    },
    { 
      name: 'Antioxidants', 
      current: 80, 
      target: 100, 
      unit: 'mg',
      color: '#8B5CF6' 
    },
    { 
      name: 'B Vitamins', 
      current: 45, 
      target: 100, 
      unit: 'mg',
      color: '#10B981' 
    },
    { 
      name: 'Vitamin D', 
      current: 30, 
      target: 100, 
      unit: 'IU',
      color: '#F59E0B' 
    }
  ];
  
  const meals: Meal[] = [
    {
      id: 1,
      type: 'breakfast',
      name: 'Blueberry Almond Oatmeal',
      time: '8:30 AM',
      nutrients: ['Omega-3', 'Antioxidants'],
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      type: 'lunch',
      name: 'Salmon & Quinoa Bowl',
      time: '12:45 PM',
      nutrients: ['Omega-3', 'B Vitamins'],
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      type: 'snacks',
      name: 'Greek Yogurt with Walnuts',
      time: '3:30 PM',
      nutrients: ['Antioxidants', 'Vitamin D']
    }
  ];
  
  const filteredMeals = mealType === 'all' 
    ? meals 
    : meals.filter(meal => meal.type === mealType);
    
  const hydration = {
    current: 1200,
    goal: 2000,
    unit: 'ml',
    percentage: 60
  };

  const renderNutrientProgress = (nutrient: Nutrient) => (
    <View key={nutrient.name} style={styles.nutrientItem}>
      <View style={styles.nutrientHeader}>
        <Text style={styles.nutrientName}>{nutrient.name}</Text>
        <Text style={styles.nutrientValue}>
          {nutrient.current}/{nutrient.target} {nutrient.unit}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { 
              width: `${(nutrient.current / nutrient.target) * 100}%`,
              backgroundColor: nutrient.color
            }
          ]} 
        />
      </View>
    </View>
  );

  const renderMealCard = ({ item }: { item: Meal }) => (
    <View key={item.id} style={styles.mealCard}>
      {item.image && (
        <View style={styles.mealImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.mealImage}
          />
        </View>
      )}
      <View style={styles.mealContent}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealName}>{item.name}</Text>
          <Text style={styles.mealTime}>{item.time}</Text>
        </View>
        
        <View style={styles.nutrientTags}>
          {item.nutrients.map(nutrient => (
            <View key={nutrient} style={styles.nutrientTag}>
              <Text style={styles.nutrientTagText}>{nutrient}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.mealActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Info size={16} color="#4B5563" />
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Utensils size={16} color="#4B5563" />
            <Text style={styles.actionText}>Log Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderRecipeCard = (title: string, description: string, image: string) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeImageContainer}>
        <Image 
          source={{ uri: image }} 
          style={styles.recipeImage}
        />
      </View>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>{title}</Text>
        <Text style={styles.recipeDescription}>{description}</Text>
        <TouchableOpacity style={styles.recipeButton}>
          <Text style={styles.recipeButtonText}>View Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Brain Nutrition Overview */}
        <View style={styles.nutritionOverview}>
          <View style={styles.nutritionHeader}>
            <View>
              <Text style={styles.nutritionTitle}>Brain Nutrition</Text>
              <Text style={styles.nutritionSubtitle}>Daily tracking</Text>
            </View>
            <View style={styles.brainIcon}>
              <Brain size={24} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.nutrientsList}>
            {nutrients.map(renderNutrientProgress)}
          </View>
        </View>
        
        {/* Hydration Tracker */}
        <View style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <View style={styles.hydrationTitle}>
              <View style={styles.dropletsIcon}>
                <Droplets size={18} color="#3B82F6" />
              </View>
              <Text style={styles.hydrationTitleText}>Hydration</Text>
            </View>
            <TouchableOpacity>
              <PlusCircle size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.hydrationProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${hydration.percentage}%`,
                    backgroundColor: '#3B82F6'
                  }
                ]} 
              />
            </View>
            <View style={styles.hydrationStats}>
              <Text style={styles.hydrationAmount}>
                {hydration.current}/{hydration.goal} {hydration.unit}
              </Text>
              <Text style={styles.hydrationPercentage}>
                {hydration.percentage}% of daily goal
              </Text>
            </View>
          </View>
          
          <View style={styles.hydrationActions}>
            <TouchableOpacity style={styles.hydrationButton}>
              <Droplets size={14} color="#3B82F6" />
              <Text style={styles.hydrationButtonText}>Add 250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hydrationButton}>
              <Text style={styles.hydrationButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Meal Tracking */}
        <View style={styles.mealSection}>
          <View style={styles.mealHeader}>
            <Text style={styles.sectionTitle}>Meal Tracking</Text>
            <TouchableOpacity style={styles.addMealButton}>
              <PlusCircle size={16} color="#10B981" />
              <Text style={styles.addMealText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
          
          {/* Meal Type Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.mealTypeContainer}
          >
            <View style={styles.mealTypeList}>
              {mealTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setMealType(type.id)}
                  style={[
                    styles.mealTypeButton,
                    mealType === type.id && styles.mealTypeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.mealTypeText,
                    mealType === type.id && styles.mealTypeTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Meal List */}
          <View style={styles.mealList}>
            {filteredMeals.map(meal => renderMealCard({ item: meal }))}
          </View>
        </View>
        
        {/* Brain Diet Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.appleIcon}>
              <Apple size={18} color="#D97706" />
            </View>
            <View>
              <Text style={styles.tipsTitle}>Brain Diet Tips</Text>
              <Text style={styles.tipsText}>
                Try adding more fatty fish to your diet for Omega-3s, which support cognitive function and memory.
              </Text>
              <TouchableOpacity style={styles.tipsButton}>
                <Text style={styles.tipsButtonText}>View All Tips</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Recipe Recommendations */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>Brain-Boosting Recipes</Text>
          <View style={styles.recipesGrid}>
            {renderRecipeCard(
              'Walnut Berry Salad',
              'Rich in antioxidants',
              'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
            )}
            {renderRecipeCard(
              'Avocado Toast',
              'Healthy fats & B vitamins',
              'https://images.unsplash.com/photo-1556040220-4096d522378d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
            )}
          </View>
        </View>
        
        {/* Emergency Button */}
        <EmergencyButton />
      </ScrollView>
      
      <MobileNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  nutritionOverview: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nutritionSubtitle: {
    fontSize: 14,
    color: '#E0F2F1',
  },
  brainIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  nutrientsList: {
    gap: 12,
  },
  nutrientItem: {
    gap: 4,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  nutrientValue: {
    fontSize: 14,
    color: '#E0F2F1',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  hydrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hydrationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropletsIcon: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  hydrationTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hydrationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hydrationStats: {
    marginLeft: 16,
  },
  hydrationAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hydrationPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  hydrationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hydrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  hydrationButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
  },
  addMealText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  mealTypeContainer: {
    marginBottom: 12,
  },
  mealTypeList: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: '#10B981',
    borderWidth: 0,
  },
  mealTypeText: {
    fontSize: 14,
    color: '#4B5563',
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  mealList: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealImageContainer: {
    height: 128,
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealContent: {
    padding: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mealTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  nutrientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  nutrientTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nutrientTagText: {
    fontSize: 12,
    color: '#059669',
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appleIcon: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  tipsButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 6,
  },
  tipsButtonText: {
    fontSize: 12,
    color: '#92400E',
  },
  recipesSection: {
    marginBottom: 16,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipeCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipeImageContainer: {
    height: 96,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  recipeButton: {
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
  },
  recipeButtonText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
  },
});

export default NutritionTrackerScreen; 