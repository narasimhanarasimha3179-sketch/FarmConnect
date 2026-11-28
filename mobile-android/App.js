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
  LanguageSelector,
} from './src/components/common';
import { NotificationProvider, useNotification } from './src/context/NotificationContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
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

// FarmConnect 2.0 Public Storefront & Discovery Screens
import PublicHomeScreen from './src/screens/public/PublicHomeScreen';
import ProductCatalogScreen from './src/screens/ecommerce/ProductCatalogScreen';
import CropMarketplaceScreen from './src/screens/cropmarket/CropMarketplaceScreen';
import MandiPriceScreen from './src/screens/mandi/MandiPriceScreen';
import WeatherScreen from './src/screens/weather/WeatherScreen';
import AiAssistantScreen from './src/screens/ai/AiAssistantScreen';
import AgriScienceScreen from './src/screens/knowledge/AgriScienceScreen';
import GovernmentSchemesScreen from './src/screens/schemes/GovernmentSchemesScreen';
import CartModal from './src/screens/buyer/CartModal';

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

// Master Application Routing Controller — FarmConnect 2.0
function MainApp() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const { t } = useLanguage();
  const [publicView, setPublicView] = useState('home'); // 'home' | 'shop' | 'cropmarket' | 'mandi' | 'weather' | 'ai' | 'knowledge' | 'schemes' | 'login' | 'register' | 'forgot' | 'showcase'
  const [inProfile, setInProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(1);

  // EXPERIENCE B: Authenticated Role-Based Application (Isolated by Role)
  if (isAuthenticated && user) {
    let dashboardContent = null;
    if (inProfile) {
      if (role === 'FARMER') {
        dashboardContent = <FarmerProfileModal onBack={() => setInProfile(false)} />;
      } else {
        dashboardContent = <ProfileScreen onBack={() => setInProfile(false)} />;
      }
    } else {
      switch (role) {
        case 'FARMER':
          dashboardContent = <FarmerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
          break;
        case 'BUYER':
          dashboardContent = <BuyerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
          break;
        case 'SELLER':
          dashboardContent = <SellerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
          break;
        case 'ADMIN':
          dashboardContent = <AdminDashboardScreen onOpenProfile={() => setInProfile(true)} />;
          break;
        default:
          dashboardContent = <FarmerDashboardScreen onOpenProfile={() => setInProfile(true)} />;
      }
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.authTopBar}>
          <View style={styles.authTopLeft}>
            <Text style={styles.topBarTitle}>🌱 {t('app_title')}</Text>
            <Badge label={role} variant={role.toLowerCase()} size="sm" />
            <Text style={styles.authUserName} numberOfLines={1}>
              {user.name || 'Verified User'}
            </Text>
          </View>
          <View style={styles.authTopRight}>
            <LanguageSelector compact />
            <TouchableOpacity
              style={styles.profileNavBtn}
              onPress={() => setInProfile(!inProfile)}
            >
              <Text style={styles.profileNavBtnText}>{inProfile ? 'Dashboard' : '👤 Profile'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={logout}
            >
              <Text style={styles.signOutBtnText}>Sign Out ⎋</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          {dashboardContent}
        </View>
      </SafeAreaView>
    );
  }

  // EXPERIENCE A: Public FarmConnect Website & Storefront (Default for all visitors)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* 1. Public Homepage (Default Landing View) */}
      {publicView === 'home' && (
        <PublicHomeScreen
          onNavigateShop={(catQuery) => setPublicView('shop')}
          onNavigateCropMarket={() => setPublicView('cropmarket')}
          onNavigateMandi={() => setPublicView('mandi')}
          onNavigateWeather={() => setPublicView('weather')}
          onNavigateAi={() => setPublicView('ai')}
          onNavigateKnowledge={() => setPublicView('knowledge')}
          onNavigateSchemes={() => setPublicView('schemes')}
          onNavigateLogin={() => setPublicView('login')}
          onNavigateRegister={() => setPublicView('register')}
          onOpenCart={() => setShowCart(true)}
          cartCount={cartCount}
        />
      )}

      {/* 2. Public E-Commerce Store */}
      {publicView === 'shop' && (
        <ProductCatalogScreen
          onBack={() => setPublicView('home')}
          onOpenCart={() => setShowCart(true)}
        />
      )}

      {/* 3. Public Crop Marketplace */}
      {publicView === 'cropmarket' && (
        <CropMarketplaceScreen onBack={() => setPublicView('home')} />
      )}

      {/* 4. Public Live APMC Mandi Rates */}
      {publicView === 'mandi' && (
        <MandiPriceScreen onBack={() => setPublicView('home')} />
      )}

      {/* 5. Public Weather Sync & Alerts */}
      {publicView === 'weather' && (
        <WeatherScreen onBack={() => setPublicView('home')} />
      )}

      {/* 6. Public AI Agricultural Assistance */}
      {publicView === 'ai' && (
        <AiAssistantScreen onBack={() => setPublicView('home')} />
      )}

      {/* 7. Public Knowledge & Soil Science */}
      {publicView === 'knowledge' && (
        <AgriScienceScreen onBack={() => setPublicView('home')} />
      )}

      {/* 8. Public Government Schemes Hub */}
      {publicView === 'schemes' && (
        <GovernmentSchemesScreen onBack={() => setPublicView('home')} />
      )}

      {/* 9. Secure Sign In (No Demo Switchers) */}
      {publicView === 'login' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subPageHeader}>
            <TouchableOpacity onPress={() => setPublicView('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Return to Home</Text>
            </TouchableOpacity>
            <LanguageSelector compact />
          </View>
          <LoginScreen
            onNavigateRegister={() => setPublicView('register')}
            onNavigateForgot={() => setPublicView('forgot')}
          />
        </View>
      )}

      {/* 10. Public Account Registration */}
      {publicView === 'register' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subPageHeader}>
            <TouchableOpacity onPress={() => setPublicView('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Return to Home</Text>
            </TouchableOpacity>
            <LanguageSelector compact />
          </View>
          <RegisterScreen onNavigateLogin={() => setPublicView('login')} />
        </View>
      )}

      {/* 11. Password Recovery */}
      {publicView === 'forgot' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subPageHeader}>
            <TouchableOpacity onPress={() => setPublicView('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Return to Home</Text>
            </TouchableOpacity>
          </View>
          <ForgotPasswordScreen onNavigateLogin={() => setPublicView('login')} />
        </View>
      )}

      {/* 12. Foundation Design System Showcase (Preserved) */}
      {publicView === 'showcase' && (
        <FoundationShowcase onBackToAuth={() => setPublicView('home')} />
      )}

      {/* Global Shopping Cart & Multi-Process Checkout Modal */}
      <CartModal
        visible={showCart}
        onClose={() => setShowCart(false)}
        onOrderPlaced={() => {
          setShowCart(false);
          setCartCount(0);
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
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
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 2 : 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  authTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  authTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authUserName: {
    color: '#d1fae5',
    fontSize: 11,
    fontWeight: typography.weights.medium,
    maxWidth: 110,
  },
  profileNavBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  profileNavBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  signOutBtn: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  signOutBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  subPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: typography.weights.semiBold,
  },
});
