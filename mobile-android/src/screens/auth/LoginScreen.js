import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../../services/AppContext';
import CustomButton from '../../components/CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function LoginScreen() {
  const { setCurrentScreen, login } = useApp();
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'

  // Input states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (authMethod === 'phone') {
      const sanitizedPhone = phone.trim();
      if (!sanitizedPhone || sanitizedPhone.length !== 10 || !/^\d+$/.test(sanitizedPhone)) {
        Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
        return;
      }
    } else {
      const sanitizedEmail = email.trim();
      if (!sanitizedEmail || !password) {
        Alert.alert('Validation Error', 'Please provide both email and password.');
        return;
      }
    }

    setLoading(true);
    // Simulating authentication handshake
    setTimeout(() => {
      setLoading(false);
      login({
        uid: `usr_${Date.now()}`,
        name: authMethod === 'phone' ? `Farmer (${phone.trim().slice(-4)})` : email.trim().split('@')[0],
        phone: authMethod === 'phone' ? phone.trim() : '',
        email: authMethod === 'email' ? email.trim() : '',
        role: 'farmer',
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your FarmConnect workspace</Text>
          </View>

          {/* Toggle Phone / Email */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, authMethod === 'phone' && styles.toggleBtnActive]}
              onPress={() => setAuthMethod('phone')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, authMethod === 'phone' && styles.toggleTextActive]}>
                Phone OTP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, authMethod === 'email' && styles.toggleBtnActive]}
              onPress={() => setAuthMethod('email')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, authMethod === 'email' && styles.toggleTextActive]}>
                Email & Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.form}>
            {authMethod === 'phone' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your account password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => setCurrentScreen('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password or PIN?</Text>
            </TouchableOpacity>

            <CustomButton
              title={authMethod === 'phone' ? 'Send Verification Code' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Register Redirect */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to FarmConnect?</Text>
            <TouchableOpacity
              onPress={() => setCurrentScreen('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoIcon: {
    fontSize: 34,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countryCode: {
    height: 48,
    width: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});