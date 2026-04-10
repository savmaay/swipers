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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPEECH_TEXT = 'Fill out all event\ninfo and save!';

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
        <Image source={require('../../assets/images/swiper.png')} style={styles.foxImage} />
      </Animated.View>
    </View>
  );
}

export default function AdminAddDemoScreen() {
  const fontsLoaded = useAppFonts();
  const params = useLocalSearchParams();

  // Pre-filled with defaults, but will use params if returning from interest picker
  const [eventName, setEventName]     = useState(params.title || 'SWE Study Session');
  const [date, setDate]               = useState(params.date || '03/20/2026');
  const [time, setTime]               = useState(params.time || '4:00 PM');
  const [location, setLocation]       = useState(params.location || 'Marston Science Library');
  const [description, setDescription] = useState(params.description || 'SWE Study Session');
  
  const [interests, setInterests]     = useState<string[]>(
    params.updatedInterests ? JSON.parse(params.updatedInterests as string) : ['Study', 'Social']
  );

  useEffect(() => {
    if (params.updatedInterests) {
      setInterests(JSON.parse(params.updatedInterests as string));
    }
  }, [params.updatedInterests]);

  const goToInterests = () => {
    const currentState = JSON.stringify({
      title: eventName,
      date,
      time,
      location,
      description
    });

    router.push({
      pathname: '/admin-onboarding/select-interests',
      params: { 
        onboardingParam: currentState,
        selected: JSON.stringify(interests),
        fromAdd: 'true' // Helpful tag to tell the picker where to return to
      }
    });
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={[COLORS.periwinkleMist, '#9BBDE0', COLORS.periwinkleMist]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Events</Text>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Name of Event</Text>
            <TextInput style={styles.input} value={eventName} onChangeText={setEventName} />

            <View style={styles.rowFields}>
              <View style={{ flex: 1.4, marginRight: 10 }}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput style={styles.input} value={date} onChangeText={setDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TextInput style={styles.input} value={time} onChangeText={setTime} />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.fieldLabel}>Interests</Text>
            <TouchableOpacity style={styles.interestPickerButton} onPress={goToInterests}>
              <Text style={styles.interestPickerText}>
                {interests.length > 0 ? interests.join(', ') : "Select Interests"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.deepNavy} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/admin-onboarding/dashboard-edit')}>
              <Text style={styles.doneButtonText}>All Done!</Text>
            </TouchableOpacity>
          </View>

          <SwiperSpeech />
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingTop: SCREEN_HEIGHT * 0.07, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  title: { fontFamily: FONTS.heading, fontSize: 36, color: COLORS.dustyTangerine, textDecorationLine: 'underline', marginBottom: 16, textAlign: 'center' },
  formCard: { width: '100%', backgroundColor: COLORS.apricotBlush, borderRadius: 20, padding: 16, gap: 4, marginBottom: 12 },
  fieldLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.deepNavy, marginBottom: 2, marginTop: 8, opacity: 0.7 },
  input: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy, borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)' },
  interestPickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)', marginTop: 2 },
  interestPickerText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.deepNavy, flex: 1 },
  textArea: { height: 56, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row' },
  doneButton: { backgroundColor: COLORS.mutedSapphire, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  doneButtonText: { fontFamily: FONTS.body, fontSize: 17, color: COLORS.ghostBlue, letterSpacing: 0.5 },
  swiperRow: { flexDirection: 'row', alignItems: 'flex-end', width: '100%', gap: 6, marginTop: 8 },
  bubbleContainer: { flex: 1 },
  speechBubble: { backgroundColor: '#fff', borderRadius: 999, borderWidth: 2.5, borderColor: COLORS.deepNavy, paddingVertical: 14, paddingHorizontal: 18, width: '100%', alignItems: 'center', justifyContent: 'center', bottom: 60 },
  speechText: { fontFamily: FONTS.heading, fontSize: SCREEN_HEIGHT * 0.02, color: COLORS.softCobalt, textAlign: 'center', lineHeight: 24 },
  cursor: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.softCobalt },
  dotsRow: { flexDirection: 'row', marginTop: 4, gap: 4, alignItems: 'flex-end' },
  tailDot1: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2.5, borderColor: COLORS.deepNavy, bottom: 60, right: -30 },
  tailDot2: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy, bottom: 55, right: -30 },
  tailDot3: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy, bottom: 50, right: -30 },
  foxImage: { width: SCREEN_HEIGHT * 0.18, height: SCREEN_HEIGHT * 0.18, resizeMode: 'contain', bottom: -40 },
});