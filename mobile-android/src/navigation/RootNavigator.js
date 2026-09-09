import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { useApp } from '../services/AppContext';
import BottomNav from '../components/BottomNav';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CameraScannerScreen from '../screens/camera/CameraScannerScreen';
import MandiIntelligenceScreen from '../screens/dashboard/MandiIntelligenceScreen';
import { COLORS } from '../constants/theme';

function ScreenPlaceholder({ title, subtitle, icon }) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderIcon}>{icon}</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function RootNavigator() {
  const { currentScreen, activeTab } = useApp();

  // 1. Initial splash / bootstrap check
  if (currentScreen === 'Splash') {
    return <SplashScreen />;
  }

  // 2. Authentication flow screens
  if (currentScreen === 'Onboarding') {
    return <OnboardingScreen />;
  }

  if (currentScreen === 'Login') {
    return <LoginScreen />;
  }

  if (currentScreen === 'Register') {
    return <RegisterScreen />;
  }

  if (currentScreen === 'ForgotPassword') {
    return <ForgotPasswordScreen />;
  }

  // 3. Main tab-based views
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <MandiIntelligenceScreen />;
      case 'Scanner':
        return <CameraScannerScreen />;
      case 'Marketplace':
        return (
          <ScreenPlaceholder
            icon="🛒"
            title="Farmer Crop Marketplace"
            subtitle="Browse live harvest lots and place competitive bids"
          />
        );
      case 'Profile':
        return (
          <ScreenPlaceholder
            icon="👤"
            title="User Profile & Settings"
            subtitle="Role verification, language selection, and scan records"
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌱 FarmConnect</Text>
      </View>
      <View style={styles.content}>{renderActiveScreen()}</View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});