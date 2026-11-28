// FarmConnect Production Login Screen
// High-contrast, touch-optimized Android login for Farmers, Buyers, Sellers, and Admins

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Input, Card, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import validators from '../../utils/validation';

export default function LoginScreen({ onNavigateRegister, onNavigateForgot }) {
  const { login, isLoading, authError, setAuthError } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const executeLogin = async (idToUse, pwToUse) => {
    const cleanId = (idToUse || '').trim();
    const cleanPw = (pwToUse || '').trim();

    let valid = true;
    if (!validators.isRequired(cleanId)) {
      setIdentifierError('Phone number or email is required');
      valid = false;
    } else {
      setIdentifierError(null);
    }

    if (!validators.isRequired(cleanPw)) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    const res = await login(cleanId, cleanPw);
    if (res.success) {
      showSuccess(`Welcome back, ${res.user.name}!`, `Logged in as ${res.user.role}`);
    } else {
      showError(res.message, 'Login Failed');
    }
  };

  const handleLogin = () => {
    executeLogin(identifier, password);
  };

  // Quick auto-fill & optional 1-tap instant login for the 4 verified roles
  const fillRole = (role, autoSubmit = false) => {
    let id = '';
    let pw = '';
    if (role === 'FARMER') {
      id = 'ramesh.farmer@example.com';
      pw = 'FarmerPassword123';
    } else if (role === 'BUYER') {
      id = 'kiran.buyer@example.com';
      pw = 'BuyerPassword123';
    } else if (role === 'SELLER') {
      id = 'cauvery.seller@example.com';
      pw = 'SellerPassword123';
    } else if (role === 'ADMIN') {
      id = 'admin@farmconnect.org';
      pw = 'AdminSuperPassword123';
    }
    setIdentifier(id);
    setPassword(pw);
    setIdentifierError(null);
    setPasswordError(null);
    if (setAuthError) setAuthError(null);

    if (autoSubmit) {
      executeLogin(id, pw);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <Text style={styles.appTitle}>🌱 {t('app_title')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>

      <Card style={styles.loginCard}>
        <Text style={styles.cardTitle}>{t('sign_in')}</Text>
        <Text style={styles.cardSubtitle}>Enter your registered Indian phone number or email</Text>

        <Input
          label="Mobile Number or Email"
          placeholder="e.g. 9845012345 or user@farm.org"
          value={identifier}
          onChangeText={(val) => {
            setIdentifier(val);
            if (identifierError) setIdentifierError(null);
          }}
          keyboardType="email-address"
          error={identifierError}
        />

        <Input
          label="Password"
          placeholder="Enter your secure password"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError(null);
          }}
          secureTextEntry
          error={passwordError}
        />

        <View style={styles.forgotRow}>
          <TouchableOpacity onPress={onNavigateForgot} accessibilityRole="button">
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          variant="primary"
          size="lg"
          style={styles.signInBtn}
        />

        {/* Quick Role Access for Seamless Demo & Testing */}
        <View style={styles.quickRoleBox}>
          <Text style={styles.quickRoleLabel}>⚡ Quick 1-Tap Demo Role Access:</Text>
          <View style={styles.quickRoleRow}>
            <TouchableOpacity style={[styles.quickRoleBtn, { borderColor: colors.primary }]} onPress={() => fillRole('FARMER', true)}>
              <Text style={styles.quickRoleBtnText}>👨‍🌾 Farmer (Ramesh)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickRoleBtn, { borderColor: '#0284c7' }]} onPress={() => fillRole('BUYER', true)}>
              <Text style={styles.quickRoleBtnText}>🛒 Buyer (Kiran)</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickRoleRow}>
            <TouchableOpacity style={[styles.quickRoleBtn, { borderColor: '#d97706' }]} onPress={() => fillRole('SELLER', true)}>
              <Text style={styles.quickRoleBtnText}>🏪 Seller (Cauvery)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickRoleBtn, { borderColor: '#dc2626' }]} onPress={() => fillRole('ADMIN', true)}>
              <Text style={styles.quickRoleBtnText}>🛡️ Super Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {authError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {authError}</Text>
          </View>
        ) : null}

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>New to FarmConnect? </Text>
          <TouchableOpacity onPress={onNavigateRegister} accessibilityRole="button">
            <Text style={styles.registerLink}>Create your account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityTrustRow}>
          <Text style={styles.securityTrustText}>🔒 256-Bit SSL Encrypted Agricultural Network</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerArea: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  appTitle: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loginCard: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: 2,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryLight,
    fontWeight: typography.weights.semiBold,
  },
  signInBtn: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    backgroundColor: colors.errorBg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  registerPrompt: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.sizes.sm,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
  },
  demoCard: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleTile: {
    alignItems: 'center',
    padding: spacing.xs,
  },
  roleSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  instantBtn: {
    marginTop: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  instantBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  securityTrustRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  securityTrustText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  quickRoleBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  quickRoleLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  quickRoleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  quickRoleBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRoleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});
