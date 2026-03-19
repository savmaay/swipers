import React, { useState } from 'react';
import { useRef } from 'react';
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

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const passwordRef = useRef<RNTextInput>(null);

  const fontsLoaded = useAppFonts();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);

    try {
      // TODO: Replace with your real auth API call
      // const response = await fetch('https://swipers.onrender.com/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!response.ok) throw new Error('Account not found');
      // const data = await response.json();
      // router.replace('/(tabs)');

      // --- Simulated login for development (remove when API is ready) ---
      await new Promise((res) => setTimeout(res, 1000));
      throw new Error('Account not found');
    } catch {
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
          {/* ── Glass Card ── */}
          <View style={styles.card}>

            {/* Fox Mascot */}
            <Image
              source={require('../assets/images/swiper.png')}
              style={styles.mascot}
            />

            {/* Title */}
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your email and password to log in</Text>

            {/* Email Field — no eye icon */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.blueTonedSlate}
                value={email}
                onChangeText={(val) => { setEmail(val); setError(false); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field — with eye toggle */}
<Text style={styles.label}>Password</Text>
<View style={styles.inputWrapper}>
  <TextInput
    ref={passwordRef}
    style={styles.input}
    placeholder="Enter your password"
    placeholderTextColor={COLORS.blueTonedSlate}
    value={password}
    onChangeText={(val) => { setPassword(val); setError(false); }}
    secureTextEntry={!showPassword}
    autoCapitalize="none"
    autoCorrect={false}
    autoComplete="off"
    textContentType="oneTimeCode"
  />
  <TouchableOpacity onPress={() => {
    setShowPassword(!showPassword);
    setTimeout(() => passwordRef.current?.focus(), 10);
  }}>
    <Ionicons
      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
      size={18}
      color={COLORS.blueTonedSlate}
    />
  </TouchableOpacity>
</View>

            {/* Remember Me + Forgot Password */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotText}>Forgot Password ?</Text>
              </TouchableOpacity>
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>ERROR ACCOUNT NOT FOUND</Text>
                <Text style={styles.errorSub}>
                  Please try again or click "Forgot Password?"
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(244, 245, 251, 0.55)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    shadowColor: '#2E3148',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  // Mascot
  mascot: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: -15,
    marginTop: -30,
    resizeMode: 'contain',
  },

  // Typography
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.softCobalt,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.softCobalt,
    marginBottom: 4,
    marginLeft: 2,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(197, 212, 245, 0.6)',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.deepNavy,
  },

  // Remember me / Forgot password row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: COLORS.softCobalt,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.mutedSapphire,
    borderColor: COLORS.mutedSapphire,
  },
  rememberText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.softCobalt,
  },
  forgotText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.mutedSapphire,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    backgroundColor: COLORS.mutedSapphire,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.mutedSapphire,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: FONTS.body,
    fontSize: 20,
    color: COLORS.ghostBlue,
    letterSpacing: 0.5,
    marginTop: -3,
    marginBottom: -3,
  },

  // Sign Up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  signupText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.blueTonedSlate,
  },
  signupLink: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.mutedSapphire,
    fontWeight: '700',
  },

  // Error messages
  errorBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorSub: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 5,
  },
});