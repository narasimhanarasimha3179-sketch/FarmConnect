// FarmConnect Registration Screen with 4 Real Roles
// Configures Farmer, Buyer, Seller, and Admin accounts with custom profile schemas

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Input, Card, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import validators from '../../utils/validation';

export default function RegisterScreen({ onNavigateLogin }) {
  const { register, isLoading, authError } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [role, setRole] = useState('FARMER'); // FARMER, BUYER, SELLER, ADMIN
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Role-Specific Profile Fields
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [landSize, setLandSize] = useState('');
  const [crops, setCrops] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState('Individual');
  const [shopName, setShopName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  // 1-Click Sample Pre-fill for Instant Registration Testing
  const handleAutoFillSample = () => {
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const randPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (role === 'FARMER') {
      setName(`Basavaraj Gowda`);
      setPhone(randPhone);
      setEmail(`farmer.${randSuffix}@farmconnect.org`);
      setPassword('FarmerSecret123');
      setStateName('Karnataka');
      setDistrict('Mandya');
      setVillage('Maddur');
      setLandSize('5.5');
      setCrops('Sugarcane, Paddy, Ragi');
    } else if (role === 'BUYER') {
      setName(`Anand Kumar`);
      setPhone(randPhone);
      setEmail(`buyer.${randSuffix}@farmconnect.org`);
      setPassword('BuyerSecret123');
      setBusinessName(`Anand Fresh Agro Procurements`);
      setBuyerType('Wholesaler');
    } else if (role === 'SELLER') {
      setName(`Venkatesh Rao`);
      setPhone(randPhone);
      setEmail(`seller.${randSuffix}@farmconnect.org`);
      setPassword('SellerSecret123');
      setShopName(`Sri Lakshmi Seeds & Fertilizers`);
      setLicenseNumber(`KA-SELLER-${randSuffix}`);
    } else if (role === 'ADMIN') {
      setName(`Deepa Hegde`);
      setPhone(randPhone);
      setEmail(`admin.${randSuffix}@farmconnect.org`);
      setPassword('AdminSecret123');
      setDepartment('State Directorate of Horticulture');
      setDesignation('Senior Agricultural Officer');
    }
    setErrors({});
  };

  const handleRegister = async () => {
    const newErrors = {};

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = validators.cleanIndianPhone(phone);
    const cleanPw = (password || '').trim();

    if (!validators.isRequired(cleanName)) newErrors.name = 'Full name is required';
    if (!validators.isValidIndianPhone(phone)) newErrors.phone = 'Valid 10-digit Indian phone number required';
    if (!validators.isValidEmail(cleanEmail)) newErrors.email = 'Valid email address required';
    if (!validators.isValidPassword(cleanPw)) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Please correct the highlighted fields', 'Validation Error');
      return;
    }

    setErrors({});

    const profileData = {};
    if (role === 'FARMER') {
      profileData.state = stateName;
      profileData.district = district || 'Mandya';
      profileData.village = village || 'Central';
      profileData.land_size_acres = Number(landSize) || 2.5;
      profileData.primary_crops = crops || 'General Crops';
    } else if (role === 'BUYER') {
      profileData.business_name = businessName || cleanName;
      profileData.buyer_type = buyerType;
    } else if (role === 'SELLER') {
      profileData.shop_name = shopName || `${cleanName} Agri Center`;
      profileData.license_number = licenseNumber || 'KA-AGRI-2026';
    } else if (role === 'ADMIN') {
      profileData.department = department || 'Department of Agriculture';
      profileData.designation = designation || 'Agricultural Officer';
    }

    const res = await register({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      password: cleanPw,
      role,
      profileData,
    });

    if (res.success) {
      showSuccess(`Account registered as ${role}!`, 'Registration Complete');
    } else {
      showError(res.message, 'Registration Failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>Create FarmConnect Account</Text>
        <Text style={styles.subtitle}>Select your agricultural role and enter your details</Text>

        {/* Role Selection Tabs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <TouchableOpacity style={styles.autoFillPill} onPress={handleAutoFillSample}>
            <Text style={styles.autoFillText}>⚡ Auto-Fill Sample</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.roleTabs}>
          {[
            { id: 'FARMER', label: '🌾 Farmer', color: colors.primaryLight },
            { id: 'BUYER', label: '🛒 Buyer', color: colors.skyBlue },
            { id: 'SELLER', label: '🏪 Seller', color: colors.amber },
            { id: 'ADMIN', label: '🛡 Admin', color: '#7e22ce' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.roleTab,
                role === item.id ? { borderColor: item.color, backgroundColor: colors.primaryBg } : null,
              ]}
              onPress={() => setRole(item.id)}
            >
              <Text
                style={[
                  styles.roleTabText,
                  role === item.id ? { color: item.color, fontWeight: typography.weights.bold } : null,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* General Inputs */}
        <Input
          label="Full Name"
          placeholder="e.g. Ramesh Patil"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <Input
          label="Mobile Number (India)"
          placeholder="e.g. 9845012345"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
          helperText="10-digit number for SMS authentication"
        />

        <Input
          label="Email Address"
          placeholder="e.g. ramesh@farmconnect.org"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Create Password"
          placeholder="Minimum 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        {/* Role-Specific Fields */}
        {role === 'FARMER' ? (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.roleFieldsTitle}>🌾 Farm & Land Details</Text>
            <Input label="District" placeholder="e.g. Mandya, Mysuru" value={district} onChangeText={setDistrict} />
            <Input label="Village / Taluk" placeholder="e.g. Maddur" value={village} onChangeText={setVillage} />
            <Input
              label="Land Size (Acres)"
              placeholder="e.g. 4.5"
              value={landSize}
              onChangeText={setLandSize}
              keyboardType="numeric"
            />
            <Input
              label="Primary Crops Grown"
              placeholder="e.g. Sugarcane, Ragi, Paddy"
              value={crops}
              onChangeText={setCrops}
            />
          </View>
        ) : null}

        {role === 'BUYER' ? (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.roleFieldsTitle}>🛒 Procurement Information</Text>
            <Input
              label="Company / Trade Name"
              placeholder="e.g. Karnataka Fresh Wholesale"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>
        ) : null}

        {role === 'SELLER' ? (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.roleFieldsTitle}>🏪 Agri Store Details</Text>
            <Input
              label="Agri Input Shop Name"
              placeholder="e.g. Cauvery Fertilizers & Seeds"
              value={shopName}
              onChangeText={setShopName}
            />
            <Input
              label="Dealer License Number"
              placeholder="e.g. KA-SEED-2024-912"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>
        ) : null}

        {role === 'ADMIN' ? (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.roleFieldsTitle}>🛡 Administrative Credentials</Text>
            <Input
              label="Department / Ministry"
              placeholder="e.g. Department of Agriculture"
              value={department}
              onChangeText={setDepartment}
            />
            <Input
              label="Designation / Staff ID"
              placeholder="e.g. Senior Agricultural Officer"
              value={designation}
              onChangeText={setDesignation}
            />
          </View>
        ) : null}

        {authError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {authError}</Text>
          </View>
        ) : null}

        <Button
          title={`Register as ${role}`}
          onPress={handleRegister}
          loading={isLoading}
          variant="primary"
          size="lg"
          style={styles.submitBtn}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  formCard: {
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
    marginBottom: spacing.md,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  autoFillPill: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  autoFillText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  roleTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  roleTab: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleTabText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  roleFieldsContainer: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleFieldsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
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
  },
  submitBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.sizes.sm,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
  },
});
