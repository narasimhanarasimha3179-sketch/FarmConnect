import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { useApp } from '../services/AppContext';
import BottomNav from '../components/BottomNav';
import SplashScreen from '../screens/auth/SplashScreen';
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

  // Handle splash state first
  if (currentScreen === 'Splash') {
    return <SplashScreen />;
  }

  // Handle temporary placeholder for Onboarding/Auth steps
  if (currentScreen === 'Onboarding' || currentScreen === 'Login' || currentScreen === 'Register') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>🔐</Text>
          <Text style={styles.placeholderTitle}>Authentication Gateway</Text>
          <Text style={styles.placeholderSubtitle}>Preparing Step 15: Onboarding & Auth Modules</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <ScreenPlaceholder
            icon="🌾"
            title="FarmConnect Dashboard"
            subtitle="Weather advisories, Mandi trends, and farm alerts"
          />
        );
      case 'Scanner':
        return (
          <ScreenPlaceholder
            icon="📷"
            title="AI Crop Disease Scanner"
            subtitle="Center infected leaf to receive instant diagnosis & treatments"
          />
        );
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