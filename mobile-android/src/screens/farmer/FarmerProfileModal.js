// FarmConnect Deep Farmer Profile Editor
// Manages complete farmer landholding, soil characteristics, and agricultural profile

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Badge, Button, Input, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../services/apiClient';

export default function FarmerProfileModal({ onBack, onProfileUpdated }) {
  const { user, updateProfile, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const profile = user?.profile || {};

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [stateName, setStateName] = useState(profile.state || 'Karnataka');
  const [district, setDistrict] = useState(profile.district || 'Mandya');
  const [taluk, setTaluk] = useState(profile.taluk || 'Maddur');
  const [village, setVillage] = useState(profile.village || 'Koppa');
  const [locationGps, setLocationGps] = useState(profile.location_gps || '12.5833° N, 77.0500° E');
  const [landSize, setLandSize] = useState(String(profile.land_size_acres || 4.5));
  const [soilType, setSoilType] = useState(profile.soil_type || 'Red Sandy Loam');
  const [crops, setCrops] = useState(profile.primary_crops || 'Sugarcane, Paddy, Ragi');
  const [experience, setExperience] = useState(String(profile.experience_years || 15));
  const [lang, setLang] = useState(profile.preferred_language || 'en');

  const soilTypes = [
    'Red Sandy Loam',
    'Black Cotton Soil',
    'Alluvial Soil',
    'Clay Loam',
    'Laterite Soil',
  ];

  const handleSave = async () => {
    try {
      const res = await apiClient.put('/farmer/profile', {
        name,
        state: stateName,
        district,
        taluk,
        village,
        location_gps: locationGps,
        land_size_acres: Number(landSize) || 0,
        soil_type: soilType,
        primary_crops: crops,
        experience_years: Number(experience) || 0,
        preferred_language: lang,
      });

      if (res.success && res.data && res.data.farmer) {
        showSuccess('Farmer land & cultivation details updated in SQLite!', 'Profile Saved');
        if (onProfileUpdated) onProfileUpdated(res.data.farmer);
        onBack();
      } else {
        showError(res.message || 'Failed to update farmer profile', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Edit Farmer Profile"
        subtitle="🌾 Comprehensive Land & Soil Profile"
        onBack={onBack}
        rightAction={<Badge label="FARMER" variant="farmer" />}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Personal Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Farmer Identity</Text>
          <Input label="Full Name" value={name} onChangeText={setName} />
          <Input label="Phone Number" value={phone} editable={false} helperText="Permanent registered mobile" />
        </Card>

        {/* Location & GPS */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Location & GPS Coordinates</Text>
          <Input label="State" value={stateName} onChangeText={setStateName} />
          <Input label="District" value={district} onChangeText={setDistrict} />
          <Input label="Taluk" value={taluk} onChangeText={setTaluk} />
          <Input label="Village" value={village} onChangeText={setVillage} />
          <Input
            label="Farm GPS Coordinates"
            value={locationGps}
            onChangeText={setLocationGps}
            helperText="Used for micro-location weather alerts"
          />
        </Card>

        {/* Land & Soil Characteristics */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🌱 Land & Soil Information</Text>
          <Input
            label="Total Land Holding (Acres)"
            value={landSize}
            onChangeText={setLandSize}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Dominant Soil Type</Text>
          <View style={styles.soilPills}>
            {soilTypes.map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.soilPill, soilType === st ? styles.soilPillActive : null]}
                onPress={() => setSoilType(st)}
              >
                <Text style={[styles.soilPillText, soilType === st ? styles.soilPillTextActive : null]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Primary Crops Cultivated"
            value={crops}
            onChangeText={setCrops}
            helperText="Separated by comma (e.g. Sugarcane, Paddy, Tomato)"
          />

          <Input
            label="Farming Experience (Years)"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />
        </Card>

        {/* Language Preference */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🌐 Preferred Language</Text>
          <View style={styles.langRow}>
            {[
              { id: 'en', label: 'English' },
              { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              { id: 'hi', label: 'हिन्दी (Hindi)' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.langPill, lang === item.id ? styles.langPillActive : null]}
                onPress={() => setLang(item.id)}
              >
                <Text style={[styles.langText, lang === item.id ? styles.langTextActive : null]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title="Save Farmer Profile"
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
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
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  soilPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  soilPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  soilPillActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
  },
  soilPillText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  soilPillTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  langPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
  },
  langText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
