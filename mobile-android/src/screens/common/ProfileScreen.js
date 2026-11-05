// FarmConnect Profile & Account Management Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Input, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProfileScreen({ onBack }) {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const profile = user?.profile || {};

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(profile.district || '');
  const [village, setVillage] = useState(profile.village || '');
  const [crops, setCrops] = useState(profile.primary_crops || '');

  const handleSave = async () => {
    const res = await updateProfile({
      name,
      phone,
      profileData: {
        district,
        village,
        primary_crops: crops,
      },
    });

    if (res.success) {
      showSuccess('Profile details saved to SQLite database!', 'Profile Updated');
    } else {
      showError(res.message, 'Update Failed');
    }
  };

  const getRoleVariant = (role) => {
    if (role === 'FARMER') return 'farmer';
    if (role === 'BUYER') return 'buyer';
    if (role === 'SELLER') return 'seller';
    if (role === 'ADMIN') return 'admin';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Header
        title="Account & Profile"
        subtitle={user?.email}
        onBack={onBack}
        rightAction={<Badge label={user?.role || 'USER'} variant={getRoleVariant(user?.role)} />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.title}>Edit Account Details</Text>
          <Text style={styles.sub}>Changes are synchronized with your verified FarmConnect identity</Text>

          <Input label="Full Name" value={name} onChangeText={setName} />
          <Input label="Registered Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Email (Permanent)" value={user?.email || ''} editable={false} helperText="Email address cannot be modified directly" />

          {user?.role === 'FARMER' ? (
            <View>
              <Input label="District" value={district} onChangeText={setDistrict} />
              <Input label="Village" value={village} onChangeText={setVillage} />
              <Input label="Primary Crops" value={crops} onChangeText={setCrops} />
            </View>
          ) : null}

          <Button
            title="Save Profile Changes"
            onPress={handleSave}
            loading={isLoading}
            variant="primary"
            size="md"
            style={styles.saveBtn}
          />
        </Card>

        <Card style={styles.logoutCard}>
          <Text style={styles.logoutTitle}>Security & Session</Text>
          <Text style={styles.logoutSub}>Sign out of this device. Your data remains stored safely.</Text>
          <Button
            title="Log Out of FarmConnect"
            variant="danger"
            size="md"
            onPress={logout}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  saveBtn: {
    marginTop: spacing.sm,
  },
  logoutCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderColor: colors.error,
    borderWidth: 1,
  },
  logoutTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  logoutSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
