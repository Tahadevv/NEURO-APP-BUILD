import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MobileNavbar from '../components/MobileNavbar';

const TherapyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Therapy Screen</Text>
      <MobileNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TherapyScreen; 