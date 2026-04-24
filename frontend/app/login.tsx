import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '@/constants/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';

// ─── Forgot Password Modal ────────────────────────────────────────
function ForgotPasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [resetEmail, setResetEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setSent(false);
      setResetEmail('');
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      fadeAnim.setValue(0);
    }
  }, [visible]);

const handleSend = async () => {
    if (!resetEmail) return;
    setSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSending(false);
        setSent(true);
      } else {
        setSending(false);
        alert(data.msg || "Something went wrong. Is the email correct?");
      }
    } catch (e) {
      console.error("Connection Error:", e);
      setSending(false);
      alert("Network error. Please try again later.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalCard,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Stop press-through */}
          <TouchableOpacity activeOpacity={1}>

            {/* Close button */}
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.blueTonedSlate} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.modalIconWrapper}>
              <Ionicons name="lock-closed-outline" size={36} color={COLORS.mutedSapphire} />
            </View>

            {!sent ? (
              <>
                <Text style={styles.modalTitle}>Forgot Password?</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>

                {/* Email input */}
                <View style={styles.modalInputWrapper}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.blueTonedSlate}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Send button */}
                <TouchableOpacity
                  style={[styles.modalButton, !resetEmail && styles.modalButtonDisabled]}
                  onPress={handleSend}
                  disabled={!resetEmail || sending}
                  activeOpacity={0.85}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Success state */
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
                </View>
                <Text style={styles.modalTitle}>Link Sent!</Text>
                <Text style={styles.modalSubtitle}>
                  A password reset link has been sent to{'\n'}
                  <Text style={styles.emailHighlight}>{resetEmail}</Text>
                  {'\n'}Check your inbox and follow the instructions.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>Got it!</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail]               = useState<string>('');
  const [password, setPassword]         = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe]     = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading]           = useState<boolean>(false);
  const [error, setError]               = useState<boolean>(false);
  const [forgotVisible, setForgotVisible] = useState<boolean>(false);
  const passwordRef = useRef<any>(null);

  const fontsLoaded = useAppFonts();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        email, 
        password, 
        role: isAdmin ? 'admin' : 'member' 
      }),
      });

      const text = await response.text();
      console.log("SIGNUP RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { msg: text };
      }

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        setLoading(false);

        if (isAdmin) {
          router.replace('/(admin-tabs)');
        } else {
          router.replace('/(tabs)');
        }
      }else {
        setError(true);
        setLoading(false);
      }
    } catch (e) {
      console.error("Connection Error:", e);
      alert("Cannot connect to server. Check your Wi-Fi!");
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <>
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

              {/* Fox Mascot */}
              <Image
                source={require('../assets/images/swiper.png')}
                style={styles.mascot}
              />

              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Enter your email and password to log in</Text>

              {/* Email */}
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

              {/* Password */}
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
                  onPress={() => setIsAdmin(!isAdmin)}
                >
                  <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                    {isAdmin && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.rememberText}>Login as Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                {/* Forgot Password — opens modal */}
                <TouchableOpacity onPress={() => setForgotVisible(true)}>
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

              {/* Sign Up */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Error */}
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotVisible}
        onClose={() => setForgotVisible(false)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },

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
  mascot: {
    width: 120, height: 120,
    alignSelf: 'center',
    marginBottom: -14,
    resizeMode: 'contain',
    marginTop: -30,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 17,
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
    fontSize: 14,
    color: COLORS.deepNavy,
  },
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
    width: 16, height: 16,
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
    fontSize: 11,
    color: COLORS.softCobalt,
  },
  forgotText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.mutedSapphire,
    fontWeight: '600',
  },
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
    fontSize: 16,
    color: COLORS.ghostBlue,
    letterSpacing: 0.5,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  signupText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.blueTonedSlate,
  },
  signupLink: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mutedSapphire,
    fontWeight: '700',
  },
  errorBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46,49,72,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.ghostBlue,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    zIndex: 10,
  },
  modalIconWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  modalTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.blueTonedSlate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emailHighlight: {
    color: COLORS.mutedSapphire,
    fontWeight: '600',
  },
  modalInputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,212,245,0.6)',
  },
  modalInput: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.deepNavy,
  },
  modalButton: {
    backgroundColor: COLORS.mutedSapphire,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.mutedSapphire,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.ghostBlue,
    letterSpacing: 0.5,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
});
