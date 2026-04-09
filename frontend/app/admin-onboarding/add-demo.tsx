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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPEECH_TEXT = 'Fill out all event\ninfo and save!';

// Swiper Speech Bubble (bottom right) 
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
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.swiperRow}>
      {/* Circular bubble on left, dots trail bottom-right toward swiper */}
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

      {/* Swiper on right */}
      <Animated.View style={{ transform: [{ translateY: foxBounce }], flexShrink: 0 }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={styles.foxImage}
        />
      </Animated.View>
    </View>
  );
}

//  Screen 
export default function AdminAddDemoScreen() {
  const fontsLoaded = useAppFonts();

  // Demo form values — pre-filled to show how it looks
  const [eventName, setEventName]     = useState('SWE Study Session');
  const [date, setDate]               = useState('03/20/2026');
  const [time, setTime]               = useState('4:00 PM');
  const [location, setLocation]       = useState('Marston Science Library');
  const [description, setDescription] = useState('SWE Study Session');
  const [interests, setInterests]     = useState('Study, Social');

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.periwinkleMist, '#9BBDE0', COLORS.periwinkleMist]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>Add Events</Text>

          {/* Form card */}
          <View style={styles.formCard}>

            <Text style={styles.fieldLabel}>Name of Event</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholderTextColor={COLORS.warmMelon}
            />

            <View style={styles.rowFields}>
              <View style={{ flex: 1.4, marginRight: 10 }}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholderTextColor={COLORS.warmMelon}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholderTextColor={COLORS.blueTonedSlate}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.warmMelon}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor={COLORS.warmMelon}
            />

            <Text style={styles.fieldLabel}>Interests (Select all that apply)</Text>
            <TextInput
              style={styles.input}
              value={interests}
              onChangeText={setInterests}
              placeholderTextColor={COLORS.warmMelon}
            />

            {/* All Done button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.replace('/admin-onboarding/dashboard-edit')}
              activeOpacity={0.85}
            >
              <Text style={styles.doneButtonText}>All Done!</Text>
            </TouchableOpacity>
          </View>


          {/* Swiper speech bubble at bottom */}
          <SwiperSpeech />

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },

  title: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.dustyTangerine,
    textDecorationLine: 'underline',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Form
  formCard: {
    width: '100%',
    backgroundColor: COLORS.apricotBlush,
    borderRadius: 20,
    padding: 16,
    gap: 4,
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.deepNavy,
    marginBottom: 2,
    marginTop: 8,
    opacity: 0.7,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.deepNavy,
    borderWidth: 1,
    borderColor: 'rgba(197,212,245,0.4)',
  },
  textArea: {
    height: 56,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
  },
  doneButton: {
    backgroundColor: COLORS.mutedSapphire,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontFamily: FONTS.body,
    fontSize: 17,
    color: COLORS.ghostBlue,
    letterSpacing: 0.5,
  },

 
  // Swiper speech bubble
  swiperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    gap: 6,
    marginTop: 8,
  },
  bubbleContainer: { flex: 1 },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 60,
  },
  speechText: {
    fontFamily: FONTS.heading,
    fontSize: SCREEN_HEIGHT * 0.02,
    color: COLORS.softCobalt,
    textAlign: 'center',
    lineHeight: 24,
  },
  cursor: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.softCobalt },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
    alignItems: 'flex-end',
  },
  tailDot1: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#fff', 
    borderWidth: 2.5, 
    borderColor: COLORS.deepNavy,
    bottom: 60,
    right: -30,
  },
  tailDot2: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#fff', 
    borderWidth: 2, 
    borderColor: COLORS.deepNavy,
    bottom: 55,
    right: -30, 
  },
  tailDot3: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy,
    bottom: 50,
    right: -30,
  },
  foxImage: {
    width: SCREEN_HEIGHT * 0.18,
    height: SCREEN_HEIGHT * 0.18,
    resizeMode: 'contain',
    marginBottom: -4,
    bottom: -40,
  },
});