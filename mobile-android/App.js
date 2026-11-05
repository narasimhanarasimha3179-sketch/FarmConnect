// FarmConnect Enterprise Connected Agriculture & Trade OS
// Complete source code bundling all verified modules
// PHASE 0: Baseline & Forensic System Architecture
// PHASE 1: Professional Project Foundation – Design Tokens, Reusable UI & Error Context
// PHASE 2: Authentication & Role Management – 4 Real Roles (Farmer, Buyer, Seller, Admin)

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import { theme, colors, typography, spacing } from './src/theme';
import {
  Button,
  Input,
  Card,
  LoadingIndicator,
  EmptyState,
  Badge,
  Header,
} from './src/components/common';
import { NotificationProvider, useNotification } from './src/context/NotificationContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import validators from './src/utils/validation';
import env from './src/config/env';
import logger from './src/services/logger';

// Auth & Role Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import FarmerDashboardScreen from './src/screens/farmer/FarmerDashboardScreen';
import FarmerProfileModal from './src/screens/farmer/FarmerProfileModal';
import BuyerDashboardScreen from './src/screens/buyer/BuyerDashboardScreen';
import SellerDashboardScreen from './src/screens/seller/SellerDashboardScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import ProfileScreen from './src/screens/common/ProfileScreen';

// Phase 1 Foundation Showcase Component (Preserved & Accessible)
function FoundationShowcase({ onBackToAuth }) {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handlePhoneChange = (val) => {
    setPhone(val);
    if (!val) setPhoneError(null);
    else if (!validators.isValidIndianPhone(val)) {
      setPhoneError('Please enter a valid 10-digit Indian phone (starts with 6-9)');
    } else setPhoneError(null);
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) setEmailError(null);
    else if (!validators.isValidEmail(val)) {
      setEmailError('Please enter a valid email address');
    } else setEmailError(null);
  };

  const handleTestNotifications = (type) => {
    if (type === 'success') showSuccess('Profile updated successfully!', 'Farmer Verified');
    else if (type === 'error') showError('Unable to sync mandi prices. Please retry.', 'Network Alert');
    else if (type === 'warning') showWarning('Rain expected in your taluk within 24 hours.', 'Weather Advisory');
    else showInfo('New MSP rates announced for Rabi season.', 'Government Update');
  };

  const toggleLoadingDemo = () => {
    setIsLoadingDemo(true);
    setTimeout(() => {
      setIsLoadingDemo(false);
      showSuccess('Data loaded cleanly through normalized API service!', 'Connected');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Foundation Showcase"
        subtitle={`Smart Agri OS • ${env.ENVIRONMENT_NAME.toUpperCase()} • ${env.APP_VERSION}`}
        onBack={onBackToAuth}
        rightAction={<Badge label="PHASE 1" variant="farmer" size="sm" />}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.baselineCard}>
          <Text style={styles.baselineText}>🌱 FarmConnect Operational OS Loaded</Text>
          <Text style={styles.baselineSubtext}>
            Preserved baseline statement. Foundation design tokens, 4-role authentication, and database active.
          </Text>
          <View style={styles.rolesRow}>
            <Badge label="Farmer" variant="farmer" />
            <Badge label="Buyer" variant="buyer" />
            <Badge label="Seller" variant="seller" />
            <Badge label="Admin" variant="admin" />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>📋 Form Validation & Input System</Text>
          <Input
            label="Mobile Number (India)"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            error={phoneError}
            helperText="10-digit Indian mobile number for OTP login"
          />
          <Input
            label="Email Address"
            placeholder="farmer@farmconnect.org"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            error={emailError}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>🔔 Notification & Alert Engine</Text>
          <View style={styles.buttonGrid}>
            <Button title="✓ Success" variant="primary" size="sm" onPress={() => handleTestNotifications('success')} style={styles.gridBtn} />
            <Button title="⚠ Weather" variant="secondary" size="sm" onPress={() => handleTestNotifications('warning')} style={styles.gridBtn} />
            <Button title="✕ Error" variant="danger" size="sm" onPress={() => handleTestNotifications('error')} style={styles.gridBtn} />
            <Button title="ℹ Mandi" variant="outline" size="sm" onPress={() => handleTestNotifications('info')} style={styles.gridBtn} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>⏳ Loading Indicators & Empty States</Text>
          {isLoadingDemo ? (
            <LoadingIndicator message="Connecting to Agricultural Data Gateway..." />
          ) : (
            <View>
              <Button title="Simulate Network Request" variant="primary" onPress={toggleLoadingDemo} style={styles.demoBtn} />
              <EmptyState icon="🌾" title="Phase 1 Foundation Active" description="Phase 2 Authentication is ready to explore." />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Master Application Routing Controller
function MainApp() {
  const { isAuthenticated, role, user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot' | 'showcase'
  const [inProfile, setInProfile] = useState(false);

  // If user is authenticated, route to their role dashboard
  if (isAuthenticated && user) {
    if (inProfile) {
      if (role === 'FARMER') {
        return <FarmerProfileModal onBack={() => setInProfile(false)} />;
      }
      return <ProfileScreen onBack={() => setInProfile(false)} />;
    }

    switch (role) {
      case 'FARMER':
        return <FarmerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
      case 'BUYER':
        return <BuyerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
      case 'SELLER':
        return <SellerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
      case 'ADMIN':
        return <AdminDashboardScreen onOpenProfile={() => setInProfile(true)} />;
      default:
        return <FarmerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
    }
  }

  // If user is viewing the Phase 1 Foundation Showcase
  if (authView === 'showcase') {
    return <FoundationShowcase onBackToAuth={() => setAuthView('login')} />;
  }

  // Unauthenticated Navigation Stack
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🌱 FarmConnect OS</Text>
        <TouchableOpacity onPress={() => setAuthView('showcase')} style={styles.showcaseBtn}>
          <Text style={styles.showcaseText}>Design System</Text>
        </TouchableOpacity>
      </View>

      {authView === 'login' && (
        <LoginScreen
          onNavigateRegister={() => setAuthView('register')}
          onNavigateForgot={() => setAuthView('forgot')}
        />
      )}

      {authView === 'register' && (
        <RegisterScreen onNavigateLogin={() => setAuthView('login')} />
      )}

      {authView === 'forgot' && (
        <ForgotPasswordScreen onNavigateLogin={() => setAuthView('login')} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : spacing.sm,
  },
  topBarTitle: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  showcaseBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  showcaseText: {
    color: colors.textInverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  scrollContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  baselineCard: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  baselineText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  baselineSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.normal,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridBtn: {
    flex: 1,
    minWidth: '45%',
  },
  demoBtn: {
    marginBottom: spacing.md,
  },
});
