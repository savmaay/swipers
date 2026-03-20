import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fox
const FOX_SIZE = 170;       // width & height of fox image
const FOX_X    = 10;        // distance from LEFT edge of screen
const FOX_Y    = 120;        // distance from TOP of screen (increase = lower)

// Speech Bubble
const BUBBLE_X         = 150;   // distance from LEFT edge of screen
const BUBBLE_Y         = 50;    // distance from TOP of screen (increase = lower)
const BUBBLE_WIDTH     = 200;   // width of speech bubble
const BUBBLE_HEIGHT    = 100;   // height of speech bubble (it's circular/oval)
const BUBBLE_FONT_SIZE = 25;    // font size inside bubble

// Description box
const DESC_WIDTH      = '92%';  // width of description box
const DESC_HEIGHT     = 475;    // controls height in pixels
const DESC_FONT_SIZE  = 31;     // font size inside description box
const DESC_PADDING_V  = 24;     // vertical padding inside description box
const DESC_PADDING_H  = 20;     // horizontal padding inside description box
const DESC_TOP        = 270;    // distance from TOP of screen (increase = lower)

// CTA bottom text
const CTA_FONT_SIZE = 25;       // "Swipe Right to Learn More" size
const ARROW_SIZE    = 40;       // arrow size

const FULL_TEXT = 'Hello there!\nWelcome to\nSwiper!';

// Animated Arrow 
function AnimatedArrow() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  return (
    <Animated.Text style={[styles.arrow, { transform: [{ translateX }] }]}>→</Animated.Text>
  );
}

// Screen
export default function IntroScreen() {
  const fontsLoaded = useAppFonts();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const foxBounce = useRef(new Animated.Value(0)).current;
  const ctaFade   = useRef(new Animated.Value(0)).current;
  const dragX     = useRef(new Animated.Value(0)).current; // follows finger during swipe

  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone]       = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(foxBounce, { toValue: 0,   duration: 700, useNativeDriver: true }),
      ])
    ).start();

    const startDelay = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayedText(FULL_TEXT.slice(0, i));
        if (i >= FULL_TEXT.length) {
          clearInterval(interval);
          setTypingDone(true);
          Animated.timing(ctaFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
      }, 55);
      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(startDelay);
  }, []);

  // Swipe right anywhere on screen to go to card-demo
  // dragX follows the finger so user can see the swipe happening
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        // Screen follows finger at 40% speed so swipe is visible
        if (gesture.dx > 0) {
          dragX.setValue(gesture.dx * 0.4);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 80) {
          // Finish sliding off screen then navigate
          Animated.timing(dragX, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => router.replace('/onboarding/card-demo'));
        } else {
          // Snap back if not swiped far enough
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.warmMelon, COLORS.apricotBlush, COLORS.peachyCream]}
      style={styles.gradient}
      {...panResponder.panHandlers}
    >
      {/* Content slides with finger */}
      <Animated.View style={[styles.absoluteLayer, { opacity: fadeAnim, transform: [{ translateX: dragX }] }]}>

        {/* ── Fox — absolutely positioned ── */}
        <Animated.View
          style={[
            styles.foxContainer,
            {
              left: FOX_X,
              top: FOX_Y,
              transform: [{ translateY: foxBounce }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/swiper.png')}
            style={{ width: FOX_SIZE, height: FOX_SIZE, resizeMode: 'contain' }}
          />
        </Animated.View>

        {/* ── Speech Bubble — absolutely positioned, circular ── */}
        <View
          style={[
            styles.speechBubble,
            {
              left: BUBBLE_X,
              top: BUBBLE_Y,
              width: BUBBLE_WIDTH,
              height: BUBBLE_HEIGHT,
              borderRadius: BUBBLE_HEIGHT / 2, // makes it fully oval/circular
            },
          ]}
        >
          <Text style={[styles.speechText, { fontSize: BUBBLE_FONT_SIZE }]}>
            {displayedText}
            {!typingDone && <Text style={styles.cursor}>|</Text>}
          </Text>
          {/* Small circular tail at bottom-left */}
          <View style={styles.tailDot1} />
          <View style={styles.tailDot2} />
          <View style={styles.tailDot3} />
        </View>

        {/* ── Description Card — absolutely positioned ── */}
        <View
          style={[
            styles.descCard,
            {
              top: DESC_TOP,
              width: DESC_WIDTH as any,
              height: DESC_HEIGHT,
              paddingVertical: DESC_PADDING_V,
              paddingHorizontal: DESC_PADDING_H,
              alignSelf: 'center',
              left: (SCREEN_WIDTH - parseFloat(DESC_WIDTH) / 100 * SCREEN_WIDTH) / 2,
            },
          ]}
        >
          <Text style={[styles.descText, { fontSize: DESC_FONT_SIZE }]}>
            Swiper is your personal campus event companion! Tell us your
            interests, swipe yes or no on events, and we'll build your schedule
            automatically. Connect with other students going to the same events,
            earn badges, and never miss what matters at UF, all in one place.
          </Text>
        </View>

      </Animated.View>

      {/* ── CTA pinned to bottom ── */}
      <Animated.View style={[styles.ctaWrapper, { opacity: ctaFade }]}>
        <TouchableOpacity
          style={styles.ctaRow}
          onPress={() => router.replace('/onboarding/card-demo')}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctaText, { fontSize: CTA_FONT_SIZE }]}>
            Swipe Right to Learn More
          </Text>
          <AnimatedArrow />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

// Styles 
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  // Full screen absolute layer for positioned elements
  absoluteLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Fox
  foxContainer: {
    position: 'absolute',
  },

  // Circular speech bubble
  speechBubble: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  speechText: {
    fontFamily: FONTS.heading,
    color: COLORS.softCobalt,
    textAlign: 'center',
    lineHeight: 26,
  },
  cursor: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    color: COLORS.softCobalt,
  },

  // Circular bubble tail dots (like a comic speech bubble)
  tailDot1: {
    position: 'absolute',
    bottom: -14,
    left: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
  },
  tailDot2: {
    position: 'absolute',
    bottom: -24,
    left: 14,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.deepNavy,
  },
  tailDot3: {
    position: 'absolute',
    bottom: -32,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.deepNavy,
  },

  // Description card
  descCard: {
    position: 'absolute',
    backgroundColor: COLORS.warmMelon,
    borderRadius: 24,
  },
  descText: {
    fontFamily: FONTS.body,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
  },

  // CTA
  ctaWrapper: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    fontFamily: FONTS.heading,
    color: COLORS.mutedSapphire,
  },
  arrow: {
    fontFamily: FONTS.heading,
    fontSize: ARROW_SIZE,
    color: COLORS.mutedSapphire,
  },
});