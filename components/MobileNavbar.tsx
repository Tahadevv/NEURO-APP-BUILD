import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  BarChart2, 
  Home, 
  Smile, 
  HeartPulse, 
  MessageCircle, 
  Brain, 
  Moon, 
  Apple, 
  Users, 
  Sparkles 
} from 'lucide-react-native';

type NavigationPath = '/Home' | '/dashboard' | '/emotion-tracker' | '/meditation' | '/chat-support';

const MobileNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: Array<{path: NavigationPath; name: string; icon: any}> = [
    { path: '/Home', name: 'Home', icon: Home },
    { path: '/dashboard', name: 'Dashboard', icon: BarChart2 },
    { path: '/emotion-tracker', name: 'Emotions', icon: Smile },
    { path: '/meditation', name: 'Therapy', icon: HeartPulse },
    { path: '/chat-support', name: 'Chat', icon: MessageCircle },
  ];

  const handleNavigation = (path: NavigationPath) => {
    if (path === '/Home') {
      router.push('/home');
    } else {
      router.push(path);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[
              styles.navItem,
              pathname === item.path && styles.activeNavItem
            ]}
            onPress={() => handleNavigation(item.path)}
          >
            <item.icon 
              size={24} 
              color={pathname === item.path ? '#3B82F6' : '#6B7280'} 
            />
            <Text 
              style={[
                styles.navText,
                pathname === item.path && styles.activeNavText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  activeNavText: {
    color: '#3B82F6',
  },
});

export default MobileNavbar; 