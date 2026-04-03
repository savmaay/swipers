import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useRouter, useFocusEffect } from 'expo-router';

const AVATAR_MAP = {
  cat:   require('../../assets/images/avatar_cat.png'),
  dog:   require('../../assets/images/avatar_dog.png'),
  owl:   require('../../assets/images/avatar_owl.png'),
  fox:   require('../../assets/images/avatar_fox.png'),
  bunny: require('../../assets/images/avatar_bunny.png'),
  gator: require('../../assets/images/avatar_gator.png'),
};

type AvatarKey = keyof typeof AVATAR_MAP;

const INTEREST_OPTIONS = [
  'Hiking', 'Gaming', 'Cooking', 'Art', 'Music', 'Reading', 'Travel',
  'Coding', 'Sports', 'Movies', 'Dancing', 'Pets', 'Nature', 'Chess',
  'Anime', 'Yoga', 'Writing', 'Photography', 'Math', 'Crafts', 'Fitness'
];

export default function ProfileScreen() {
  const router = useRouter();
  const fontsLoaded = useAppFonts();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interestError, setInterestError] = useState(false);

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

  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Gaming', 'Art', 'Nature']);

  if (!fontsLoaded) return null;

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
    }, 800);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleInterestDone = () => {
    if (selectedInterests.length < 3) {
      setInterestError(true);
    } else {
      setInterestError(false);
      setIsEditingInterests(false);
    }
  };

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
          
          <View style={[
            styles.card, 
            isEditingInterests ? styles.interestCard : (isEditing ? styles.cardEditing : styles.cardView)
          ]}>
            
            {isEditingInterests ? (
              <View style={styles.interestContainer}>
                <Text style={styles.interestTitle}>Select at least 3 interests</Text>
                
                <View style={styles.interestGrid}>
                  {INTEREST_OPTIONS.map((item) => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        onPress={() => toggleInterest(item)}
                        style={[styles.interestPill, isSelected && styles.interestPillActive]}
                      >
                        <Text style={[styles.interestText, isSelected && styles.interestTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={handleInterestDone}>
                  <Text style={styles.doneBtnHeadingText}>Done</Text>
                </TouchableOpacity>

                {interestError && (
                  <Text style={styles.errorText}>Please make sure you select at least 3 interests!</Text>
                )}
              </View>
            ) : (
              <>
                {!isEditing && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.pillBtn} onPress={() => setIsEditingInterests(true)}>
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
                        onChangeText={(val) => setProfile({...profile, name: val})}
                      />
                    </View>
                    <View style={[styles.field, { flex: 1.5 }]}>
                      <Text style={styles.label}>Year</Text>
                      <TextInput
                        style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                        value={profile.year}
                        editable={isEditing}
                        onChangeText={(val) => setProfile({...profile, year: val})}
                      />
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Major</Text>
                    <TextInput
                      style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                      value={profile.major}
                      editable={isEditing}
                      onChangeText={(val) => setProfile({...profile, major: val})}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, isEditing ? styles.inputEditing : styles.disabledInput]}
                      value={profile.bio}
                      multiline
                      editable={isEditing}
                      onChangeText={(val) => setProfile({...profile, bio: val})}
                    />
                  </View>
                </View>

                {isEditing && (
                  <View style={styles.editControls}>
                    <Text style={styles.pickerTitle}>Choose your avatar!</Text>
                    <View style={styles.pickerWrapper}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(Object.keys(AVATAR_MAP) as AvatarKey[]).map((key) => (
                          <TouchableOpacity
                            key={key}
                            onPress={() => setProfile({...profile, selectedAvatar: key})}
                            style={[styles.avatarBox, profile.selectedAvatar === key && styles.selectedBox]}
                          >
                            <Image source={AVATAR_MAP[key]} style={styles.optionImage} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <TouchableOpacity style={styles.doneBtn} onPress={handleSave} disabled={loading}>
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.doneBtnHeadingText}>Done</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.mutedSapphire },
  topIconHeader: { paddingTop: 60, paddingRight: 25, alignItems: 'flex-end' },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  
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

  // Interest Editing
  interestCard: {
    backgroundColor: COLORS.apricotBlush,
    maxWidth: '100%',
    marginTop: 30,
    paddingHorizontal: 15,
  },
  interestContainer: { alignItems: 'center', width: '100%' },
  interestTitle: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: COLORS.skyIris,
    fontStyle: 'italic',
    marginBottom: 25,
    textAlign: 'center',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15, 
    rowGap: 30, 
    marginBottom: 30,
  },
  interestPill: {
    backgroundColor: COLORS.periwinkleMist,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: '29%', 
    alignItems: 'center',
  },
  interestPillActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.mutedSapphire },
  interestText: { color: '#fff', fontFamily: FONTS.body, fontWeight: 'bold', fontSize: 12 },
  interestTextActive: { color: COLORS.mutedSapphire },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: 'bold', marginTop: 12 },

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
  editControls: { alignItems: 'center', width: '100%', marginTop: 5 },
  pickerTitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.mutedSapphire, marginBottom: 12, fontWeight: 'bold' },
  pickerWrapper: { height: 85, marginBottom: 20 },
  avatarBox: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 15, marginRight: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.periwinkleMist },
  selectedBox: { borderWidth: 3, borderColor: COLORS.mutedSapphire },
  optionImage: { width: 50, height: 50, resizeMode: 'contain' },
  
  doneBtn: { backgroundColor: COLORS.mutedSapphire, width: '90%', padding: 16, borderRadius: 15, alignItems: 'center' },
  doneBtnHeadingText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },
});