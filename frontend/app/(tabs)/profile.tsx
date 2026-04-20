import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Avatar Map ───────────────────────────────────────────────────────────────

const AVATAR_MAP = {
  cat:   require('../../assets/images/avatar_cat.png'),
  dog:   require('../../assets/images/avatar_dog.png'),
  owl:   require('../../assets/images/avatar_owl.png'),
  fox:   require('../../assets/images/avatar_fox.png'),
  bunny: require('../../assets/images/avatar_bunny.png'),
  gator: require('../../assets/images/avatar_gator.png'),
};
type AvatarKey = keyof typeof AVATAR_MAP;

// ── Interest Data ────────────────────────────────────────────────────────────

const INTEREST_ROWS = [
  [
    { id: '1',  label: 'Technology',       emoji: '💻' },
    { id: '2',  label: 'Art & Design',     emoji: '🎨' },
    { id: '3',  label: 'Music',            emoji: '🎵' },
  ],
  [
    { id: '4',  label: 'Sports',           emoji: '⚽' },
    { id: '5',  label: 'Science',          emoji: '🔬' },
    { id: '6',  label: 'Gaming',           emoji: '🎮' },
  ],
  [
    { id: '7',  label: 'Food & Cooking',   emoji: '🍕' },
    { id: '8',  label: 'Photography',      emoji: '📸' },
  ],
  [
    { id: '9',  label: 'Film & TV',        emoji: '🎬' },
    { id: '10', label: 'Literature',       emoji: '📚' },
    { id: '11', label: 'Fitness',          emoji: '💪' },
  ],
  [
    { id: '12', label: 'Travel',           emoji: '✈️' },
    { id: '13', label: 'Business',         emoji: '💼' },
  ],
  [
    { id: '14', label: 'Environment',      emoji: '🌿' },
    { id: '15', label: 'Fashion',          emoji: '👗' },
    { id: '16', label: 'Politics',         emoji: '🗳️' },
  ],
  [
    { id: '17', label: 'Health',           emoji: '🏥' },
    { id: '18', label: 'Engineering',      emoji: '⚙️' },
  ],
  [
    { id: '19', label: 'Dance',            emoji: '💃' },
    { id: '20', label: 'Community',        emoji: '🤝' },
    { id: '21', label: 'Language',         emoji: '🌍' },
  ],
  [
    { id: '22', label: 'Entrepreneurship', emoji: '🚀' },
    { id: '23', label: 'Psychology',       emoji: '🧠' },
  ],
];

const MIN_SELECTIONS = 3;
const SPEECH_TEXT = 'Edit your interests to get better matches! Select at least 3 interests.';

// ── Interest Editing Components ──────────────────────────────────────────────

function SwiperSpeech({ foxBounce }: { foxBounce: Animated.Value }) {
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(SPEECH_TEXT.slice(0, i));
      if (i >= SPEECH_TEXT.length) { clearInterval(interval); setTypingDone(true); }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={chipStyles.swiperRow}>
      <View style={chipStyles.bubbleContainer}>
        <View style={chipStyles.speechBubble}>
          <Text style={chipStyles.speechText}>
            {displayedText}
            {!typingDone && <Text style={chipStyles.cursor}>|</Text>}
          </Text>
        </View>
        <View style={[chipStyles.dotsRow, { alignSelf: 'flex-end', marginRight: 8 }]}>
          <View style={chipStyles.tailDot1} />
          <View style={chipStyles.tailDot2} />
          <View style={chipStyles.tailDot3} />
        </View>
      </View>
      <Animated.View style={{ transform: [{ translateY: foxBounce }], flexShrink: 0 }}>
        <Image
          source={require('../../assets/images/swiper.png')}
          style={{ width: 72, height: 72, resizeMode: 'contain', marginBottom: -4 }}
        />
      </Animated.View>
    </View>
  );
}

function InterestChip({
  item,
  selected,
  onPress,
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
        style={[chipStyles.chip, selected && chipStyles.chipSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={chipStyles.chipEmoji}>{item.emoji}</Text>
        <Text style={[chipStyles.chipLabel, selected && chipStyles.chipLabelSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Profile Screen ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const fontsLoaded = useAppFonts();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interestError, setInterestError] = useState(false);

  const foxBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isEditingInterests) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(foxBounce, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(foxBounce, { toValue: 0,  duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isEditingInterests]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsEditing(false);
        setIsEditingInterests(false);
        setInterestError(false);
      };
    }, [])
  );

  const [profile, setProfile] = useState({
    name: 'Becket',
    year: '2028',
    major: 'Computer Engineering',
    bio: 'I like cats',
    selectedAvatar: 'dog' as AvatarKey,
    foxCoins: 0,
  });

  const [selectedInterestLabels, setSelectedInterestLabels] = useState<string[]>(
    ['Gaming', 'Art & Design', 'Science']
  );
  useFocusEffect(
    useCallback(() => {
      const loadSavedInterests = async () => {
        const stored = await AsyncStorage.getItem('userInterests');

        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedInterestLabels(parsed);
          console.log('PROFILE LOADED INTERESTS:', parsed);
        }
      };

      loadSavedInterests();
    }, [])
  );

  const allInterests = INTEREST_ROWS.flat();

  const labelsToIds = (labels: string[]) =>
    allInterests.filter(i => labels.includes(i.label)).map(i => i.id);

  const [editingSelectedIds, setEditingSelectedIds] = useState<string[]>([]);

  const openInterestEdit = () => {
    setEditingSelectedIds(labelsToIds(selectedInterestLabels));
    setInterestError(false);
    setIsEditingInterests(true);
  };

  const toggleInterestId = (id: string) => {
    setEditingSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleInterestDone = async () => {
    if (editingSelectedIds.length < MIN_SELECTIONS) {
      setInterestError(true);
      return;
    }

    const newLabels = allInterests
      .filter(i => editingSelectedIds.includes(i.id))
      .map(i => i.label);

    setSelectedInterestLabels(newLabels);

    await AsyncStorage.setItem(
      'userInterests',
      JSON.stringify(newLabels)
    );

    console.log('PROFILE SAVED INTERESTS:', newLabels);

    setInterestError(false);
    setIsEditingInterests(false);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setIsEditing(false); }, 800);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topIconHeader}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Ionicons name="person-circle-outline" size={36} color={COLORS.ghostBlue} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {isEditingInterests ? (

            // ── Interest Editing ───────────────────────────────────────────

            <View style={styles.interestScreen}>
              <Text style={chipStyles.title}>What are you into?</Text>

              <SwiperSpeech foxBounce={foxBounce} />

              <Text style={chipStyles.counter}>
                {editingSelectedIds.length} selected
                {editingSelectedIds.length < MIN_SELECTIONS && (
                  <Text style={chipStyles.counterMin}>
                    {' '}(need {MIN_SELECTIONS - editingSelectedIds.length} more)
                  </Text>
                )}
                {editingSelectedIds.length >= MIN_SELECTIONS && (
                  <Text style={chipStyles.counterGood}> ✓</Text>
                )}
              </Text>

              {INTEREST_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} style={chipStyles.row}>
                  {row.map(item => (
                    <InterestChip
                      key={item.id}
                      item={item}
                      selected={editingSelectedIds.includes(item.id)}
                      onPress={() => toggleInterestId(item.id)}
                    />
                  ))}
                </View>
              ))}

              {interestError && (
                <Text style={styles.errorText}>
                  Please select at least {MIN_SELECTIONS} interests!
                </Text>
              )}

              <TouchableOpacity
                style={[styles.doneBtn, editingSelectedIds.length < MIN_SELECTIONS && styles.doneBtnDisabled]}
                onPress={handleInterestDone}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </View>

          ) : (

            // ── Profile ────────────────────────────────────────────────────

            <View style={[styles.card, isEditing ? styles.cardEditing : styles.cardView]}>

              {!isEditing && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.pillBtn} onPress={openInterestEdit}>
                    <Text style={styles.pillText}>Edit Interests</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pillBtn} onPress={() => setIsEditing(true)}>
                    <Text style={styles.pillText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.title, isEditing && styles.titleEditing]}>
                {isEditing ? 'Edit Your Profile' : 'Your Profile'}
              </Text>

              <View style={styles.avatarSection}>
                <View style={[styles.avatarCircleFrame, isEditing && styles.avatarFrameEditing]}>
                  <Image source={AVATAR_MAP[profile.selectedAvatar]} style={styles.largeAvatar} />
                </View>
                {!isEditing && <Text style={styles.coinText}>Fox Coins: {profile.foxCoins}</Text>}
              </View>

              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 2, marginRight: 12 }]}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                      value={profile.name}
                      editable={isEditing}
                      onChangeText={val => setProfile({ ...profile, name: val })}
                    />
                  </View>
                  <View style={[styles.field, { flex: 1.5 }]}>
                    <Text style={styles.label}>Year</Text>
                    <TextInput
                      style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                      value={profile.year}
                      editable={isEditing}
                      onChangeText={val => setProfile({ ...profile, year: val })}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Major</Text>
                  <TextInput
                    style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                    value={profile.major}
                    editable={isEditing}
                    onChangeText={val => setProfile({ ...profile, major: val })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, isEditing ? styles.inputEditing : styles.disabledInput]}
                    value={profile.bio}
                    multiline
                    editable={isEditing}
                    onChangeText={val => setProfile({ ...profile, bio: val })}
                  />
                </View>

                {!isEditing && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Interests</Text>
                    <View style={styles.interestPillsRow}>
                      {selectedInterestLabels.map(label => (
                        <View key={label} style={styles.interestReadPill}>
                          <Text style={styles.interestReadText}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* ── Profile Editing ──────────────────────────────────────── */}

              {isEditing && (
                <View style={styles.editControls}>
                  <Text style={styles.pickerTitle}>Choose your avatar!</Text>
                  <View style={styles.pickerWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {(Object.keys(AVATAR_MAP) as AvatarKey[]).map(key => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => setProfile({ ...profile, selectedAvatar: key })}
                          style={[styles.avatarBox, profile.selectedAvatar === key && styles.selectedBox]}
                        >
                          <Image source={AVATAR_MAP[key]} style={styles.optionImage} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <TouchableOpacity style={styles.doneBtn} onPress={handleSave} disabled={loading}>
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.doneBtnText}>Done</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}

            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const chipStyles = StyleSheet.create({
  title: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 8,
  },
  counter: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.softCobalt,
    marginBottom: 16,
  },
  counterMin: { color: COLORS.dustyTangerine },
  counterGood: { color: '#4CAF50', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  chipEmoji: { fontSize: 14 },
  chipLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.deepNavy,
  },
  chipLabelSelected: { color: COLORS.ghostBlue },
  swiperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    gap: 6,
    marginBottom: 12,
  },
  bubbleContainer: { flex: 1 },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  speechText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.softCobalt,
    textAlign: 'center',
    lineHeight: 20,
  },
  cursor: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.softCobalt },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
    alignItems: 'flex-end',
  },
  tailDot1: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: COLORS.deepNavy,
    left: 37, top: -20,
  },
  tailDot2: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy,
    left: 35, top: -29,
  },
  tailDot3: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.deepNavy,
    left: 35, top: -38,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.mutedSapphire },
  topIconHeader: { paddingTop: 60, paddingRight: 25, alignItems: 'flex-end' },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },

  interestScreen: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 4,
    marginTop: 20,
  },

  card: {
    width: '100%',
    maxWidth: 380,
    marginTop: 30,
    borderRadius: 35,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardView: { backgroundColor: COLORS.ghostBlue },
  cardEditing: { backgroundColor: '#FFFFFF', marginTop: 5 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pillBtn: { backgroundColor: COLORS.mutedSapphire, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 15 },
  pillText: { color: '#fff', fontSize: 10, fontFamily: FONTS.body, fontWeight: '700' },

  title: { fontFamily: FONTS.heading, fontSize: 34, color: COLORS.deepNavy, textAlign: 'center', marginVertical: 10 },
  titleEditing: { color: COLORS.mutedSapphire },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircleFrame: { width: 125, height: 125, borderRadius: 65, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: COLORS.periwinkleMist },
  avatarFrameEditing: { borderColor: COLORS.softCobalt, elevation: 4 },
  largeAvatar: { width: 90, height: 90, resizeMode: 'contain' },
  coinText: { marginTop: 10, fontFamily: FONTS.heading, color: COLORS.mutedSapphire, fontSize: 18 },

  form: { width: '100%' },
  row: { flexDirection: 'row' },
  field: { marginBottom: 15 },
  label: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.softCobalt, marginBottom: 4, marginLeft: 4, fontWeight: '600' },
  input: { borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.deepNavy, borderWidth: 1 },
  inputEditing: { backgroundColor: '#fff', borderColor: COLORS.mutedSapphire },
  disabledInput: { backgroundColor: 'rgba(200,210,240,0.3)', borderColor: 'transparent' },
  textArea: { height: 65, textAlignVertical: 'top' },

  interestPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  interestReadPill: {
    backgroundColor: COLORS.mutedSapphire,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  interestReadText: { color: '#fff', fontFamily: FONTS.body, fontSize: 12, fontWeight: '700' },

  editControls: { alignItems: 'center', width: '100%', marginTop: 5 },
  pickerTitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.mutedSapphire, marginBottom: 12, fontWeight: 'bold' },
  pickerWrapper: { height: 85, marginBottom: 20 },
  avatarBox: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 15, marginRight: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.periwinkleMist },
  selectedBox: { borderWidth: 3, borderColor: COLORS.mutedSapphire },
  optionImage: { width: 50, height: 50, resizeMode: 'contain' },

  doneBtn: { backgroundColor: COLORS.mutedSapphire, width: '90%', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  doneBtnDisabled: { opacity: 0.45 },
  doneBtnText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },

  errorText: { color: COLORS.error, fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
});