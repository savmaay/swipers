import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// Nicole's screen 
//
// Fields to collect (from the Figma):
//   - Name
//   - Year (Freshman / Sophomore / Junior / Senior)
//   - Major
//   - Bio
//   - Avatar selection (Owl, Bunny, Cat, Dog — horizontal scroll)
//     Locked avatars: Fox (100pts), Gator (50pts)
//
// When the user finishes and taps Continue:
//   router.replace('/onboarding/interests');
//
// Shared imports already set up:
//   COLORS  → all app colors (@/constants/colors)
//   FONTS   → FONTS.heading (Agbalumo), FONTS.body (Itim)
//   useAppFonts() → call at top of component, return null until ready
//
// Background gradient to stay consistent with onboarding:
//   colors={[COLORS.periwinkleMist, COLORS.ghostBlue, COLORS.lilacHaze]}
// ─────────────────────────────────────────────────────────────────

export default function CreateProfileScreen() {
  const fontsLoaded = useAppFonts();

  // Sample state — Nicole can expand these
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.periwinkleMist, COLORS.ghostBlue, COLORS.lilacHaze]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a little about yourself 🦊</Text>

        {/* ── Sample fields — Nicole replaces/expands these ── */}

        <Text style={styles.label}>Name</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.blueTonedSlate}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>Year</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Freshman"
            placeholderTextColor={COLORS.blueTonedSlate}
            value={year}
            onChangeText={setYear}
          />
        </View>

        <Text style={styles.label}>Major</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Your major"
            placeholderTextColor={COLORS.blueTonedSlate}
            value={major}
            onChangeText={setMajor}
          />
        </View>

        <Text style={styles.label}>Bio</Text>
        <View style={[styles.inputWrapper, styles.bioWrapper]}>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={COLORS.blueTonedSlate}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        {/* TODO: Nicole adds avatar picker here */}
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>🐾 Avatar picker goes here</Text>
        </View>

        {/* Continue → goes to interests screen */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/onboarding/interests')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.mutedSapphire, COLORS.softCobalt]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    color: COLORS.deepNavy,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.blueTonedSlate,
    marginBottom: 28,
    textAlign: 'center',
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.softCobalt,
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginLeft: 2,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 212, 245, 0.6)',
  },
  input: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.deepNavy,
  },
  bioWrapper: {
    minHeight: 100,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  avatarPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(197,212,245,0.5)',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.blueTonedSlate,
  },
  continueButton: {
    width: SCREEN_WIDTH - 56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueText: {
    fontFamily: FONTS.body,
    fontSize: 17,
    color: COLORS.ghostBlue,
    letterSpacing: 0.5,
  },
});