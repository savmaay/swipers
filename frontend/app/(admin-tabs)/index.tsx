import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cloud 1 — top left
const CLOUD1_X        = 0;
const CLOUD1_Y        = SCREEN_HEIGHT * 0.06;
const CLOUD1_WIDTH    = 220;
const CLOUD1_FLOAT    = -12;
const CLOUD1_ROTATION = '-7deg';

// Cloud 2 — middle right
const CLOUD2_X        = SCREEN_WIDTH * 0.30;
const CLOUD2_Y        = SCREEN_HEIGHT * 0.38;
const CLOUD2_WIDTH    = 290;
const CLOUD2_FLOAT    = -8;
const CLOUD2_ROTATION = '-7deg';

// Cloud 3 — lower left
const CLOUD3_X        = -20;
const CLOUD3_Y        = SCREEN_HEIGHT * 0.61;
const CLOUD3_WIDTH    = 240;
const CLOUD3_FLOAT    = -10;
const CLOUD3_ROTATION = '-7deg';

// Welcome text
const WELCOME_Y = SCREEN_HEIGHT * 0.27;

function Cloud({
  text, x, y, width, delay, floatRange, rotation = '0deg',
}: {
  text: string; x: number; y: number; width: number;
  delay: number; floatRange: number; rotation?: string;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, delay);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: floatRange,
          duration: 3000 + delay * 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + delay * 0.4,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const height = width / 1.6;
  const fontSize = width * 0.072;

  return (
    <Animated.View
      style={[
        styles.cloudWrapper,
        { left: x, top: y, width, height, opacity: fadeAnim, transform: [{ translateY: floatAnim }] },
      ]}
    >
      <Image
        source={require('../../assets/images/cloud.png')}
        style={{ width, height, resizeMode: 'contain', transform: [{ rotate: rotation }] }}
      />
      <View style={[styles.cloudTextWrapper, { paddingTop: height * 0.25 }]}>
        <Text style={[styles.cloudText, { fontSize, width: width * 0.72 }]}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

// Admin Tab Bar
function AdminTabBar({ activeTab = -1 }: { activeTab?: number }) {
  const tabs = [
    { icon: 'pencil-outline',     route: '/(admin-tabs)/current-events'   },
    { icon: 'add-circle-outline', route: '/(admin-tabs)/add-event'   },
    { icon: 'calendar-outline',   route: '/(admin-tabs)/calendar'    },
    { icon: 'star-outline',       route: '/(admin-tabs)/analytics'   },
  ];

  const handlePress = (index: number) => {
    if (activeTab === index) {
      // Re-press active tab → go back to dashboard
      router.push('/(admin-tabs)');
      return;
    }
    router.push(tabs[index].route as any);
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handlePress(index)}
        >
          <View style={[styles.tabIconWrapper, activeTab === index && styles.tabIconActive]}>
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={activeTab === index ? '#fff' : COLORS.deepNavy}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Screen 
export default function AdminDashboardScreen() {
  const fontsLoaded = useAppFonts();
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;

  // TODO: replace with real admin data from auth context / API
  const adminName = '';
  const stats = {
    eventsToday:    4,
    peopleAttending: 80,
    newRatings:     2,
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7BAED4', '#9BBDE0', '#C5D4F5']}
        style={StyleSheet.absoluteFill}
      />

      {/* Profile / avatar icon top right — routes to profile editing */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push('/(admin-tabs)/profile')}
        activeOpacity={0.8}
      >
        <Ionicons name="person-circle-outline" size={42} color={COLORS.deepNavy} />
      </TouchableOpacity>

      {/* Cloud 1 — top left: events today */}
      <Cloud
        text={`${stats.eventsToday} events today!`}
        x={CLOUD1_X}
        y={CLOUD1_Y}
        width={CLOUD1_WIDTH}
        delay={100}
        floatRange={CLOUD1_FLOAT}
        rotation={CLOUD1_ROTATION}
      />

      {/* Welcome text */}
      <Animated.View
        style={[
          styles.welcomeWrapper,
          { top: WELCOME_Y, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.welcomeText}>
          Welcome back{'\n'}{adminName || '______'}!
        </Text>
      </Animated.View>

      {/* Cloud 2 — middle right: people attending */}
      <Cloud
        text={`${stats.peopleAttending} people attending!`}
        x={CLOUD2_X}
        y={CLOUD2_Y}
        width={CLOUD2_WIDTH}
        delay={300}
        floatRange={CLOUD2_FLOAT}
        rotation={CLOUD2_ROTATION}
      />

      {/* Cloud 3 — lower left: new ratings */}
      <Cloud
        text={`${stats.newRatings} new ratings!`}
        x={CLOUD3_X}
        y={CLOUD3_Y}
        width={CLOUD3_WIDTH}
        delay={200}
        floatRange={CLOUD3_FLOAT}
        rotation={CLOUD3_ROTATION}
      />

      {/* Admin tab bar */}
      <AdminTabBar activeTab={-1} />
    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: { flex: 1 },

  profileButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 30,
  },

  welcomeWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
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

  // Cloud
  cloudWrapper: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudTextWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudText: {
    fontFamily: FONTS.body,
    color: COLORS.warmMelon,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Tab bar
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 84,
    backgroundColor: COLORS.warmMelon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 54, height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(46,49,72,0.25)',
  },
});