import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Heart, MessageCircle, Share } from 'lucide-react-native';

interface ContentCardProps {
  title: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  timestamp?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  content,
  image,
  likes = 0,
  comments = 0,
  timestamp = '1 hour ago'
}) => {
  const slideAnim = new Animated.Value(50);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.card,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      
      {image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
      
      <Text style={styles.content}>{content}</Text>
      
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={18} color="#6B7280" />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={18} color="#6B7280" />
            <Text style={styles.actionText}>{comments}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{timestamp}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Share size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 192, // equivalent to h-48 in tailwind
  },
  content: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  shareButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default ContentCard; 