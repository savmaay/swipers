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
import AdminTabBar from './AdminTabBar';

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

// ── Admin Profile Screen ─────────────────────────────────────────────────────

export default function AdminProfileScreen() {
  const router = useRouter();
  const fontsLoaded = useAppFonts();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsEditing(false);
      };
    }, [])
  );

  const [profile, setProfile] = useState({
    organizationName: 'Society of PC Building',
    bio: 'We are a student organization at UF.',
    selectedAvatar: 'owl' as AvatarKey,
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setIsEditing(false); }, 800);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topIconHeader}>
        {/* Tapping the icon navigates back to the main admin screen while keeping the tab bar */}
        <TouchableOpacity onPress={() => router.push('/(admin-tabs)')}>
          <Ionicons name="person-circle-outline" size={36} color={COLORS.ghostBlue} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isEditing ? styles.cardEditing : styles.cardView]}>

            {!isEditing && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.pillBtn} onPress={() => setIsEditing(true)}>
                  <Text style={styles.pillText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.title, isEditing && styles.titleEditing]}>
              {isEditing ? 'Edit Your Profile' : 'Your Organization'}
            </Text>

            <View style={styles.avatarSection}>
              <View style={[styles.avatarCircleFrame, isEditing && styles.avatarFrameEditing]}>
                <Image source={AVATAR_MAP[profile.selectedAvatar]} style={styles.largeAvatar} />
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Organization Name</Text>
                <TextInput
                  style={[styles.input, isEditing ? styles.inputEditing : styles.disabledInput]}
                  value={profile.organizationName}
                  editable={isEditing}
                  onChangeText={val => setProfile({ ...profile, organizationName: val })}
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

          {/* Extra space so content clears the tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Tab Bar (always visible at bottom) ────────────────────────── */}
      <AdminTabBar />
    </View>
  );
}

// ── Styles (identical to profile.tsx) ────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.mutedSapphire },
  topIconHeader: { paddingTop: 60, paddingRight: 25, alignItems: 'flex-end' },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },

  card: {
    width: '100%',
    maxWidth: 380,
    marginTop: 60,
    borderRadius: 35,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardView: { backgroundColor: COLORS.ghostBlue },
  cardEditing: { backgroundColor: '#FFFFFF', marginTop: 5 },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  pillBtn: { backgroundColor: COLORS.mutedSapphire, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 15 },
  pillText: { color: '#fff', fontSize: 10, fontFamily: FONTS.body, fontWeight: '700' },

  title: { fontFamily: FONTS.heading, fontSize: 34, color: COLORS.deepNavy, textAlign: 'center', marginVertical: 10 },
  titleEditing: { color: COLORS.mutedSapphire },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircleFrame: { width: 125, height: 125, borderRadius: 65, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: COLORS.periwinkleMist },
  avatarFrameEditing: { borderColor: COLORS.softCobalt, elevation: 4 },
  largeAvatar: { width: 90, height: 90, resizeMode: 'contain' },

  form: { width: '100%' },
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

  doneBtn: { backgroundColor: COLORS.mutedSapphire, width: '90%', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },
});
