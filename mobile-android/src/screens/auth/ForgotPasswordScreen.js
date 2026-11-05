// FarmConnect Password Recovery & Reset Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Input, Card } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import validators from '../../utils/validation';

export default function ForgotPasswordScreen({ onNavigateLogin }) {
  const { forgotPassword, resetPassword } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [step, setStep] = useState(1); // 1 = Request code, 2 = Verify code & set new password
  const [identifier, setIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!validators.isRequired(identifier)) {
      showError('Please enter your registered email or phone', 'Required Field');
      return;
    }

    setIsLoading(true);
    const res = await forgotPassword(identifier);
    setIsLoading(false);

    if (res.success) {
      if (res.data && res.data.recovery_code) {
        setResetCode(res.data.recovery_code);
        showSuccess(`Code sent: ${res.data.recovery_code}`, 'Recovery OTP Generated');
      } else {
        showSuccess('If the account exists, an OTP has been sent.', 'Code Sent');
      }
      setStep(2);
    } else {
      showError(res.message, 'Failed');
    }
  };

  const handleReset = async () => {
    if (!resetCode || !newPassword) {
      showError('Please enter both the reset code and your new password.', 'Required Fields');
      return;
    }

    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters.', 'Weak Password');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(identifier, resetCode, newPassword);
    setIsLoading(false);

    if (res.success) {
      showSuccess('Your password has been reset. Please sign in.', 'Password Updated');
      onNavigateLogin();
    } else {
      showError(res.message || 'Reset failed', 'Error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your registered phone or email to receive a 6-digit recovery code.'
            : 'Enter the 6-digit verification code and your new password.'}
        </Text>

        {step === 1 ? (
          <View>
            <Input
              label="Registered Email or Mobile Number"
              placeholder="e.g. 9845012345 or ramesh@farm.org"
              value={identifier}
              onChangeText={setIdentifier}
            />
            <Button
              title="Send Verification Code"
              onPress={handleRequestCode}
              loading={isLoading}
              variant="primary"
              size="lg"
            />
          </View>
        ) : (
          <View>
            <Input
              label="6-Digit Verification Code"
              placeholder="e.g. 123456"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="numeric"
            />
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Button
              title="Reset Password & Sign In"
              onPress={handleReset}
              loading={isLoading}
              variant="primary"
              size="lg"
            />
          </View>
        )}

        <TouchableOpacity onPress={onNavigateLogin} style={styles.backRow}>
          <Text style={styles.backLink}>← Back to Sign In</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: 2,
    lineHeight: typography.lineHeights.normal,
  },
  backRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backLink: {
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
});
