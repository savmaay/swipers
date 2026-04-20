import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/urls';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_SELECTIONS = 3;
const SWIPE_UP_THRESHOLD = -80;
const SPEECH_TEXT = 'Pick at least 3 interests\nso we can find the best\nevents for you!';

const FOX_SIZE     = SCREEN_HEIGHT * 0.14;  // relative so it scales on any phone
const FOX_X_OFFSET = 0;
const FOX_Y_OFFSET = 0;

const INTEREST_ROWS = [
  [
    { id: '1',  label: 'Technology',   emoji: '💻' },
    { id: '2',  label: 'Art & Design', emoji: '🎨' },
    { id: '3',  label: 'Music',        emoji: '🎵' },
  ],
  [
    { id: '4',  label: 'Sports',       emoji: '⚽' },
    { id: '5',  label: 'Science',      emoji: '🔬' },
    { id: '6',  label: 'Gaming',       emoji: '🎮' },
  ],
  [
    { id: '7',  label: 'Food & Cooking', emoji: '🍕' },
    { id: '8',  label: 'Photography',   emoji: '📸' },
  ],
  [
    { id: '9',  label: 'Film & TV',    emoji: '🎬' },
    { id: '10', label: 'Literature',   emoji: '📚' },
    { id: '11', label: 'Fitness',      emoji: '💪' },
  ],
  [
    { id: '12', label: 'Travel',       emoji: '✈️' },
    { id: '13', label: 'Business',     emoji: '💼' },
  ],
  [
    { id: '14', label: 'Environment',  emoji: '🌿' },
    { id: '15', label: 'Fashion',      emoji: '👗' },
    { id: '16', label: 'Politics',     emoji: '🗳️' },
  ],
  [
    { id: '17', label: 'Health',       emoji: '🏥' },
    { id: '18', label: 'Engineering',  emoji: '⚙️' },
  ],
  [
    { id: '19', label: 'Dance',        emoji: '💃' },
    { id: '20', label: 'Community',    emoji: '🤝' },
    { id: '21', label: 'Language',     emoji: '🌍' },
  ],
  [
    { id: '22', label: 'Entrepreneurship', emoji: '🚀' },
    { id: '23', label: 'Psychology',       emoji: '🧠' },
  ],
];

// Swiper Speech Bubble 
function SwiperSpeech() {
  const foxBounce = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -8, duration: 700, useNativeDriver: true }),
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
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.swiperRow}>
      <View style={styles.bubbleContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            {displayedText}
            {!typingDone && <Text style={styles.cursor}>|</Text>}
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
        marginLeft: FOX_X_OFFSET,
        marginTop: FOX_Y_OFFSET,
        flexShrink: 0,
      }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={{ width: FOX_SIZE, height: FOX_SIZE, resizeMode: 'contain', marginBottom: -4 }}
        />
      </Animated.View>
    </View>
  );
}

// Animated Up Arrow
function AnimatedUpArrow() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,  duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={[styles.upArrow, { transform: [{ translateY: anim }] }]}>
      ↑
    </Animated.Text>
  );
}

// Interest Chip 
function InterestChip({
  item, selected, onPress,
}: {
  item: { id: string; label: string; emoji: string };
  selected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Screen 
export default function InterestsScreen() {
  const params = useLocalSearchParams();
  const fontsLoaded  = useAppFonts();
  const [selected, setSelected] = useState<string[]>([]);
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const dragY        = useRef(new Animated.Value(0)).current; // follows finger during swipe
  const hasNavigated = useRef(false);
  const canContinueRef = useRef(false); 

  const [selectedCount, setSelectedCount] = useState(0);
  const canContinue = selectedCount >= MIN_SELECTIONS;

  useEffect(() => {
    canContinueRef.current = canContinue;
  }, [canContinue]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);


  const navigate = async () => {
    console.log('NAVIGATE STARTED');
    if (!canContinueRef.current || hasNavigated.current) return;
    hasNavigated.current = true;

    try {
    const token =
      (params.token as string) ||
      (await AsyncStorage.getItem('userToken'));
      const allInterests = INTEREST_ROWS.flat();
      const selectedLabels = selected
        .map(id => allInterests.find(item => item.id === id)?.label)
        .filter(Boolean);

      await AsyncStorage.setItem(
        'userInterests',
        JSON.stringify(selectedLabels)
      );

      await AsyncStorage.setItem('onboardingComplete', 'true');

      console.log('SELECTED IDS:', selected);
      console.log('LABELS:', selectedLabels);

      const verify = await AsyncStorage.getItem('userInterests');
      console.log('JUST SAVED:', verify);

      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({
            name: params.name,
            year: params.year,
            major: params.major,
            bio: params.bio,
            avatar: params.avatar,
            interests: selectedLabels,
            onboardingComplete: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
        }
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error("Network error:", error);
      alert("Could not connect to the server.");
      hasNavigated.current = false;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        canContinueRef.current &&
        gesture.dy < -10 &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx), 
      onPanResponderMove: (_, gesture) => {
        // Screen follows finger upward so user can see the swipe happening
        if (gesture.dy < 0) {
          dragY.setValue(gesture.dy * 0.4);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < SWIPE_UP_THRESHOLD) {
          // Finish sliding off screen then navigate
          Animated.timing(dragY, {
            toValue: -800,
            duration: 250,
            useNativeDriver: true,
          }).start(() => navigate());
        } else {
          // Snap back if not swiped far enough
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const toggleInterest = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      setSelectedCount(next.length);
      return next;
    });
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#B8CCEE', '#C5D4F5', '#D8E4F8']}
      style={styles.gradient}
    >
      {/* PanResponder on the whole screen */}
      <Animated.View
        style={[
          styles.wrapper,
          { opacity: fadeAnim, transform: [{ translateY: dragY }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What are you into?</Text>
          <SwiperSpeech />
          <Text style={styles.counter}>
            {selectedCount} selected
            {selectedCount < MIN_SELECTIONS && (
              <Text style={styles.counterMin}>
                {' '}(need {MIN_SELECTIONS - selectedCount} more)
              </Text>
            )}
            {selectedCount >= MIN_SELECTIONS && (
              <Text style={styles.counterGood}> ✓</Text>
            )}
          </Text>
        </View>

        {/* Chip Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {INTEREST_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <InterestChip
                  key={item.id}
                  item={item}
                  selected={selected.includes(item.id)}
                  onPress={() => {
                    console.log('CHIP PRESSED:', item.label);
                    toggleInterest(item.id);
                  }}
                />
              ))}
            </View>
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>

      </Animated.View>

      {/* Footer*/}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.continueDisabled]}
          onPress={navigate}
          activeOpacity={canContinue ? 0.85 : 1}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={
              canContinue
                ? ['#2E7D32', '#43A047']
                : ['rgba(46,49,72,0.35)', 'rgba(46,49,72,0.35)']
            }
            style={styles.continueGradient}
          >
            {canContinue ? (
              <Text style={styles.continueText}>Done</Text>
            ) : (
              <Text style={styles.continueText}>
                Select {MIN_SELECTIONS - selectedCount} more
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Styles 
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  wrapper: { flex: 1 },

  header: {
    paddingTop: SCREEN_HEIGHT * 0.07,  // relative so it fits any phone
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.033,   // relative font size
    color: COLORS.deepNavy,
    textAlign: 'center',
  },
  counter: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.softCobalt,
  },
  counterMin: { color: COLORS.dustyTangerine },
  counterGood: { color: '#4CAF50', fontSize: 16 },

  scrollContent: {
    paddingHorizontal: 12,             // less horizontal padding so chips don't overflow
    paddingTop: 8,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,                            // slightly tighter gap
    marginBottom: 6,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,             // less horizontal padding so text fits on small screens
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    gap: 5,
    shadowColor: COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipSelected: {
    backgroundColor: COLORS.mutedSapphire,
    borderColor: COLORS.mutedSapphire,
    shadowOpacity: 0.3,
    elevation: 5,
  },
  chipEmoji: { fontSize: 14 },         // slightly smaller emoji
  chipLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,                      // slightly smaller label
    color: COLORS.deepNavy,
  },
  chipLabelSelected: { color: COLORS.ghostBlue },

  swiperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    gap: 6,
  },
  bubbleContainer: { flex: 1 },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  speechText: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.018,   // relative so it fits on small screens
    color: COLORS.softCobalt,
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT * 0.026,
  },
  cursor: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.018,
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
    left: 37, top: -20,
  },
  tailDot2: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
      left: 35, top: -29,
  },
  tailDot3: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.deepNavy,
    left: 35, top: -38, 
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: SCREEN_HEIGHT * 0.05,  // relative bottom padding
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueDisabled: { opacity: 0.5 },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  swipeUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  continueText: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.022,   // relative font size
    color: '#fff',
    letterSpacing: 0.5,
  },
  upArrow: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.036,   // relative arrow size
    color: '#fff',
  },
});