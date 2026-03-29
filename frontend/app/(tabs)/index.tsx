import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import TabBar from './TabBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Welcome text position
const WELCOME_Y = SCREEN_HEIGHT * 0.27;

// Clouds (example positions)
const CLOUDS = [
  { x: 0, y: SCREEN_HEIGHT * 0.06, width: 220, text: '34 new events!', float: -12, delay: 100, rotation: '-7deg' },
  { x: SCREEN_WIDTH * 0.3, y: SCREEN_HEIGHT * 0.4, width: 290, text: '3 new messages!', float: -8, delay: 300, rotation: '-7deg' },
  { x: -20, y: SCREEN_HEIGHT * 0.61, width: 240, text: '2 events today!', float: -10, delay: 200, rotation: '-7deg' },
];

// Cloud component
function Cloud({ text, x, y, width, delay, float, rotation }: any) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, delay);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: float, duration: 3000 + delay * 0.4, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000 + delay * 0.4, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const height = width / 1.6;
  const fontSize = width * 0.072;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity: fadeAnim,
        transform: [{ translateY: floatAnim }],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <Image
        source={require('../../assets/images/cloud.png')}
        style={{ width, height, resizeMode: 'contain', transform: [{ rotate: rotation }] }}
      />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingTop: height * 0.25 }}>
        <Text style={{ fontFamily: FONTS.body, color: COLORS.dustyTangerine, fontSize, textAlign: 'center', lineHeight: 22 }}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

// Dashboard screen
export default function DashboardScreen() {

  const fontsLoaded = useAppFonts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const userName = '';

  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#7BAED4', '#9BBDE0', '#C5D4F5']} style={StyleSheet.absoluteFill} />

  <TouchableOpacity style={{ position: 'absolute', top: 56, right: 20, zIndex: 30 }} onPress={() => router.push('./profile')} activeOpacity={0.8}>
        <Ionicons name="person-circle-outline" size={42} color={COLORS.deepNavy} />
      </TouchableOpacity>

      {/* Clouds */}
      {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}

      {/* Welcome text */}
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: WELCOME_Y, alignItems: 'center', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={{ fontFamily: FONTS.heading, fontSize: 34, color: COLORS.warmMelon, textAlign: 'center', lineHeight: 44, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
          Welcome back{'\n'}{userName || '______'}!
        </Text>
      </Animated.View>

  {/* CUSTOM TAB BAR */}
  <TabBar />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  profileButton: { position: 'absolute', top: 56, right: 20, zIndex: 30 },
  welcomeWrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  welcomeText: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: COLORS.warmMelon,
    textAlign: 'center',
    lineHeight: 44,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cloudWrapper: { position: 'absolute', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  cloudTextWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cloudText: { fontFamily: FONTS.body, color: COLORS.dustyTangerine, textAlign: 'center', lineHeight: 22 },
});