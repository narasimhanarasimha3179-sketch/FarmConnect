// FarmConnect Production Login Screen
// High-contrast, touch-optimized Android login for Farmers, Buyers, Sellers, and Admins

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Input, Card, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import validators from '../../utils/validation';

export default function LoginScreen({ onNavigateRegister, onNavigateForgot }) {
  const { login, isLoading, authError } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleLogin = async () => {
    let valid = true;
    if (!validators.isRequired(identifier)) {
      setIdentifierError('Phone number or email is required');
      valid = false;
    } else {
      setIdentifierError(null);
    }

    if (!validators.isRequired(password)) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    const res = await login(identifier, password);
    if (res.success) {
      showSuccess(`Welcome back, ${res.user.name}!`, `Logged in as ${res.user.role}`);
    } else {
      showError(res.message, 'Login Failed');
    }
  };

  // Quick auto-fill helpers for testing the 4 verified roles in real database
  const fillRole = (role) => {
    if (role === 'FARMER') {
      setIdentifier('ramesh.farmer@example.com');
      setPassword('NewFarmerPassword456');
    } else if (role === 'BUYER') {
      setIdentifier('kiran.buyer@example.com');
      setPassword('BuyerPassword123');
    } else if (role === 'SELLER') {
      setIdentifier('cauvery.seller@example.com');
      setPassword('SellerPassword123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin@farmconnect.org');
      setPassword('AdminSuperPassword123');
    }
    setIdentifierError(null);
    setPasswordError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <Text style={styles.appTitle}>🌱 FarmConnect</Text>
        <Text style={styles.tagline}>Smart Agricultural Products & Market Assistance</Text>
      </View>

      <Card style={styles.loginCard}>
        <Text style={styles.cardTitle}>Sign In to Your Account</Text>
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

        {authError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {authError}</Text>
          </View>
        ) : null}

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateRegister} accessibilityRole="button">
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Role Fill Shortcuts for Testing Real Roles */}
      <Card style={styles.demoCard}>
        <Text style={styles.demoTitle}>⚡ Quick Role Login (Verified SQLite Accounts)</Text>
        <Text style={styles.demoSubtitle}>Tap any role to prefill real credentials from the SQLite database:</Text>
        <View style={styles.roleGrid}>
          <TouchableOpacity style={styles.roleTile} onPress={() => fillRole('FARMER')}>
            <Badge label="Farmer" variant="farmer" />
            <Text style={styles.roleSub}>Ramesh Patil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleTile} onPress={() => fillRole('BUYER')}>
            <Badge label="Buyer" variant="buyer" />
            <Text style={styles.roleSub}>Kiran Wholesales</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleTile} onPress={() => fillRole('SELLER')}>
            <Badge label="Seller" variant="seller" />
            <Text style={styles.roleSub}>Cauvery Agri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleTile} onPress={() => fillRole('ADMIN')}>
            <Badge label="Admin" variant="admin" />
            <Text style={styles.roleSub}>System Admin</Text>
          </TouchableOpacity>
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
  },
});
