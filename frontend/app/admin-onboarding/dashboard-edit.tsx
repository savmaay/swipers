import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPEECH_TEXT = 'To view and edit\nevents, click on\nthe first nav tab!';

// Swiper with speech bubble 
function SwiperWithBubble() {
  const foxBounce = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(foxBounce, { toValue: 0,   duration: 700, useNativeDriver: true }),
      ])
    ).start();

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(SPEECH_TEXT.slice(0, i));
      if (i >= SPEECH_TEXT.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.swiperSection}>
      {/* Speech bubble above swiper */}
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>
          {displayedText}
          {!typingDone && <Text style={styles.cursor}>|</Text>}
        </Text>
        {/* Tail dots pointing down toward swiper */}
        <View style={styles.tailDot1} />
        <View style={styles.tailDot2} />
        <View style={styles.tailDot3} />
      </View>

      {/* swiper below bubble */}
      <Animated.View style={{ transform: [{ translateY: foxBounce }] }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={styles.foxImage}
        />
      </Animated.View>
    </View>
  );
}

// Animated Down Arrow 
function AnimatedDownArrow() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 12, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,  duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={[styles.downArrow, { transform: [{ translateY: anim }] }]}>
      ↓
    </Animated.Text>
  );
}

// Demo Nav Bar — highlights the pencil (edit) button
function DemoNavBar() {
  const tabs = [
    { icon: 'pencil-outline',     isPencil: true  },  
    { icon: 'add-circle-outline', isPencil: false },
    { icon: 'calendar-outline',   isPencil: false },
    { icon: 'star-outline',       isPencil: false },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => {
            if (tab.isPencil) router.replace('/admin-onboarding/edit-demo');
          }}
        >
          <View style={[
            styles.tabIconWrapper,
            tab.isPencil && styles.tabIconHighlighted,
          ]}>
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={tab.isPencil ? '#fff' : COLORS.deepNavy}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Screen 
export default function AdminDashboardEditScreen() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7BAED4', '#9BBDE0', '#C5D4F5']}
        style={StyleSheet.absoluteFill}
      />

      {/* Swiper + speech bubble */}
      <SwiperWithBubble />

      {/* Animated arrow pointing down at nav bar */}
      <AnimatedDownArrow />

      {/* Demo nav bar with pencil highlighted */}
      <DemoNavBar />
    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  swiperSection: {
    alignItems: 'center',
    marginBottom: 16,
  },

  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: COLORS.deepNavy,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    maxWidth: SCREEN_WIDTH * 0.6,
    position: 'relative',
    left: -50, 
  },
  speechText: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.026,
    color: COLORS.dustyTangerine,
    textAlign: 'center',
    lineHeight: 30,
  },
  cursor: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.026,
    color: COLORS.dustyTangerine,
  },

  // Tail dots pointing downward toward swiper
  tailDot1: {
    bottom: -40,
    left: '60%',
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2.5, borderColor: COLORS.deepNavy,
  },
  tailDot2: {
    bottom: -45,
    left: '65%',
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
  },
  tailDot3: {
    bottom: -50,
    left: '70%',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
  },

  foxImage: {
    width: SCREEN_HEIGHT * 0.24,
    height: SCREEN_HEIGHT * 0.24,
    resizeMode: 'contain',
    left: 100,
  },

  downArrow: {
    fontFamily: FONTS.heading,
    fontSize: 100,
    color: COLORS.dustyTangerine,
    marginBottom: 8,
    left: -145,
    bottom: -70,
  },

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
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconHighlighted: {
    backgroundColor: 'rgba(46,49,72,0.35)',
    borderWidth: 2, borderColor: '#fff',
  },
});