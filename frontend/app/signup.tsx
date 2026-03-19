import React, { useState, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

export default function SignupScreen() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // errorState can be: 'none' | 'empty' | 'exists' | 'short' | 'admin'
  const [errorState, setErrorState] = useState<string>('none');

  const passwordRef = useRef<RNTextInput>(null);
  const fontsLoaded = useAppFonts();

  const handleRegister = async () => {
    // 1. Check for empty fields (Invalid Entry)
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorState('empty');
      return;
    }

    // 2. Check password length
    if (password.length < 8) {
      setErrorState('short');
      return;
    }

    setLoading(true);
    setErrorState('none');

    try {
      // API call simulation
      await new Promise((res) => setTimeout(res, 1500));
      
      if (isAdmin) {
        setErrorState('admin'); 
      } else if (email === 'exists@test.com') {
        setErrorState('exists'); 
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setErrorState('exists');
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
            
            <Image
              source={require('../assets/images/swiper.png')}
              style={styles.mascot}
            />

            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create an account to continue!</Text>

            {/* Full Name Field */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.blueTonedSlate}
                value={fullName}
                onChangeText={(val) => { setFullName(val); setErrorState('none'); }}
              />
              <Ionicons name="eye-off-outline" size={18} color="transparent" />
            </View>

            {/* Email Field */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full email"
                placeholderTextColor={COLORS.blueTonedSlate}
                value={email}
                onChangeText={(val) => { setEmail(val); setErrorState('none'); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Ionicons name="eye-off-outline" size={18} color="transparent" />
            </View>

            {/* Password Field */}
            <Text style={styles.label}>Set Password (Min 8 Characters)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Enter a password"
                placeholderTextColor={COLORS.blueTonedSlate}
                value={password}
                onChangeText={(val) => { setPassword(val); setErrorState('none'); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={COLORS.blueTonedSlate}
                />
              </TouchableOpacity>
            </View>

            {/* Admin Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => { setIsAdmin(!isAdmin); setErrorState('none'); }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                {isAdmin && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.adminLabel}>Please check this is you are an admin</Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* ── Dynamic Error Messages ── */}
            {errorState !== 'none' && (
              <View style={styles.errorBox}>
                
                {errorState === 'empty' && (
                  <View style={styles.centeredError}>
                    <Text style={styles.errorTextBold}>INVALID ENTRY</Text>
                    <Text style={styles.errorTextRegular}>Please fill in all fields to continue.</Text>
                  </View>
                )}

                {errorState === 'exists' && (
                  <Text style={styles.errorTextBold}>
                    You already have an account click "Login"
                  </Text>
                )}
                
                {errorState === 'short' && (
                  <View style={styles.centeredError}>
                    <Text style={styles.errorTextBold}>Your password must be at least 8 characters.</Text>
                    <Text style={styles.errorTextRegular}>Please try again.</Text>
                  </View>
                )}

                {errorState === 'admin' && (
                  <View style={styles.centeredError}>
                    <Text style={styles.errorTextBold}>Sorry, the system does not recognize you as admin.</Text>
                    <Text style={styles.errorTextRegular}>
                      Please try again or contact <Text style={styles.underline}>HELP</Text>
                    </Text>
                  </View>
                )}
              </View>
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
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(244, 245, 251, 0.65)',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#2E3148',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  mascot: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 5,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.softCobalt,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.softCobalt,
    marginBottom: 4,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 212, 245, 0.6)',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.deepNavy,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
    marginBottom: 25,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.mutedSapphire,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.mutedSapphire,
  },
  adminLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.mutedSapphire,
  },
  registerButton: {
    backgroundColor: COLORS.mutedSapphire,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.mutedSapphire,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonText: {
    fontFamily: FONTS.body,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loginText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.blueTonedSlate,
  },
  loginLink: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.mutedSapphire,
    fontWeight: '700',
  },
  errorBox: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  centeredError: {
    alignItems: 'center',
  },
  errorTextBold: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  errorTextRegular: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 2,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});