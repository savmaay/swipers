import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sample current events 
const CURRENT_EVENTS = [
  { id: '1', title: 'SWE Picnic Social!', date: 'March 30th', time: '5:00 pm', location: 'Plaza of Americas' },
  { id: '2', title: 'Gator Club Study Session!', date: 'March 18th', time: '6:30 pm', location: 'Marston Library' },
  { id: '3', title: 'AI Club Info Session!', date: 'April 2nd', time: '1:00 pm', location: 'Malachowsky Hall' },
];

// Swiper speech bubble — bottom right layout 
function SwiperSpeech({ text }: { text: string }) {
  const foxBounce = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(foxBounce, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 45);
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
      <Animated.View style={{ transform: [{ translateY: foxBounce }], flexShrink: 0 }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={styles.foxImage}
        />
      </Animated.View>
    </View>
  );
}

// Animated arrow pointing toward pencil icon
function PencilArrow() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <Animated.View
      style={[styles.pencilArrowWrapper, { transform: [{ translateX }, { translateY }] }]}
    >
      <View style={styles.arrowShaft} />
      <View style={styles.arrowHead} />
    </Animated.View>
  );
}

// Current Event Card 
function CurrentEventCard({
  event,
  showArrow,
  onEdit,
}: {
  event: (typeof CURRENT_EVENTS)[0];
  showArrow: boolean;
  onEdit: (event: (typeof CURRENT_EVENTS)[0]) => void;
}) {
  return (
    <View style={styles.eventCard}>
      <TouchableOpacity style={styles.editIcon} onPress={() => onEdit(event)}>
        <Ionicons name="pencil-outline" size={20} color={COLORS.mutedSapphire} />
      </TouchableOpacity>

      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventDetail}>{event.date}</Text>
      <Text style={styles.eventDetail}>{event.time}</Text>
      <Text style={styles.eventDetail}>{event.location}</Text>

      {showArrow && (
        <View style={styles.pencilArrowContainer}>
          <PencilArrow />
        </View>
      )}
    </View>
  );
}

// Screen 
export default function AdminEditDemoScreen() {
  const fontsLoaded = useAppFonts();

  const handleEdit = (event: (typeof CURRENT_EVENTS)[0]) => {
  const query = `?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(event.date)}&time=${encodeURIComponent(event.time)}&location=${encodeURIComponent(event.location)}`;
  router.push(`/admin-onboarding/edit-demo-card${query}`);
};

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.periwinkleMist, '#9BBDE0', COLORS.periwinkleMist]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Current Events</Text>

        {CURRENT_EVENTS.map((event, index) => (
          <CurrentEventCard
            key={event.id}
            event={event}
            showArrow={index === 0}
            onEdit={handleEdit}
          />
        ))}

        <SwiperSpeech
          text={'These are your current\nevents, to edit them,\nclick the icon on the\ntop right of the card!'}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// Styles 
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    paddingTop: SCREEN_HEIGHT * 0.07,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.dustyTangerine,
    textDecorationLine: 'underline',
    marginBottom: 8,
    textAlign: 'center',
  },
  eventCard: {
    width: '100%',
    backgroundColor: COLORS.apricotBlush,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.mutedSapphire,
    position: 'relative',
  },
  editIcon: { position: 'absolute', top: 10, right: 12, padding: 4 },
  eventTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 4,
    paddingRight: 28,
  },
  eventDetail: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.deepNavy,
    textAlign: 'center',
  },
  pencilArrowContainer: { position: 'absolute', top: 20, right: 40 },
  pencilArrowWrapper: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  arrowShaft: {
    position: 'absolute',
    width: 3,
    height: 30,
    bottom: -38,
    left: -2,
    backgroundColor: COLORS.dustyTangerine,
    transform: [{ rotate: '45deg' }],
  },
  arrowHead: {
    position: 'absolute',
    top: 20,
    right: -10,
    width: 7,
    height: 30,
    left: 20,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: COLORS.dustyTangerine,
    transform: [{ rotate: '-120deg' }],
  },
  swiperRow: { flexDirection: 'row', alignItems: 'flex-end', width: '100%', gap: 6, marginTop: 4 },
  bubbleContainer: { flex: 1 },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 17,
    width: '115%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechText: { fontFamily: FONTS.heading, fontSize: SCREEN_HEIGHT * 0.018, color: COLORS.softCobalt, textAlign: 'center', lineHeight: 24 },
  cursor: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.softCobalt },
  dotsRow: { flexDirection: 'row', marginTop: 4, gap: 4, alignItems: 'flex-end' },
  tailDot1: { width: 12, height: 12, borderRadius: 6, right: -50, backgroundColor: '#fff', borderWidth: 2.5, borderColor: COLORS.deepNavy },
  tailDot2: { width: 9, height: 9, borderRadius: 5, right: -55, bottom: -5, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy },
  tailDot3: { width: 6, height: 6, borderRadius: 3, right: -60, bottom: -10, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy },
  foxImage: { width: SCREEN_HEIGHT * 0.2, height: SCREEN_HEIGHT * 0.2, resizeMode: 'contain', bottom: -160 },
});