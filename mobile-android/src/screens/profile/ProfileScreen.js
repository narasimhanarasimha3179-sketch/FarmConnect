import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useApp } from '../../services/AppContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const LANGUAGES = [
  { code: 'en', label: 'English', sub: 'Default' },
  { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
];

export default function ProfileScreen() {
  const { user, logout } = useApp();
  const [selectedLang, setSelectedLang] = useState('en');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of FarmConnect?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = user?.name || 'Narasimha';
  const displayPhone = user?.phone ? `+91 ${user.phone}` : '+91 98765 43210';
  const displayRole = (user?.role || 'farmer').toUpperCase();
  const displayLocation = user?.location
    ? `${user.location.district}, ${user.location.state}`
    : 'Karnataka, India';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
        <Text style={styles.headerSubtitle}>Manage profile, preferences, and security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userPhone}>{displayPhone}</Text>
            <Text style={styles.userLocation}>📍 {displayLocation}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{displayRole}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>Leaf Scans</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Lots Listed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>9</Text>
            <Text style={styles.statLabel}>Active Bids</Text>
          </View>
        </View>

        {/* Multilingual Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Language / ಭಾಷೆ / भाषा</Text>
          <View style={styles.languageContainer}>
            {LANGUAGES.map((lang) => {
              const isActive = selectedLang === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langCard, isActive && styles.langCardActive]}
                  onPress={() => setSelectedLang(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>
                    {lang.label}
                  </Text>
                  <Text style={[styles.langSub, isActive && styles.langSubActive]}>
                    {lang.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Verification & Trust Credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trust & Verification</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <View style={styles.menuDetails}>
                <Text style={styles.menuTitle}>Farmer ID / Identity Verification</Text>
                <Text style={styles.menuSubtitle}>KYC Verified & Registered</Text>
              </View>
              <Text style={styles.verifiedCheck}>✓ Active</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🏦</Text>
              <View style={styles.menuDetails}>
                <Text style={styles.menuTitle}>Bank & UPI Settlement</Text>
                <Text style={styles.menuSubtitle}>Direct DBT bank link configured</Text>
              </View>
              <Text style={styles.verifiedCheck}>✓ Linked</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>🚪 Sign Out of Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
  },
  scrollBody: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  langCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  langCardActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.accentSoft,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  langLabelActive: {
    color: COLORS.primary,
  },
  langSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  langSubActive: {
    color: COLORS.primaryLight,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  menuDetails: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verifiedCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});