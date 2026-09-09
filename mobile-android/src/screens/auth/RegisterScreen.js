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

const ROLES = [
  { id: 'farmer', title: 'Farmer', icon: '🌾', desc: 'List crops, run AI leaf tests & track mandi rates' },
  { id: 'buyer', title: 'Buyer / Trader', icon: '🏪', desc: 'Bid on live harvest lots & purchase commodities' },
  { id: 'seller', title: 'Agri Seller', icon: '📦', desc: 'Sell seeds, fertilizers, bio-inputs & farm tools' },
  { id: 'expert', title: 'Agri Expert', icon: '🔬', desc: 'Provide agronomic consultations & advisory' },
];

export default function RegisterScreen() {
  const { setCurrentScreen, login } = useApp();

  const [selectedRole, setSelectedRole] = useState('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length !== 10 || !/^\d+$/.test(trimmedPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!district.trim() || !stateName.trim()) {
      Alert.alert('Validation Error', 'Please enter your district and state for local mandi alerts.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        uid: `usr_${Date.now()}`,
        name: trimmedName,
        phone: trimmedPhone,
        role: selectedRole,
        location: {
          district: district.trim(),
          state: stateName.trim(),
        },
      });
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
            <Text style={styles.title}>Join FarmConnect</Text>
            <Text style={styles.subtitle}>Select your platform role and create your profile</Text>
          </View>

          {/* Role Cards */}
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[styles.roleCard, isSelected && styles.roleCardActive]}
                  onPress={() => setSelectedRole(role.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Text style={[styles.roleTitle, isSelected && styles.roleTitleActive]}>
                    {role.title}
                  </Text>
                  <Text style={[styles.roleDesc, isSelected && styles.roleDescActive]} numberOfLines={2}>
                    {role.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.locationRow}>
              <View style={[styles.inputGroup, styles.flexContainer]}>
                <Text style={styles.label}>District</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mandya / Dharwad"
                  placeholderTextColor={COLORS.textMuted}
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>
              <View style={[styles.inputGroup, styles.flexContainer]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Karnataka"
                  placeholderTextColor={COLORS.textMuted}
                  value={stateName}
                  onChangeText={setStateName}
                />
              </View>
            </View>

            <CustomButton
              title="Create Account & Enter"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered?</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In Here</Text>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.sm + 2,
  },
  roleCardActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.accentSoft,
  },
  roleIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  roleDescActive: {
    color: COLORS.primaryLight,
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
  phoneInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countryCode: {
    height: 48,
    width: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});