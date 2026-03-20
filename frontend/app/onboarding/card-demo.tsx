import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH  = SCREEN_WIDTH * 0.74;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.38;

const FOX_SIZE    = 175;

// Slide 1 (left swipe demo) — fox bottom-RIGHT
const SLIDE1_FOX_MARGIN_RIGHT  = -20;
const SLIDE1_FOX_MARGIN_BOTTOM = -100;

// Slide 2 (right swipe demo) — fox bottom-LEFT
const SLIDE2_FOX_MARGIN_LEFT   = -20;
const SLIDE2_FOX_MARGIN_BOTTOM = -100;

const ARROW_SIZE   = 48;
const ARROW_OFFSET = 10;  


const SWIPE_THRESHOLD = 80;

const SLIDE_TEXTS = [
  'Swipe left on events you\nare not interested in or\npress the X button!',
  'Swipe right on events you\nare interested in or press\nthe heart button!',
];

const DEMO_CARDS = [
  { id: 1, title: 'SWE Picnic Social!', date: 'March 30th', time: '5:00 pm', location: 'Plaza of Americas', color: COLORS.apricotBlush },
  { id: 2, title: 'Hackathon Kickoff', date: 'April 5th', time: '10:00 am', location: 'Reitz Union', color: COLORS.periwinkleMist },
  { id: 3, title: 'Club Fair', date: 'April 12th', time: '12:00 pm', location: 'Turlington Plaza', color: COLORS.peachyCream },
];

// Animated Arrow
function AnimatedArrow({ direction, offset = 0 }: {
  direction: 'left' | 'right';
  offset?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'left' ? [0, -14] : [0, 14],
  });
  return (
    <Animated.Text style={[
      styles.arrow,
      { transform: [{ translateX }] },
      direction === 'left'
        ? { marginLeft: offset }   // push left arrow toward card (right)
        : { marginRight: offset }, // push right arrow toward card (left)
    ]}>
      {direction === 'left' ? '←' : '→'}
    </Animated.Text>
  );
}

// Swiper + Circular Speech Bubble
function SwiperSpeech({ text, isRightDemo, isActive }: {
  text: string;
  isRightDemo: boolean;
  isActive: boolean;
}) {
  const foxBounce = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    setDisplayedText('');
    setTypingDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(foxBounce, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (isRightDemo) {
    return (
      <View style={styles.swiperRow}>
        <Animated.View style={{
          transform: [{ translateY: foxBounce }],
          marginBottom: SLIDE2_FOX_MARGIN_BOTTOM,
          marginLeft: SLIDE2_FOX_MARGIN_LEFT,
          flexShrink: 0,
        }}>
          <Image
            source={require('../../assets/images/swiper.png')}
            style={{ width: FOX_SIZE, height: FOX_SIZE, resizeMode: 'contain' }}
          />
        </Animated.View>
        <View style={styles.bubbleContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {displayedText}
              {!typingDone && isActive && <Text style={styles.cursor}>|</Text>}
            </Text>
          </View>
          <View style={[styles.dotsRow, { alignSelf: 'flex-start', marginLeft: 8 }]}>
            <View style={styles.tailDot3} />
            <View style={styles.tailDot2} />
            <View style={styles.tailDot1} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.swiperRow}>
      <View style={styles.bubbleContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            {displayedText}
            {!typingDone && isActive && <Text style={styles.cursor}>|</Text>}
          </Text>
        </View>
        <View style={[styles.dotsRow, { alignSelf: 'flex-end', marginRight: 8 }]}>
          <View style={styles.tailDot1} />
          <View style={styles.tailDot2} />
          <View style={styles.tailDot3} />
        </View>
      </View>
      <Animated.View style={{
        transform: [{ translateY: foxBounce }],
        marginBottom: SLIDE1_FOX_MARGIN_BOTTOM,
        marginRight: SLIDE1_FOX_MARGIN_RIGHT,
        flexShrink: 0,
      }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={{ width: FOX_SIZE, height: FOX_SIZE, resizeMode: 'contain' }}
        />
      </Animated.View>
    </View>
  );
}

// Single Swipeable Card 
function SwipeCard({
  card, onSwipeLeft, onSwipeRight, isTop, index, triggerSwipe, allowedDirection,
}: {
  card: (typeof DEMO_CARDS)[0];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  index: number;
  triggerSwipe?: 'left' | 'right' | null;
  allowedDirection: 'left' | 'right';
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicator = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTop || !triggerSwipe) return;
    const toX = triggerSwipe === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      triggerSwipe === 'left' ? onSwipeLeft() : onSwipeRight();
    });
  }, [triggerSwipe]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderMove: (_, gesture) => {
        if (allowedDirection === 'left' && gesture.dx > 0) return;
        if (allowedDirection === 'right' && gesture.dx < 0) return;
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
        swipeIndicator.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (allowedDirection === 'left' && gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: gesture.dy },
            duration: 300, useNativeDriver: true,
          }).start(onSwipeLeft);
        } else if (allowedDirection === 'right' && gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: gesture.dy },
            duration: 300, useNativeDriver: true,
          }).start(onSwipeRight);
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
          Animated.spring(swipeIndicator, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });
  const likeOpacity = swipeIndicator.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = swipeIndicator.interpolate({ inputRange: [-60, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const scale = isTop ? 1 : 1 - index * 0.04;
  const translateY = isTop ? 0 : index * 10;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: card.color,
          transform: isTop
            ? [{ translateX: position.x }, { translateY: position.y }, { rotate }]
            : [{ scale }, { translateY }],
          zIndex: 10 - index,
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {isTop && (
        <>
          <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>💚 YES</Text>
          </Animated.View>
          <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>✕ NOPE</Text>
          </Animated.View>
        </>
      )}
      <Text style={styles.cardTitle}>{card.title}</Text>
      <View style={styles.cardDivider} />
      <Text style={styles.cardDetail}>📅  {card.date}</Text>
      <Text style={styles.cardDetail}>⏰  {card.time}</Text>
      <Text style={styles.cardDetail}>📍  {card.location}</Text>
    </Animated.View>
  );
}

// Demo Slide
function DemoSlide({ isRightDemo, onAdvance, slideIndex, isActive }: {
  isRightDemo: boolean;
  onAdvance: () => void;
  slideIndex: number;
  isActive: boolean;
}) {
  const [cards, setCards] = useState([...DEMO_CARDS]);
  const [triggerSwipe, setTriggerSwipe] = useState<'left' | 'right' | null>(null);
  const hasAdvanced = useRef(false);
  const allowedDirection = isRightDemo ? 'right' : 'left';

  const handleSwipeDone = useCallback(() => {
    setTriggerSwipe(null);
    setCards((prev) => {
      const next = [...prev];
      next.shift();
      return next.length === 0 ? [...DEMO_CARDS] : next;
    });
    if (!hasAdvanced.current) {
      hasAdvanced.current = true;
      setTimeout(() => onAdvance(), 350);
    }
  }, [onAdvance]);

  return (
    <View style={styles.slide}>
      <Text style={styles.slideTitle}>New Events</Text>

      <View style={styles.cardRow}>
        {/* Left arrow — only on slide 1, left side of card */}
        {!isRightDemo && (
          <View style={styles.sideArrow}>
            <AnimatedArrow direction="left" offset={ARROW_OFFSET} />
          </View>
        )}

        <View style={styles.cardStack}>
          {cards.slice(0, 3).map((card, index) => (
            <SwipeCard
              key={`${card.id}-${cards.length}`}
              card={card}
              isTop={index === 0}
              index={index}
              triggerSwipe={index === 0 ? triggerSwipe : null}
              allowedDirection={allowedDirection}
              onSwipeLeft={handleSwipeDone}
              onSwipeRight={handleSwipeDone}
            />
          ))}
        </View>

        {/* Right arrow — only on slide 2, right side of card */}
        {isRightDemo && (
          <View style={styles.sideArrow}>
            <AnimatedArrow direction="right" offset={ARROW_OFFSET} />
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.nopeButton, isRightDemo && styles.buttonDisabled]}
          onPress={() => !isRightDemo && setTriggerSwipe('left')}
          activeOpacity={isRightDemo ? 1 : 0.8}
        >
          <Text style={styles.nopeButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeButton, !isRightDemo && styles.buttonDisabled]}
          onPress={() => isRightDemo && setTriggerSwipe('right')}
          activeOpacity={isRightDemo ? 0.8 : 1}
        >
          <Text style={styles.likeButtonIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      <SwiperSpeech
        text={SLIDE_TEXTS[slideIndex]}
        isRightDemo={isRightDemo}
        isActive={isActive}
      />
    </View>
  );
}

// Main Screen
export default function CardDemoScreen() {
  const fontsLoaded = useAppFonts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSlideRef = useRef(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);

  const advanceSlide = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    if (currentSlideRef.current === 0) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        currentSlideRef.current = 1;
        setCurrentSlide(1);
        isTransitioning.current = false;
      });
    } else {
      router.replace('/onboarding/create-profile');
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.periwinkleMist, '#dce6fb', COLORS.periwinkleMist]}
      style={styles.container}
    >
      <Animated.View style={[styles.slidesRow, { transform: [{ translateX: slideAnim }] }]}>
        <DemoSlide
          isRightDemo={false}
          onAdvance={advanceSlide}
          slideIndex={0}
          isActive={currentSlide === 0}
        />
        <DemoSlide
          isRightDemo={true}
          onAdvance={advanceSlide}
          slideIndex={1}
          isActive={currentSlide === 1}
        />
      </Animated.View>
    </LinearGradient>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  slidesRow: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
    flex: 1,
    overflow: 'hidden',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.07,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },

  slideTitle: {
    fontFamily: FONTS.heading,
    fontSize: 40,
    color: COLORS.mutedSapphire,
    marginBottom: 16,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  sideArrow: {
    width: 65,            
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    flex: 1,
    height: CARD_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E3148',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDivider: {
    width: 60, height: 2,
    backgroundColor: COLORS.softCobalt,
    borderRadius: 1, marginBottom: 12, opacity: 0.4,
  },
  cardDetail: {
    fontFamily: FONTS.body,
    fontSize: 20,
    color: COLORS.mutedSapphire,
    marginBottom: 8,
  },

  likeStamp: {
    position: 'absolute', top: 16, left: 16,
    borderWidth: 3, borderColor: '#4CAF50', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    transform: [{ rotate: '-15deg' }],
  },
  likeStampText: { fontFamily: FONTS.heading, fontSize: 20, color: '#4CAF50' },
  nopeStamp: {
    position: 'absolute', top: 16, right: 16,
    borderWidth: 3, borderColor: '#F44336', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    transform: [{ rotate: '15deg' }],
  },
  nopeStampText: { fontFamily: FONTS.heading, fontSize: 20, color: '#F44336' },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 12,
  },
  nopeButton: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.deepNavy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 5,
  },
  nopeButtonText: { fontSize: 26, color: '#fff', fontWeight: '700' },
  likeButton: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  likeButtonIcon: { fontSize: 30, color: COLORS.dustyTangerine },
  buttonDisabled: { opacity: 0.35 },

  swiperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 8,
    gap: 6,
  },
  arrow: {
    fontFamily: FONTS.heading,
    fontSize: ARROW_SIZE,
    color: COLORS.mutedSapphire,
    marginBottom: 24,
    flexShrink: 0,
  },
  bubbleContainer: {
    flex: 1,
  },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    paddingVertical: 18,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.softCobalt,
    textAlign: 'center',
    lineHeight: 22,
  },
  cursor: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    color: COLORS.softCobalt,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
    alignItems: 'flex-end',
  },
  tailDot1: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2.5, borderColor: COLORS.deepNavy,
  },
  tailDot2: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
  },
  tailDot3: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
  },
});