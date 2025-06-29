import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { Phone, MessageSquare, AlertTriangle, ArrowLeft, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Header from '../components/Header';

const EmergencyScreen = () => {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  
  const emergencyContacts = [
    { id: 1, name: 'Crisis Support Line', phone: '1-800-123-4567', type: 'hotline' },
    { id: 2, name: 'Dr. Sarah Johnson', phone: '1-234-567-8901', type: 'therapist' },
    { id: 3, name: 'Emergency Contact (Family)', phone: '1-987-654-3210', type: 'personal' },
  ];
  
  const resources = [
    { id: 1, title: 'Grounding Techniques', description: 'Quick exercises to help during a crisis' },
    { id: 2, title: 'Breathing Methods', description: 'Calm your body and mind with guided breathing' },
    { id: 3, title: 'Crisis Plan', description: 'Review your personal crisis management plan' },
  ];
  
  const handleSendSOS = () => {
    setSending(true);
    
    // Simulate sending SOS
    setTimeout(() => {
      setSending(false);
      Toast.show({
        type: 'success',
        text1: 'Emergency alert sent to your contacts',
        text2: 'Help is on the way',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }, 2000);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Emergency Support" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={18} color="#3B82F6" style={styles.backIcon} />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
        
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <AlertTriangle size={20} color="#DC2626" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>In Crisis?</Text>
              <Text style={styles.alertDescription}>
                If you're experiencing an emergency or having thoughts of harming yourself, please use the SOS button to alert your emergency contacts or call a crisis helpline directly.
              </Text>
              <TouchableOpacity 
                onPress={handleSendSOS}
                disabled={sending}
                style={[styles.sosButton, sending && styles.sosButtonDisabled]}
              >
                {sending ? (
                  <View style={styles.sosButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
                    <Text style={styles.sosButtonText}>Sending Alert...</Text>
                  </View>
                ) : (
                  <Text style={styles.sosButtonText}>Send SOS Alert</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactsList}>
            {emergencyContacts.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.messageButton}
                    onPress={() => handleMessage(contact.phone)}
                  >
                    <MessageSquare size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => handleCall(contact.phone)}
                  >
                    <Phone size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Immediate Resources</Text>
          <View style={styles.resourcesList}>
            {resources.map(resource => (
              <TouchableOpacity 
                key={resource.id}
                style={styles.resourceCard}
              >
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.heartContainer}>
            <Heart size={20} color="#EF4444" />
          </View>
          <Text style={styles.footerText}>
            Remember, it's okay to ask for help.{'\n'}You are not alone.
          </Text>
        </View>
      </ScrollView>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    marginRight: 4,
  },
  backText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  alertContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  alertContent: {
    flexDirection: 'row',
  },
  alertIconContainer: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B91C1C',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 16,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sosButtonDisabled: {
    opacity: 0.7,
  },
  sosButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 20,
  },
  callButton: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 20,
  },
  resourcesList: {
    gap: 12,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  heartContainer: {
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default EmergencyScreen; 