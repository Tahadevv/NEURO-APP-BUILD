import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Smile, Mic, Trash2, StopCircle, PlayCircle, ArrowLeft, Plus } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Happy', color: '#10B981' },
  { emoji: '😊', label: 'Content', color: '#3B82F6' },
  { emoji: '😐', label: 'Neutral', color: '#6B7280' },
  { emoji: '😔', label: 'Sad', color: '#8B5CF6' },
  { emoji: '😡', label: 'Angry', color: '#EF4444' },
  { emoji: '😱', label: 'Anxious', color: '#F59E0B' },
  { emoji: '🥳', label: 'Excited', color: '#EC4899' },
  { emoji: '😴', label: 'Tired', color: '#14B8A6' },
];

const MOOD_STORAGE_KEY = '@mood_journal_entries';

const MoodJournalScreen = () => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadEntries();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load mood entries', e);
    }
  };

  const saveEntries = async (newEntries: any[]) => {
    try {
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.error('Failed to save mood entries', e);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Please select your mood!');
      return;
    }
    setIsSaving(true);
    const newEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      note: note.trim(),
      date: new Date().toISOString(),
      voiceUri: voiceUri,
    };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    await saveEntries(newEntries);
    setSelectedMood(null);
    setNote('');
    setVoiceUri(null);
    setIsSaving(false);
    setShowEmojiPicker(false);
  };

  const handleDelete = async (id: string) => {
    const filtered = entries.filter(e => e.id !== id);
    setEntries(filtered);
    await saveEntries(filtered);
  };

  // Voice note recording logic
  const startRecording = async () => {
    try {
      console.log('Starting recording process...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required', 
          'To record voice notes, please enable microphone access in your device settings:\n\n' +
          'iOS: Settings > Privacy & Security > Microphone > Neuro Care\n' +
          'Android: Settings > Apps > Neuro Care > Permissions > Microphone',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => startRecording() }
          ]
        );
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and prepare recording using the correct API
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      console.log('Recording started successfully');
      Alert.alert('Recording Started', 'Voice recording is now active. Tap "Stop Recording" when done.');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', `Could not start recording: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        console.log('No recording to stop');
        return;
      }
      
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      console.log('Recording stopped and stored at:', uri);
      
      setVoiceUri(uri);
      setRecording(null);
      
      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      Alert.alert('Recording Saved', 'Voice note has been saved successfully!');
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording Error', `Could not stop recording: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const playVoice = async (uri: string) => {
    try {
      console.log('Attempting to play voice note from:', uri);
      
      // If already playing, stop current playback
      if (isPlaying && soundRef.current) {
        console.log('Stopping current playback');
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        setIsPlaying(false);
        return;
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and load sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status) => {
          console.log('Playback status:', status);
          if (status.isLoaded) {
            if (status.didJustFinish) {
              console.log('Playback finished');
              setIsPlaying(false);
            }
          } else {
            console.log('Playback not loaded');
            setIsPlaying(false);
          }
        }
      );

      soundRef.current = sound;
      setIsPlaying(true);
      
      // Play the sound
      await sound.playAsync();
      console.log('Playing voice note successfully');
    } catch (err) {
      console.error('Failed to play sound', err);
      Alert.alert('Playback Error', `Could not play voice note: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsPlaying(false);
    }
  };

  // Test function to verify audio is working
  const testAudio = async () => {
    try {
      console.log('Testing audio functionality...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Audio permission status:', status);
      
      if (status === 'granted') {
        Alert.alert('Audio Test', 'Audio permissions are working correctly! You can now record voice notes.');
      } else {
        Alert.alert(
          'Microphone Permission Denied', 
          'To use voice notes, please enable microphone access:\n\n' +
          'iOS: Settings > Privacy & Security > Microphone > Neuro Care\n' +
          'Android: Settings > Apps > Neuro Care > Permissions > Microphone\n\n' +
          'After enabling, tap "Test Audio" again.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Try Again', onPress: () => testAudio() }
          ]
        );
      }
    } catch (err) {
      console.error('Audio test failed:', err);
      Alert.alert('Audio Test Failed', `Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Simple test function to verify button press
  const testButtonPress = () => {
    console.log('Button pressed!');
    Alert.alert('Button Test', 'The button is working!');
  };

  // Cleanup function for audio resources
  const cleanupAudio = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
    } catch (err) {
      console.error('Error cleaning up audio', err);
    }
  };

  // Enhanced useEffect with cleanup
  useEffect(() => {
    loadEntries();
    
    return () => {
      cleanupAudio();
    };
  }, []);

  // Cleanup when component unmounts or when recording/playing state changes
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const renderEntry = ({ item }: { item: any }) => (
    <View style={styles.entryCard}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.entryCardGradient}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryMoodContainer}>
            <Text style={styles.entryMood}>{item.mood}</Text>
            <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
        {item.note ? (
          <Text style={styles.entryNote}>{item.note}</Text>
        ) : null}
        {item.voiceUri ? (
          <TouchableOpacity 
            style={styles.voicePlaybackButton} 
            onPress={() => playVoice(item.voiceUri)}
          >
            <LinearGradient
              colors={['#4F46E5', '#3B82F6']}
              style={styles.voicePlaybackGradient}
            >
              <PlayCircle size={20} color="#FFFFFF" />
              <Text style={styles.voicePlaybackText}>Play Voice Note</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#4F46E5']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mood Journal</Text>
          <Text style={styles.subtitle}>Track your emotional journey</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Mood Picker Section */}
        <View style={styles.moodPickerSection}>
          <TouchableOpacity
            style={styles.moodPickerButton}
            onPress={() => setShowEmojiPicker(true)}
          >
            <LinearGradient
              colors={selectedMood ? ['#10B981', '#059669'] : ['#3B82F6', '#4F46E5']}
              style={styles.moodPickerGradient}
            >
              <Text style={styles.moodPickerButtonText}>
                {selectedMood ? `Mood: ${selectedMood}` : 'Select Your Mood'}
              </Text>
              <Smile size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Note Input */}
        <View style={styles.noteSection}>
          <Text style={styles.sectionLabel}>Add a note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="How are you feeling? What's on your mind?"
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={300}
          />
          <Text style={styles.charCount}>{note.length}/300</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {/* Test Audio Button */}
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={testAudio}
          >
            <LinearGradient
              colors={['#6B7280', '#4B5563']}
              style={styles.testButtonGradient}
            >
              <Text style={styles.testButtonText}>Test Audio</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Voice note controls */}
          {voiceUri ? (
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={() => playVoice(voiceUri)}
            >
              <LinearGradient
                colors={isPlaying ? ['#EF4444', '#DC2626'] : ['#4F46E5', '#3B82F6']}
                style={styles.voiceButtonGradient}
              >
                {isPlaying ? (
                  <StopCircle size={18} color="#FFFFFF" />
                ) : (
                  <PlayCircle size={18} color="#FFFFFF" />
                )}
                <Text style={styles.voiceButtonText}>
                  {isPlaying ? 'Stop' : 'Play Voice'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : recording ? (
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={stopRecording}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={[styles.voiceButtonGradient, styles.recordingButton]}
              >
                <StopCircle size={18} color="#FFFFFF" />
                <Text style={styles.voiceButtonText}>Stop Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={() => {
                console.log('Record Voice button pressed!');
                testButtonPress(); // Test if button press works
                startRecording();
              }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.voiceButtonGradient}
              >
                <Mic size={18} color="#FFFFFF" />
                <Text style={styles.voiceButtonText}>Record Voice</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.saveButton, (!selectedMood || isSaving) && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={!selectedMood || isSaving}
          >
            <LinearGradient
              colors={['#3B82F6', '#4F46E5']}
              style={styles.saveButtonGradient}
            >
              <Plus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Your Mood History</Text>
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={renderEntry}
            contentContainerStyle={styles.historyList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Smile size={48} color="#9CA3AF" />
                <Text style={styles.emptyHistory}>No entries yet</Text>
                <Text style={styles.emptySubtext}>Start journaling your mood to track your emotional journey</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emojiPickerModal}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.emojiPickerGradient}
            >
              <Text style={styles.emojiPickerTitle}>How are you feeling?</Text>
              <View style={styles.emojiRow}>
                {MOOD_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.emoji}
                    style={[
                      styles.emojiButton,
                      selectedMood === option.emoji && styles.emojiButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedMood(option.emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={styles.emoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.emojiLabel,
                      selectedMood === option.emoji && styles.emojiLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowEmojiPicker(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  moodPickerSection: {
    marginBottom: 24,
  },
  moodPickerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moodPickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  moodPickerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  noteSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  historyList: {
    paddingBottom: 20,
  },
  entryCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  entryCardGradient: {
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryMood: {
    fontSize: 28,
    marginRight: 12,
  },
  entryDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryNote: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  voicePlaybackButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  voicePlaybackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  voicePlaybackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyHistory: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerModal: {
    borderRadius: 24,
    overflow: 'hidden',
    width: 340,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  emojiPickerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  emojiPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  emojiButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    width: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiButtonSelected: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emojiLabelSelected: {
    color: '#FFFFFF',
  },
  closeModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  recordingButton: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default MoodJournalScreen; 