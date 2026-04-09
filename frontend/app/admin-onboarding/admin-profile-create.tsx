//Sample code for testing

import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

// Avatar options 
const AVATAR_MAP = {
  cat:   require('../../assets/images/avatar_cat.png'),
  dog:   require('../../assets/images/avatar_dog.png'),
  owl:   require('../../assets/images/avatar_owl.png'),
  fox:   require('../../assets/images/avatar_fox.png'),
  bunny: require('../../assets/images/avatar_bunny.png'),
  gator: require('../../assets/images/avatar_gator.png'),
};
type AvatarKey = keyof typeof AVATAR_MAP;

// Screen 
export default function AdminProfileCreateScreen() {
  const fontsLoaded = useAppFonts();
  const [name, setName]                     = useState('');
  const [orgName, setOrgName]               = useState('');
  const [role, setRole]                     = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>('fox');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(false);

  const handleDone = async () => {
    if (!name.trim() || !orgName.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    // TODO: save admin profile to backend
    // await fetch(`${API_BASE_URL}/api/auth/update-profile`, { ... });

    setTimeout(() => {
      setLoading(false);
      router.replace('/(admin-tabs)'); 
    }, 800);
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#A3B8EE', '#C5D4F5', '#F4A07E']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Your Profile</Text>

            {/* Avatar display */}
            <View style={styles.avatarDisplayContainer}>
              <View style={styles.avatarCircleFrame}>
                <Image source={AVATAR_MAP[selectedAvatar]} style={styles.largeAvatar} />
              </View>
            </View>

            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.blueTonedSlate}
              value={name}
              onChangeText={(v) => { setName(v); setError(false); }}
            />

            {/* Organization */}
            <Text style={styles.label}>Organization / Club Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Society of Women Engineers"
              placeholderTextColor={COLORS.blueTonedSlate}
              value={orgName}
              onChangeText={(v) => { setOrgName(v); setError(false); }}
            />

            {/* Role */}
            <Text style={styles.label}>Your Role <Text style={styles.optional}>(Optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. President, Event Coordinator"
              placeholderTextColor={COLORS.blueTonedSlate}
              value={role}
              onChangeText={setRole}
            />

            {/* Avatar picker */}
            <Text style={styles.pickerTitle}>Choose your avatar!</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarScroll}
            >
              {(Object.keys(AVATAR_MAP) as AvatarKey[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedAvatar(key)}
                  activeOpacity={0.7}
                  style={[styles.avatarBox, selectedAvatar === key && styles.avatarBoxSelected]}
                >
                  <Image source={AVATAR_MAP[key]} style={styles.avatarOption} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Done button */}
            <TouchableOpacity style={styles.button} onPress={handleDone} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>All Done!</Text>
              )}
            </TouchableOpacity>

            {error && (
              <Text style={styles.errorText}>Please fill out the required fields</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Styles 
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarDisplayContainer: { alignItems: 'center', marginBottom: 20 },
  avatarCircleFrame: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#C5D4F5',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  largeAvatar: { width: 75, height: 75, resizeMode: 'contain' },
  label: {
    fontFamily: FONTS.body, fontSize: 13,
    color: COLORS.softCobalt, marginBottom: 4, marginLeft: 4, marginTop: 12,
  },
  optional: { color: COLORS.blueTonedSlate, fontSize: 11 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12, padding: 12,
    fontSize: 15, fontFamily: FONTS.body,
    color: COLORS.deepNavy,
    borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)',
    height: 48,
  },
  pickerTitle: {
    fontFamily: FONTS.body, fontSize: 14,
    color: '#1565C0', textAlign: 'center',
    marginTop: 20, marginBottom: 10,
  },
  avatarScroll: {
    paddingHorizontal: 5, alignItems: 'center', gap: 12, marginBottom: 24,
  },
  avatarBox: {
    width: 70, height: 70, backgroundColor: '#fff',
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(197,212,245,0.6)',
  },
  avatarBoxSelected: {
    borderWidth: 3, borderColor: COLORS.deepNavy, backgroundColor: '#F0F4FF',
  },
  avatarOption: { width: 55, height: 55, resizeMode: 'contain' },
  button: {
    backgroundColor: '#5C6BC0', borderRadius: 15,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: '#5C6BC0', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontFamily: FONTS.body, fontWeight: '700' },
  errorText: {
    color: '#D32F2F', fontWeight: '700', fontSize: 13,
    textAlign: 'center', marginTop: 15,
  },
});