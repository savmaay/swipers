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
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';


// Updated Map with your new assets
const AVATAR_MAP = {
  cat: require('../../assets/images/avatar_cat.png'),
  dog: require('../../assets/images/avatar_dog.png'),
  owl: require('../../assets/images/avatar_owl.png'),
  fox: require('../../assets/images/avatar_fox.png'),
  bunny: require('../../assets/images/avatar_bunny.png'),
  gator: require('../../assets/images/avatar_gator.png'),
};


type AvatarKey = keyof typeof AVATAR_MAP;


export default function CreateProfileScreen() {
  const [name, setName] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [major, setMajor] = useState<string>('');
  const [bio, setBio] = useState<string>('');
 
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>('cat');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);


  const fontsLoaded = useAppFonts();


  const handleAllDone = async () => {
    if (!name.trim() || !year.trim() || !major.trim() || !bio.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      router.push('/onboarding/interests');
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
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


            {/* Large Preview Circle */}
            <View style={styles.avatarDisplayContainer}>
              <View style={styles.avatarCircleFrame}>
                <Image
                  source={AVATAR_MAP[selectedAvatar]}
                  style={styles.largeAvatar}
                />
              </View>
            </View>


            {/* Inputs */}
            <View style={styles.row}>
              <View style={[styles.fieldColumn, { flex: 2.5, marginRight: 12 }]}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={COLORS.blueTonedSlate}
                  value={name}
                  onChangeText={(val) => { setName(val); setError(false); }}
                />
              </View>
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Year"
                  placeholderTextColor={COLORS.blueTonedSlate}
                  keyboardType="numeric"
                  value={year}
                  onChangeText={(val) => { setYear(val); setError(false); }}
                />
              </View>
            </View>


            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Engineering"
              placeholderTextColor={COLORS.blueTonedSlate}
              value={major}
              onChangeText={(val) => { setMajor(val); setError(false); }}
            />


            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself!"
              placeholderTextColor={COLORS.blueTonedSlate}
              multiline
              value={bio}
              onChangeText={(val) => { setBio(val); setError(false); }}
            />


            {/* Horizontal Avatar Selector */}
            <Text style={styles.pickerTitle}>Choose your avatar!</Text>
            <View style={styles.scrollWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {(Object.keys(AVATAR_MAP) as AvatarKey[]).map((key) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => { setSelectedAvatar(key); setError(false); }}
                    activeOpacity={0.7}
                    style={[
                      styles.avatarBox,
                      selectedAvatar === key && styles.selectedBox
                    ]}
                  >
                    <Image source={AVATAR_MAP[key]} style={styles.optionImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>


            <TouchableOpacity
              style={styles.button}
              onPress={handleAllDone}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>All Done!</Text>
              )}
            </TouchableOpacity>


            {error && (
              <Text style={styles.errorText}>Please fill out the correct fields</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
  avatarDisplayContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircleFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C5D4F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  largeAvatar: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
  },
  row: { flexDirection: 'row' },
  fieldColumn: { marginBottom: 12 },
  label: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.softCobalt,
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.deepNavy,
    borderWidth: 1,
    borderColor: 'rgba(197, 212, 245, 0.4)',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  pickerTitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  scrollWrapper: {
    marginBottom: 25,
    height: 85,
  },
  pickerScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
    gap: 12, // Space between avatars
  },
  avatarBox: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 212, 245, 0.6)',
  },
  selectedBox: {
    borderWidth: 3,
    borderColor: COLORS.deepNavy,
    backgroundColor: '#F0F4FF',
  },
  optionImage: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#5C6BC0',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.body,
    fontWeight: '700',
  },
  errorText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
  },
});
