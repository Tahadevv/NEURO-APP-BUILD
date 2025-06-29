// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Easing,
//   ScrollView,
//   Image,
//   Dimensions,
//   Platform,
//   Vibration,
//   ImageBackground,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
// import { Audio } from 'expo-av';
// import { BlurView } from 'expo-blur';
// import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
// import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei/native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import Reanimated, {
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   withRepeat,
//   withSequence,
//   useSharedValue,
//   interpolate,
// } from 'react-native-reanimated';
// import { MotiView, MotiText, AnimatePresence } from 'moti';
// import * as Haptics from 'expo-haptics';
// import * as Speech from 'expo-speech';
// import { StatusBar } from 'expo-status-bar';
// import { SharedElement } from 'react-navigation-shared-element';
// import LottieView from 'lottie-react-native';

// const { width, height } = Dimensions.get('window');

// const MEDITATION_TYPES = [
//   {
//     id: 'mindfulness',
//     title: 'Mindfulness Meditation',
//     description: 'Focus on the present moment and observe your thoughts without judgment.',
//     duration: 10,
//     techniques: ['Breath awareness', 'Body scan', 'Thought observation'],
//     benefits: ['Reduced stress', 'Improved focus', 'Better emotional regulation'],
//     animation: require('../assets/animations/mindfulness.json'),
//     ambience: require('../assets/sounds/nature.mp3'),
//     color: '#4CAF50',
//     backgroundImage: require('../assets/images/meditation/mindfulness.jpg'),
//     icon: 'leaf',
//   },
//   {
//     id: 'transcendental',
//     title: 'Transcendental Meditation',
//     description: 'Use a mantra to transcend ordinary thinking and reach a state of pure awareness.',
//     duration: 20,
//     techniques: ['Mantra repetition', 'Deep relaxation', 'Transcendental state'],
//     benefits: ['Deep relaxation', 'Enhanced creativity', 'Spiritual growth'],
//     animation: require('../assets/animations/transcendental.json'),
//     ambience: require('../assets/sounds/om.mp3'),
//     color: '#9C27B0',
//     backgroundImage: require('../assets/images/meditation/transcendental.jpg'),
//     icon: 'infinite',
//   },
//   {
//     id: 'healing',
//     title: 'Healing Meditation',
//     description: 'Focus on healing energy and positive intentions for physical and emotional well-being.',
//     duration: 15,
//     techniques: ['Energy visualization', 'Healing light', 'Positive affirmations'],
//     benefits: ['Physical healing', 'Emotional balance', 'Energy restoration'],
//     animation: require('../assets/animations/healing.json'),
//     ambience: require('../assets/sounds/singing-bowl.mp3'),
//     color: '#FF9800',
//     backgroundImage: require('../assets/images/meditation/healing.jpg'),
//     icon: 'heart',
//   },
// ];

// const AMBIENT_SOUNDS = {
//   rain: require('../assets/sounds/rain.mp3'),
//   ocean: require('../assets/sounds/ocean.mp3'),
//   forest: require('../assets/sounds/forest.mp3'),
//   crystal: require('../assets/sounds/crystal.mp3'),
//   silence: null,
// };

// const MEDITATION_SESSIONS = [
//   {
//     id: 'deep-sleep',
//     title: 'Deep Sleep Meditation',
//     duration: 10,
//     streak: 2,
//     category: 'Sleep',
//     image: require('../assets/images/meditation/sleep.jpg'),
//     description: 'Fall into a peaceful, deep sleep',
//   },
//   {
//     id: 'anxiety-relief',
//     title: 'Anxiety Relief',
//     duration: 5,
//     streak: 3,
//     category: 'Anxiety',
//     image: require('../assets/images/meditation/anxiety.jpg'),
//     description: 'Find calm and inner peace',
//   },
//   {
//     id: 'morning-focus',
//     title: 'Morning Focus',
//     duration: 8,
//     streak: 1,
//     category: 'Focus',
//     image: require('../assets/images/meditation/morning.jpg'),
//     description: 'Start your day with clarity',
//   },
//   {
//     id: 'stress-relief',
//     title: 'Stress Relief',
//     duration: 15,
//     streak: 0,
//     category: 'Anxiety',
//     image: require('../assets/images/meditation/stress.jpg'),
//     description: 'Release tension and find balance',
//   },
// ];

// const CATEGORIES = ['All', 'Sleep', 'Anxiety', 'Focus', 'Morning'];

// function Scene3D({ type, isActive }) {
//   const gltf = useGLTF(type.scene);
//   const meshRef = useRef();

//   useFrame((state) => {
//     if (isActive && meshRef.current) {
//       meshRef.current.rotation.y += 0.005;
//       meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
//     }
//   });

//   return (
//     <>
//       <Environment preset="sunset" />
//       <PerspectiveCamera makeDefault position={[0, 0, 5]} />
//       <primitive 
//         ref={meshRef}
//         object={gltf.scene}
//         scale={1.5}
//         position={[0, 0, 0]}
//       />
//     </>
//   );
// }

// function ParticleSystem({ type, isActive }) {
//   const particlesRef = useRef();
//   const count = 1000;
//   const positions = new Float32Array(count * 3);

//   useEffect(() => {
//     if (isActive) {
//       // Initialize particle positions based on type
//       for (let i = 0; i < count * 3; i += 3) {
//         positions[i] = (Math.random() - 0.5) * 10;
//         positions[i + 1] = (Math.random() - 0.5) * 10;
//         positions[i + 2] = (Math.random() - 0.5) * 10;
//       }
//     }
//   }, [isActive, type]);

//   useFrame((state) => {
//     if (isActive && particlesRef.current) {
//       // Animate particles based on type
//       const time = state.clock.elapsedTime;
//       for (let i = 0; i < count * 3; i += 3) {
//         particlesRef.current.geometry.attributes.position.array[i] += Math.sin(time + i) * 0.01;
//         particlesRef.current.geometry.attributes.position.array[i + 1] += Math.cos(time + i) * 0.01;
//         particlesRef.current.geometry.attributes.position.array[i + 2] += Math.sin(time + i) * 0.01;
//       }
//       particlesRef.current.geometry.attributes.position.needsUpdate = true;
//     }
//   });

//   return (
//     <points ref={particlesRef}>
//       <bufferGeometry>
//         <bufferAttribute
//           attachObject={['attributes', 'position']}
//           count={count}
//           array={positions}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial size={0.02} color={type.color} transparent opacity={0.6} />
//     </points>
//   );
// }

// export default function Meditation() {
//   const [selectedType, setSelectedType] = useState(MEDITATION_TYPES[0]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const animationProgress = useSharedValue(0);
//   const scale = useSharedValue(1);
//   const opacity = useSharedValue(1);
//   const pulseAnim = useSharedValue(1);
//   const rotateAnim = useSharedValue(0);
//   const lottieRef = useRef<LottieView>(null);

//   const router = useRouter();
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const breatheAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   // Animated circle for breathing
//   const breathingScale = useSharedValue(1);
//   const breathingOpacity = useSharedValue(1);

//   useEffect(() => {
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [sound]);

//   const loadSound = async () => {
//     try {
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         selectedType.ambience,
//         { shouldPlay: false, isLooping: true }
//       );
//       setSound(newSound);
//     } catch (error) {
//       console.error('Error loading sound:', error);
//     }
//   };

//   const startMeditation = async () => {
//     try {
//       setIsPlaying(true);
//       setCurrentTime(0);
//       animationProgress.value = withRepeat(
//         withSequence(
//           withTiming(1, { duration: 2000 }),
//           withTiming(0, { duration: 2000 })
//         ),
//         -1,
//         true
//       );

//       pulseAnim.value = withRepeat(
//         withSequence(
//           withTiming(1.2, { duration: 2000 }),
//           withTiming(1, { duration: 2000 })
//         ),
//         -1,
//         true
//       );

//       rotateAnim.value = withRepeat(
//         withTiming(360, { duration: 10000 }),
//         -1,
//         false
//       );

//       if (sound) {
//         await sound.playAsync();
//       }
//     } catch (error) {
//       console.error('Error starting meditation:', error);
//     }
//   };

//   const stopMeditation = async () => {
//     try {
//       setIsPlaying(false);
//       animationProgress.value = withTiming(0);
//       pulseAnim.value = withTiming(1);
//       rotateAnim.value = withTiming(0);
      
//       if (sound) {
//         await sound.stopAsync();
//       }
//     } catch (error) {
//       console.error('Error stopping meditation:', error);
//     }
//   };

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: scale.value }],
//       opacity: opacity.value,
//     };
//   });

//   const breathingCircleStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: animationProgress.value }],
//     };
//   });

//   const pulseStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: pulseAnim.value }],
//     };
//   });

//   const rotateStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ rotate: `${rotateAnim.value}deg` }],
//     };
//   });

//   const renderMeditationType = (type) => (
//     <MotiView
//       key={type.id}
//       from={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ type: 'timing', duration: 500 }}
//       style={[
//         styles.typeCard,
//         selectedType.id === type.id && styles.selectedTypeCard,
//       ]}
//     >
//       <TouchableOpacity
//         onPress={() => {
//           setSelectedType(type);
//           Haptics.selectionAsync();
//           scale.value = withSpring(1.02);
//           opacity.value = withTiming(1);
//           loadSound();
//         }}
//         style={styles.typeButton}
//       >
//         <ImageBackground
//           source={type.backgroundImage}
//           style={styles.typeBackground}
//           imageStyle={styles.typeBackgroundImage}
//         >
//           <BlurView intensity={80} style={styles.typeContent}>
//             <MotiText
//               style={styles.typeTitle}
//               from={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 200 }}
//             >
//               {type.title}
//             </MotiText>
//             <Text style={styles.typeDescription}>{type.description}</Text>
//           </BlurView>
//         </ImageBackground>
//       </TouchableOpacity>
//     </MotiView>
//   );

//   const filteredSessions = MEDITATION_SESSIONS.filter(
//     session => selectedCategory === 'All' || session.category === selectedCategory
//   );

//   const renderSessionCard = (session) => (
//     <View key={session.id} style={styles.sessionCard}>
//       <Image source={session.image} style={styles.sessionImage} />
//       <View style={styles.sessionOverlay}>
//         <Text style={styles.sessionTitle}>{session.title}</Text>
//         <View style={styles.sessionDetails}>
//           <View style={styles.sessionDetail}>
//             <MaterialIcons name="timer" size={16} color="white" />
//             <Text style={styles.sessionDetailText}>{session.duration} min</Text>
//           </View>
//           {session.streak > 0 && (
//             <View style={styles.sessionDetail}>
//               <MaterialIcons name="local-fire-department" size={16} color="white" />
//               <Text style={styles.sessionDetailText}>{session.streak}-day streak</Text>
//             </View>
//           )}
//         </View>
//       </View>
//       <View style={styles.sessionFooter}>
//         <Text style={styles.categoryLabel}>{session.category}</Text>
//         <TouchableOpacity 
//           style={styles.startButton}
//           onPress={() => router.push(`/meditation/${session.id}`)}
//         >
//           <Text style={styles.startButtonText}>Start</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />
//       <ImageBackground
//         source={selectedType.backgroundImage}
//         style={styles.background}
//         blurRadius={20}
//       >
//         <BlurView intensity={90} style={styles.content}>
//           <SharedElement id="meditation-header">
//             <MotiText
//               style={styles.title}
//               from={{ opacity: 0, translateY: -20 }}
//               animate={{ opacity: 1, translateY: 0 }}
//               transition={{ type: 'timing', duration: 1000 }}
//             >
//               Meditation
//             </MotiText>
//           </SharedElement>

//           <View style={styles.streakCard}>
//             <View style={styles.streakInfo}>
//               <Ionicons name="heart" size={24} color="#6C5CE7" />
//               <View style={styles.streakTexts}>
//                 <Text style={styles.streakTitle}>Current Streak</Text>
//                 <Text style={styles.streakSubtitle}>{currentStreak} days in a row!</Text>
//               </View>
//             </View>
//             <View style={styles.timeInfo}>
//               <Text style={styles.timeValue}>{todayMinutes}</Text>
//               <View style={styles.timeTexts}>
//                 <Text style={styles.timeLabel}>min today</Text>
//                 <Text style={styles.totalTime}>{totalMinutes} min total</Text>
//               </View>
//             </View>
//           </View>

//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.categoriesContainer}
//           >
//             {CATEGORIES.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[
//                   styles.categoryButton,
//                   selectedCategory === category && styles.categoryButtonActive,
//                 ]}
//                 onPress={() => setSelectedCategory(category)}
//               >
//                 <Text style={[
//                   styles.categoryButtonText,
//                   selectedCategory === category && styles.categoryButtonTextActive,
//                 ]}>
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <View style={styles.headerRow}>
//             <Text style={styles.sectionTitle}>Recommended Sessions</Text>
//             <TouchableOpacity onPress={() => router.push('/meditation/progress')}>
//               <Text style={styles.progressLink}>Progress</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             style={styles.sessionsContainer}
//           >
//             {filteredSessions.map(renderSessionCard)}
//           </ScrollView>

//           <MotiView
//             style={styles.controlsContainer}
//             from={{ opacity: 0, translateY: 50 }}
//             animate={{ opacity: 1, translateY: 0 }}
//             transition={{ type: 'timing', duration: 1000, delay: 500 }}
//           >
//             <View style={styles.durationSelector}>
//               {selectedType.duration.map((time) => (
//                 <TouchableOpacity
//                   key={time}
//                   style={[
//                     styles.durationButton,
//                     time === selectedType.duration[0] && styles.selectedDuration,
//                   ]}
//                   onPress={() => {
//                     setCurrentTime(0);
//                     Haptics.selectionAsync();
//                   }}
//                 >
//                   <Text style={styles.durationText}>{time} min</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <TouchableOpacity
//               style={styles.startButton}
//               onPress={isPlaying ? stopMeditation : startMeditation}
//             >
//               <Animated.View style={[styles.meditationIcon, pulseStyle, rotateStyle]}>
//                 <Ionicons
//                   name={selectedType.icon}
//                   size={80}
//                   color={selectedType.color}
//                 />
//               </Animated.View>
//               <Text style={styles.startButtonText}>
//                 {isPlaying ? 'Pause' : 'Start'}
//               </Text>
//             </TouchableOpacity>
//           </MotiView>
//         </BlurView>
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   background: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   title: {
//     fontSize: 34,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 30,
//   },
//   streakCard: {
//     backgroundColor: '#F5F6FF',
//     borderRadius: 15,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   streakInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   streakTexts: {
//     marginLeft: 12,
//   },
//   streakTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   streakSubtitle: {
//     fontSize: 14,
//     color: '#666666',
//     marginTop: 2,
//   },
//   timeInfo: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },
//   timeValue: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#6C5CE7',
//     marginRight: 4,
//   },
//   timeTexts: {
//     marginBottom: 4,
//   },
//   timeLabel: {
//     fontSize: 14,
//     color: '#666666',
//   },
//   totalTime: {
//     fontSize: 12,
//     color: '#999999',
//     marginTop: 2,
//   },
//   categoriesContainer: {
//     marginBottom: 20,
//   },
//   categoryButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginRight: 10,
//     borderRadius: 20,
//     backgroundColor: '#F5F6FF',
//   },
//   categoryButtonActive: {
//     backgroundColor: '#6C5CE7',
//   },
//   categoryButtonText: {
//     fontSize: 16,
//     color: '#666666',
//   },
//   categoryButtonTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   progressLink: {
//     fontSize: 16,
//     color: '#6C5CE7',
//   },
//   sessionsContainer: {
//     flex: 1,
//   },
//   sessionCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 15,
//     marginBottom: 20,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   sessionImage: {
//     width: '100%',
//     height: 160,
//   },
//   sessionOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     padding: 15,
//     justifyContent: 'flex-end',
//   },
//   sessionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 8,
//   },
//   sessionDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sessionDetail: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   sessionDetailText: {
//     color: '#FFFFFF',
//     marginLeft: 4,
//     fontSize: 14,
//   },
//   sessionFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#FFFFFF',
//   },
//   categoryLabel: {
//     fontSize: 14,
//     color: '#666666',
//   },
//   startButton: {
//     backgroundColor: '#6C5CE7',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   startButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   controlsContainer: {
//     padding: 20,
//     borderRadius: 25,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   durationSelector: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   durationButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 15,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   selectedDuration: {
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   durationText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   meditationIcon: {
//     width: 200,
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   typeCard: {
//     marginBottom: 15,
//     borderRadius: 25,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   selectedTypeCard: {
//     transform: [{ scale: 1.02 }],
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 5,
//   },
//   typeButton: {
//     height: 200,
//   },
//   typeBackground: {
//     flex: 1,
//   },
//   typeBackgroundImage: {
//     borderRadius: 25,
//   },
//   typeContent: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'flex-end',
//   },
//   typeTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 5,
//   },
//   typeDescription: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//   },
// }); 