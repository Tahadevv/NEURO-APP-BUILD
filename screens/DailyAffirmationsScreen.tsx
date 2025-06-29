import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Modal, Alert, Platform } from 'react-native';
import { Heart, Star, ArrowLeft, ArrowRight, Plus, Edit, Sparkles, BookOpen, Clock, Trash2, X, Bot } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InferenceClient } from '@huggingface/inference';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const HF_TOKEN = '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';

const AFFIRMATIONS_KEY = '@affirmations';
const REMINDERS_KEY = '@affirmation_reminders';
const STREAK_KEY = '@affirmation_streak';
const LAST_PRACTICED_KEY = '@affirmation_last_practiced';

const defaultAffirmations = [
  { id: 1, text: "I am resilient and can handle life's challenges with strength.", category: 'confidence', isFavorite: true, isCustom: false },
  { id: 2, text: "I breathe in calmness and breathe out tension. I am at peace.", category: 'calm', isFavorite: false, isCustom: false },
  { id: 3, text: "I am grateful for the love and support in my life.", category: 'gratitude', isFavorite: true, isCustom: false },
  { id: 4, text: "My thoughts and feelings are valid. I honor my experience.", category: 'confidence', isFavorite: false, isCustom: false },
  { id: 5, text: "I choose to focus on what I can control and let go of what I cannot.", category: 'calm', isFavorite: false, isCustom: false }
];

const defaultReminders = [
  { id: 1, time: '8:00 AM', days: ['Mon', 'Wed', 'Fri'], active: true },
  { id: 2, time: '9:30 PM', days: ['Every day'], active: true }
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'confidence', name: 'Confidence' },
  { id: 'calm', name: 'Calm' },
  { id: 'gratitude', name: 'Gratitude' },
  { id: 'custom', name: 'My Affirmations' },
  { id: 'ai', name: 'AI-Generated' }
];

const DailyAffirmationsScreen = () => {
  const [affirmations, setAffirmations] = useState(defaultAffirmations);
  const [reminders, setReminders] = useState(defaultReminders);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [editingAffirmation, setEditingAffirmation] = useState(null);
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationCategory, setAffirmationCategory] = useState('custom');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDays, setReminderDays] = useState(['Every day']);
  const [reminderActive, setReminderActive] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastPracticed, setLastPracticed] = useState('');
  const [practicedToday, setPracticedToday] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      const storedAffirmations = await AsyncStorage.getItem(AFFIRMATIONS_KEY);
      if (storedAffirmations) setAffirmations(JSON.parse(storedAffirmations));
      const storedReminders = await AsyncStorage.getItem(REMINDERS_KEY);
      if (storedReminders) setReminders(JSON.parse(storedReminders));
      const storedStreak = await AsyncStorage.getItem(STREAK_KEY);
      if (storedStreak) setStreak(Number(storedStreak));
      const storedLast = await AsyncStorage.getItem(LAST_PRACTICED_KEY);
      if (storedLast) setLastPracticed(storedLast);
    })();
  }, []);

  // Save to storage
  useEffect(() => { AsyncStorage.setItem(AFFIRMATIONS_KEY, JSON.stringify(affirmations)); }, [affirmations]);
  useEffect(() => { AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { AsyncStorage.setItem(STREAK_KEY, streak.toString()); }, [streak]);
  useEffect(() => { AsyncStorage.setItem(LAST_PRACTICED_KEY, lastPracticed); }, [lastPracticed]);

  const filteredAffirmations = category === 'all'
    ? affirmations
    : category === 'custom'
      ? affirmations.filter(a => a.isCustom)
      : category === 'ai'
        ? affirmations.filter(a => a.isCustom && a.isAI)
        : affirmations.filter(a => a.category === category);

  const currentAffirmation = filteredAffirmations.length > 0
    ? filteredAffirmations[affirmationIndex % filteredAffirmations.length]
    : null;

  // Affirmation CRUD
  const openAffirmationModal = (affirmation = null) => {
    setEditingAffirmation(affirmation);
    setAffirmationText(affirmation ? affirmation.text : '');
    setAffirmationCategory(affirmation ? affirmation.category : 'custom');
    setShowAffirmationModal(true);
  };
  const saveAffirmation = () => {
    if (!affirmationText.trim()) return;
    if (editingAffirmation) {
      setAffirmations(affirmations.map(a => a.id === editingAffirmation.id ? { ...a, text: affirmationText, category: affirmationCategory } : a));
    } else {
      setAffirmations([
        { id: Date.now(), text: affirmationText, category: affirmationCategory, isFavorite: false, isCustom: true },
        ...affirmations
      ]);
      updateStreak();
    }
    setShowAffirmationModal(false);
    setEditingAffirmation(null);
    setAffirmationText('');
    setAffirmationCategory('custom');
  };
  const deleteAffirmation = (id) => {
    setAffirmations(affirmations.filter(a => a.id !== id));
  };
  const toggleFavorite = (id) => {
    setAffirmations(affirmations.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a));
  };

  // AI Generation
  const generateAIAffirmation = async (prompt = '') => {
    setAiLoading(true);
    try {
      const client = new InferenceClient(HF_TOKEN);
      const chatCompletion = await client.chatCompletion({
        provider: 'novita',
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [
          { role: 'user', content: prompt ? `Generate a daily affirmation for: ${prompt}` : 'Generate a daily affirmation.' }
        ],
      });
      const text = chatCompletion.choices?.[0]?.message?.content?.trim();
      if (text) {
        setAffirmations([
          { id: Date.now(), text, category: 'ai', isFavorite: false, isCustom: true, isAI: true },
          ...affirmations
        ]);
        updateStreak();
        setCategory('ai');
        setAffirmationIndex(0);
        Alert.alert('AI Affirmation Added', text);
      } else {
        Alert.alert('AI Error', 'Could not generate affirmation.');
      }
    } catch (err) {
      Alert.alert('AI Error', 'Could not generate affirmation.');
    }
    setAiLoading(false);
  };

  // Reminder CRUD
  const openReminderModal = (reminder = null) => {
    setEditingReminder(reminder);
    setReminderTime(reminder ? reminder.time : '');
    setReminderDays(reminder ? reminder.days : ['Every day']);
    setReminderActive(reminder ? reminder.active : true);
    setShowReminderModal(true);
  };
  const scheduleNotification = async (reminder) => {
    // Cancel any existing notification for this reminder
    if (reminder.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    if (!reminder.active) return;
    // For demo: schedule for the next minute (real app: parse time/days)
    const trigger = { seconds: 60, repeats: false };
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Affirmation Reminder',
        body: `It's time for your affirmation: ${reminder.time}`,
      },
      trigger,
    });
    return id;
  };
  const handleSaveReminder = async () => {
    if (!reminderTime.trim()) return;
    let notificationId = null;
    if (reminderActive) {
      notificationId = await scheduleNotification({ time: reminderTime, days: reminderDays, active: reminderActive });
    }
    if (editingReminder) {
      setReminders(reminders.map(r => r.id === editingReminder.id ? { ...r, time: reminderTime, days: reminderDays, active: reminderActive, notificationId } : r));
    } else {
      setReminders([
        { id: Date.now(), time: reminderTime, days: reminderDays, active: reminderActive, notificationId },
        ...reminders
      ]);
    }
    setShowReminderModal(false);
    setEditingReminder(null);
    setReminderTime('');
    setReminderDays(['Every day']);
    setReminderActive(true);
  };
  const handleDeleteReminder = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    setReminders(reminders.filter(r => r.id !== id));
  };
  const handleToggleReminder = async (id, val) => {
    const reminder = reminders.find(r => r.id === id);
    let notificationId = reminder?.notificationId;
    if (val) {
      notificationId = await scheduleNotification({ ...reminder, active: val });
    } else if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      notificationId = null;
    }
    setReminders(reminders.map(r => r.id === id ? { ...r, active: val, notificationId } : r));
  };

  // Helper to check and update streak
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastPracticed === today) return; // Already practiced today
    if (!lastPracticed) {
      setStreak(1);
    } else {
      const lastDate = new Date(lastPracticed);
      const diff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) setStreak(streak + 1);
      else setStreak(1);
    }
    setLastPracticed(today);
  };

  // Call updateStreak when user views/interacts with an affirmation
  useEffect(() => {
    if (currentAffirmation) updateStreak();
    // Only run when affirmationIndex changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affirmationIndex, category]);

  // Streak: Only increase on practice
  const markPracticed = () => {
    if (!practicedToday) {
      updateStreak();
      setPracticedToday(true);
    }
  };
  // Reset practicedToday at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timeout = setTimeout(() => setPracticedToday(false), msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [practicedToday]);

  return (
    <View style={styles.container}>
      <Header title="Daily Affirmations" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Daily Streak Banner */}
        <View style={styles.streakBanner}>
          <Text style={styles.streakTitle}>Daily Affirmation Streak</Text>
          <Text style={styles.streakSubtitle}>
            {streak > 0
              ? `You've practiced affirmations for ${streak} day${streak === 1 ? '' : 's'} in a row!`
              : 'Start your daily affirmation journey!'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (streak % 10) * 10)}%` }]} />
          </View>
          <Text style={styles.streakReward}>{streak > 0 ? `${10 - (streak % 10)} more day${10 - (streak % 10) === 1 ? '' : 's'} until your next reward` : 'Practice daily to earn rewards!'}</Text>
        </View>
        
        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => {
                setCategory(cat.id);
                setAffirmationIndex(0);
              }}
            >
              <Text style={[
                styles.categoryButtonText,
                category === cat.id && styles.categoryButtonTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* AI Generate Button */}
        <TouchableOpacity style={styles.aiButton} onPress={() => generateAIAffirmation()} disabled={aiLoading}>
          <Bot size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.aiButtonText}>{aiLoading ? 'Generating...' : 'AI Generate Affirmation'}</Text>
        </TouchableOpacity>
        
        {/* Affirmation Card */}
        {currentAffirmation ? (
          <View style={styles.affirmationCard}>
            <Sparkles size={32} color="#F59E0B" style={styles.affirmationIcon} />
            <Text style={styles.affirmationText}>{currentAffirmation.text}</Text>
            <TouchableOpacity style={styles.practiceButton} onPress={markPracticed} disabled={practicedToday}>
              <Text style={styles.practiceButtonText}>{practicedToday ? 'Practiced Today' : 'Mark as Practiced'}</Text>
            </TouchableOpacity>
            <View style={styles.affirmationControls}>
              <TouchableOpacity style={styles.controlButton} onPress={() => setAffirmationIndex((affirmationIndex - 1 + filteredAffirmations.length) % filteredAffirmations.length)}>
                <ArrowLeft size={20} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.controlButton, currentAffirmation.isFavorite && styles.favoriteButtonActive]} onPress={() => toggleFavorite(currentAffirmation.id)}>
                <Heart size={20} color={currentAffirmation.isFavorite ? '#FFFFFF' : '#1F2937'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={() => setAffirmationIndex((affirmationIndex + 1) % filteredAffirmations.length)}>
                <ArrowRight size={20} color="#1F2937" />
              </TouchableOpacity>
              {currentAffirmation.isCustom && (
                <TouchableOpacity style={styles.controlButton} onPress={() => openAffirmationModal(currentAffirmation)}>
                  <Edit size={20} color="#1F2937" />
                </TouchableOpacity>
              )}
              {currentAffirmation.isCustom && (
                <TouchableOpacity style={styles.controlButton} onPress={() => deleteAffirmation(currentAffirmation.id)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.dotsContainer}>
              {filteredAffirmations.map((_, i) => (
                <View key={i} style={[styles.dot, i === affirmationIndex % filteredAffirmations.length && styles.dotActive]} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={32} color="#9CA3AF" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No affirmations found</Text>
            <Text style={styles.emptyStateText}>Create your first custom or AI affirmation</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => openAffirmationModal()}>
              <Plus size={16} color="#FFFFFF" style={styles.createButtonIcon} />
              <Text style={styles.createButtonText}>Create Affirmation</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Create/Edit Affirmation Modal */}
        <Modal visible={showAffirmationModal} animationType="slide" transparent onRequestClose={() => setShowAffirmationModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingAffirmation ? 'Edit Affirmation' : 'Create Affirmation'}</Text>
                <TouchableOpacity onPress={() => setShowAffirmationModal(false)}><X size={24} color="#6B7280" /></TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={affirmationText}
                onChangeText={setAffirmationText}
                placeholder="Enter your affirmation..."
                multiline
              />
              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {categories.filter(c => c.id !== 'all' && c.id !== 'ai').map(cat => (
                  <TouchableOpacity key={cat.id} style={[styles.categoryButton, affirmationCategory === cat.id && styles.categoryButtonActive]} onPress={() => setAffirmationCategory(cat.id)}>
                    <Text style={[styles.categoryButtonText, affirmationCategory === cat.id && styles.categoryButtonTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.saveButton} onPress={saveAffirmation}>
                <Text style={styles.saveButtonText}>{editingAffirmation ? 'Save Changes' : 'Add Affirmation'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Create/Edit Reminder Modal */}
        <Modal visible={showReminderModal} animationType="slide" transparent onRequestClose={() => setShowReminderModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}><X size={24} color="#6B7280" /></TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="Time (e.g. 8:00 AM)"
              />
              <Text style={styles.modalLabel}>Days (comma separated)</Text>
              <TextInput
                style={styles.modalInput}
                value={reminderDays.join(', ')}
                onChangeText={text => setReminderDays(text.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Mon, Wed, Fri"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 15, color: '#374151', marginRight: 8 }}>Active</Text>
                <Switch value={reminderActive} onValueChange={setReminderActive} trackColor={{ false: '#E5E7EB', true: '#F59E0B' }} thumbColor={reminderActive ? '#FFFFFF' : '#F3F4F6'} />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveReminder}>
                <Text style={styles.saveButtonText}>{editingReminder ? 'Save Changes' : 'Add Reminder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Reminders */}
        <View style={styles.remindersContainer}>
          <View style={styles.remindersHeader}>
            <Text style={styles.remindersTitle}>Reminders</Text>
            <TouchableOpacity style={styles.addReminderButton} onPress={() => openReminderModal()}>
              <Plus size={16} color="#D97706" style={styles.addReminderIcon} />
              <Text style={styles.addReminderText}>Add New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.remindersList}>
            {reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View>
                  <View style={styles.reminderTimeContainer}>
                    <Clock size={16} color="#6B7280" style={styles.reminderIcon} />
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                  <Text style={styles.reminderDays}>{reminder.days.join(', ')}</Text>
                </View>
                <View style={styles.reminderControls}>
                  <Switch value={reminder.active} onValueChange={val => handleToggleReminder(reminder.id, val)} trackColor={{ false: '#E5E7EB', true: '#F59E0B' }} thumbColor={reminder.active ? '#FFFFFF' : '#F3F4F6'} />
                  <TouchableOpacity style={styles.editReminderButton} onPress={() => openReminderModal(reminder)}>
                    <Edit size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editReminderButton} onPress={() => handleDeleteReminder(reminder.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Favorites */}
        <View style={styles.favoritesContainer}>
          <Text style={styles.favoritesTitle}>Favorites</Text>
          <View style={styles.favoritesList}>
            {affirmations.filter(a => a.isFavorite).map(affirmation => (
              <View key={affirmation.id} style={styles.favoriteItem}>
                <Text style={styles.favoriteText}>{affirmation.text}</Text>
                <Star size={18} color="#F59E0B" style={styles.favoriteIcon} />
              </View>
            ))}
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
  streakBanner: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#FEF3C7',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  streakReward: {
    fontSize: 12,
    color: '#FEF3C7',
    textAlign: 'right',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  affirmationCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  affirmationIcon: {
    marginBottom: 16,
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  affirmationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButtonActive: {
    backgroundColor: '#EC4899',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#F59E0B',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#D97706',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  remindersContainer: {
    marginBottom: 16,
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReminderIcon: {
    marginRight: 4,
  },
  addReminderText: {
    fontSize: 14,
    color: '#D97706',
  },
  remindersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reminderTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    marginRight: 8,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  reminderDays: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  reminderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editReminderButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  favoritesContainer: {
    marginBottom: 16,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  favoritesList: {
    gap: 12,
  },
  favoriteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginRight: 16,
  },
  favoriteIcon: {
    flexShrink: 0,
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#D97706',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalInput: {
    height: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#D97706',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  practiceButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 12,
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyAffirmationsScreen; 