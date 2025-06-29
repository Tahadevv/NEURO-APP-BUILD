import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated, Easing, ActivityIndicator, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Wind, CheckCircle, ArrowLeft, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HF_TOKEN = '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';

const MEDITATION_HISTORY_KEY = '@meditation_sessions';

const MeditationScreen = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const breathAnim = useRef(new Animated.Value(1)).current;

  // Load history on mount
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(MEDITATION_HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    })();
  }, []);

  // Breathing animation
  React.useEffect(() => {
    if (sessionActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1.3, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(breathAnim, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
        ])
      ).start();
    } else {
      breathAnim.setValue(1);
    }
  }, [sessionActive]);

  // HuggingFace Inference API call
  const generateScript = async () => {
    if (!userPrompt.trim()) {
      Alert.alert('Please enter your mood or focus for the session.');
      return;
    }
    setLoading(true);
    setScript('');
    try {
      const response = await fetch('https://api.endpoints.huggingface.cloud/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages: [
            { role: 'user', content: `Generate a personalized meditation script for: ${userPrompt}` }
          ],
          provider: 'novita',
        }),
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'Could not generate script. Try again.';
      setScript(text);
    } catch (err) {
      setScript('Error generating meditation script.');
    }
    setLoading(false);
  };

  // Start session
  const startSession = () => {
    setSessionActive(true);
    setProgress(0);
    // Simulate progress (e.g., 5 min session)
    let prog = 0;
    const interval = setInterval(() => {
      prog += 1;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setSessionActive(false);
        saveSession();
        Alert.alert('Session Complete', 'Great job! Your meditation session is complete.');
      }
    }, 1500); // 1500ms * 100 = 2.5 min session
  };

  // Save session to history
  const saveSession = async () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      script,
      userPrompt,
    };
    const updated = [newEntry, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(MEDITATION_HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3B82F6", "#4F46E5"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => history.length ? setShowHistory(true) : null}>
          <Brain size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Meditation</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Personalized Meditation</Text>
        <Text style={styles.subtitle}>Let AI generate a meditation session for you</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe your mood, focus, or goal..."
          placeholderTextColor="#9CA3AF"
          value={userPrompt}
          onChangeText={setUserPrompt}
          editable={!loading && !sessionActive}
        />
        <TouchableOpacity style={styles.generateButton} onPress={generateScript} disabled={loading || sessionActive}>
          <LinearGradient colors={["#3B82F6", "#4F46E5"]} style={styles.generateGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Plus size={18} color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.generateButtonText}>{loading ? 'Generating...' : 'Generate Session'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {script ? (
          <View style={styles.scriptCard}>
            <Text style={styles.scriptTitle}>Your Meditation Script</Text>
            <ScrollView style={styles.scriptScroll}><Text style={styles.scriptText}>{script}</Text></ScrollView>
            {!sessionActive && (
              <TouchableOpacity style={styles.startButton} onPress={startSession}>
                <LinearGradient colors={["#10B981", "#3B82F6"]} style={styles.startGradient}>
                  <Wind size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.startButtonText}>Start Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {sessionActive && (
          <View style={styles.breathingCard}>
            <Text style={styles.breathingTitle}>Breathe with the Circle</Text>
            <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breathAnim }] }]} />
            <Text style={styles.breathingText}>Inhale... Exhale...</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
          <CheckCircle size={18} color="#3B82F6" style={{ marginRight: 8 }} />
          <Text style={styles.historyButtonText}>View Session History</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <View style={styles.historyModal}>
          <TouchableOpacity style={styles.closeHistory} onPress={() => setShowHistory(false)}>
            <ArrowLeft size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.historyTitleModal}>Meditation History</Text>
          <ScrollView style={styles.historyList}>
            {history.length === 0 ? (
              <Text style={styles.emptyHistory}>No sessions yet.</Text>
            ) : history.map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyPrompt}>Prompt: {item.userPrompt}</Text>
                <Text style={styles.historyScript}>{item.script}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20, backgroundColor: '#3B82F6', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backButton: { marginRight: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#4F46E5', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  generateButton: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  generateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scriptCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  scriptTitle: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6', marginBottom: 8 },
  scriptScroll: { maxHeight: 180, marginBottom: 12 },
  scriptText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  startButton: { borderRadius: 12, overflow: 'hidden' },
  startGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  breathingCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  breathingTitle: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginBottom: 12 },
  breathingCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E7FF', marginBottom: 16 },
  breathingText: { fontSize: 16, color: '#4F46E5', marginBottom: 12 },
  progressBarContainer: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: 8, backgroundColor: '#10B981', borderRadius: 4 },
  historyButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'center' },
  historyButtonText: { color: '#3B82F6', fontSize: 15, fontWeight: '600', marginLeft: 4 },
  historyModal: { flex: 1, backgroundColor: '#EEF2FF', paddingTop: 48, paddingHorizontal: 20 },
  closeHistory: { marginBottom: 16, alignSelf: 'flex-start' },
  historyTitleModal: { fontSize: 22, fontWeight: 'bold', color: '#3B82F6', marginBottom: 16, textAlign: 'center' },
  historyList: { flex: 1 },
  emptyHistory: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginTop: 32 },
  historyItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  historyDate: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  historyPrompt: { fontSize: 14, color: '#4F46E5', marginBottom: 4 },
  historyScript: { fontSize: 14, color: '#374151' },
});

export default MeditationScreen; 