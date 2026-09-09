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

export default function ForgotPasswordScreen() {
  const { setCurrentScreen } = useApp();

  const [contact, setContact] = useState('');
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Enter code & new password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    const trimmed = contact.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter your registered mobile number or email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      Alert.alert(
        'Code Dispatched',
        `A 6-digit verification code was sent to ${trimmed}. (Demo code: 123456)`
      );
    }, 1200);
  };

  const handleResetPassword = () => {
    const sanitizedCode = resetCode.trim();
    if (!sanitizedCode || sanitizedCode.length !== 6 || !/^\d+$/.test(sanitizedCode)) {
      Alert.alert('Validation Error', 'Please enter the valid 6-digit reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Your password has been reset successfully. Please sign in.', [
        { text: 'OK', onPress: () => setCurrentScreen('Login') },
      ]);
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
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
            <Text style={styles.title}>
              {step === 1 ? 'Reset Credentials' : 'Set New Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Enter your mobile number or email to receive a recovery code'
                : 'Enter the 6-digit code and create your new secure password'}
            </Text>
          </View>

          {/* Step 1: Request Code */}
          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number or Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9876543210 or user@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={contact}
                  onChangeText={setContact}
                />
              </View>

              <CustomButton
                title="Send Recovery Code"
                onPress={handleSendCode}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            /* Step 2: Verification & New Password */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code (OTP)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={resetCode}
                  onChangeText={setResetCode}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password / PIN</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <CustomButton
                title="Save & Update Password"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendCode}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>Resend recovery code</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer Back Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('Login')}
              activeOpacity={0.7}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>← Back to Login</Text>
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
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: 34,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
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
  submitBtn: {
    marginTop: SPACING.sm,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  resendText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
});