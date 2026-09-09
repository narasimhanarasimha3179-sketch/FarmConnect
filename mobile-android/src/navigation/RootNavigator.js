import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { useApp } from '../services/AppContext';
import BottomNav from '../components/BottomNav';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CameraScannerScreen from '../screens/camera/CameraScannerScreen';
import MandiIntelligenceScreen from '../screens/dashboard/MandiIntelligenceScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { COLORS } from '../constants/theme';

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
        return <MarketplaceScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <MandiIntelligenceScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
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
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});