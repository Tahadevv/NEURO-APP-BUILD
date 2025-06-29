import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBackClick 
}) => {
  const navigation = useNavigation();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBackClick}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    ...Platform.select({
      ios: {
        paddingTop: 44, // For iOS status bar
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: -8,
    marginRight: 4,
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
});

export default Header; 