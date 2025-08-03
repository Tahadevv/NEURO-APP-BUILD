import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  Dimensions,
  Image,
  Easing,
  Alert,
} from 'react-native';
import { Send, Smile, Plus, Sparkles, MessageCircle, Heart, Calendar, Moon } from 'lucide-react-native';
import Header from '../components/Header';
import MobileNavbar from '../components/MobileNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotResponse {
  message: string;
  role: string;
  conversation_id: string;
}

const { width } = Dimensions.get('window');

const suggestedPrompts = [
  { text: "I'm feeling anxious about...", icon: Smile },
  { text: "I need help processing...", icon: Heart },
  { text: "I'm having trouble sleeping...", icon: Moon },
  { text: "My daily routine is...", icon: Calendar },
];

const features = [
  { icon: Heart, text: 'Emotional Support' },
  { icon: Sparkles, text: 'AI-Powered' },
  { icon: MessageCircle, text: '24/7 Available' },
];

const ChatSupportScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your mental health companion. I'm here to listen and support you in a safe, judgment-free space. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState('test-conversation-1');
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const scrollAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -200,
          duration: 15000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    scrollAnimation.start();

    return () => {
      scrollAnimation.stop();
    };
  }, []);

  // Load messages from AsyncStorage on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem('@chat_messages');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
        }
      } catch (e) {
        console.error('Failed to load messages from storage', e);
      }
    };
    loadMessages();
  }, []);

  // Save messages to AsyncStorage whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('@chat_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save messages to storage', e);
      }
    };
    saveMessages();
  }, [messages]);

  const sendMessageToAPI = async (message: string): Promise<string> => {
    try {
      const response = await fetch('https://neurocare-chatbottttttttt.vercel.app/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          role: 'user',
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to API:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Add a timeout to prevent typing indicator from getting stuck
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 30000); // 30 second timeout

    // Force scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Send message to API
      const botResponse = await sendMessageToAPI(userMessage.text);
      
      clearTimeout(typingTimeout); // Clear timeout since we got a response
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false); // Stop typing when response is received
      
      // Force scroll to bottom after bot response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      clearTimeout(typingTimeout); // Clear timeout since we're handling the error
      
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false); // Stop typing when fallback is shown
      
      // Force scroll to bottom after fallback message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      Alert.alert(
        'Connection Error',
        'Unable to connect to the chatbot service. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInputText(prompt);
  };

  useEffect(() => {
    // Scroll to bottom whenever messages change
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const renderMessage = (message: Message, index: number) => {
    const isBot = message.sender === 'bot';
    const isLastMessage = index === messages.length - 1;

    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        {isBot && (
          <LinearGradient
            colors={['#4F46E5', '#3B82F6'] as const}
            style={styles.botIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={16} color="#fff" />
          </LinearGradient>
        )}
        <View style={styles.messageContent}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {message.text}
          </Text>
          <Text style={[styles.timestamp, isBot ? styles.botTimestamp : styles.userTimestamp]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={['#3B82F6', '#4F46E5'] as const}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Header title="Chat Support" />
      </LinearGradient>
      <View style={styles.contentContainer}>
        <ScrollView
          ref={scrollViewRef}
          key={`messages-${messages.length}`}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        >
          {/* Welcome Card */}
          <LinearGradient
            colors={['#EEF2FF', '#F8FAFC'] as const}
            style={styles.welcomeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeIcon}>
                <MessageCircle size={24} color="#4F46E5" />
              </View>
              <View style={styles.welcomeHeaderText}>
                <Text style={styles.welcomeTitle}>Welcome to Your Safe Space</Text>
                <Text style={styles.welcomeSubtitle}>AI Mental Health Companion</Text>
              </View>
            </View>
            <Text style={styles.welcomeText}>
              Feel free to share your thoughts and feelings. I'm here to listen and support you 24/7, providing a judgment-free space for open conversation.
            </Text>
            <View style={styles.welcomeFeatures}>
              <Animated.View 
                style={[
                  styles.featuresContainer,
                  {
                    transform: [{ translateX: scrollX }],
                  },
                ]}
              >
                <View style={styles.featuresRow}>
                  {[...features, ...features].map((feature, index) => (
                    <LinearGradient
                      key={index}
                      colors={['#E0E7FF', '#C7D2FE'] as const}
                      style={styles.featureItem}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <feature.icon size={16} color="#4F46E5" />
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </LinearGradient>
                  ))}
                </View>
              </Animated.View>
            </View>
          </LinearGradient>

          {/* Messages */}
          {messages.map((message, index) => renderMessage(message, index))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomContainer}>
          {/* Suggested Prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promptsContainer}
            contentContainerStyle={styles.promptsContent}
          >
            {suggestedPrompts.map((prompt, index) => (
              <LinearGradient
                key={index}
                colors={['#E0E7FF', '#C7D2FE'] as const}
                style={styles.promptBubble}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  style={styles.promptInner}
                  onPress={() => handlePromptSelect(prompt.text)}
                >
                  <prompt.icon size={16} color="#4F46E5" style={styles.promptIcon} />
                  <Text style={styles.promptText}>{prompt.text}</Text>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainerFlagship}>
            <TouchableOpacity style={styles.attachButton}>
              <Plus size={24} color="#4F46E5" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <MobileNavbar />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 60, // Space for navbar
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  welcomeFeatures: {
    overflow: 'hidden', // Hide scrolled content
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  featuresContainer: {
    flexDirection: 'row',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  featureText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageContent: {
    flex: 1,
  },
  botBubble: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: '#FFFFFF',
  },
  userText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  botTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userTimestamp: {
    color: '#9CA3AF',
    textAlign: 'right',
  },
  typingBubble: {
    maxWidth: 'auto',
    paddingVertical: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  promptsContainer: {
    maxHeight: 50,
  },
  promptsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  promptBubble: {
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  promptInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptIcon: {
    marginRight: 6,
  },
  promptText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainerFlagship: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#4F46E5',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
});

export default ChatSupportScreen; 