import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle } from 'lucide-react-native';

const EmergencyButton: React.FC = () => {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.7,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => {
      pulseAnim.setValue(1);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.pulseOverlay,
          {
            opacity: pulseAnim,
          }
        ]} 
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Emergency' as never)}
        activeOpacity={0.8}
      >
        <AlertCircle size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Emergency Support</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 56,
  },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EF4444',
    borderRadius: 12,
  },
  button: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmergencyButton; 