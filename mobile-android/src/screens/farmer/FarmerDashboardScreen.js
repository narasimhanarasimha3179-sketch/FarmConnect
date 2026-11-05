// FarmConnect Farmer Dashboard Screen
// Role-protected view tailored for agricultural producers

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function FarmerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showInfo } = useNotification();
  const profile = user?.profile || {};

  return (
    <View style={styles.container}>
      <Header
        title={`Namaskara, ${user?.name || 'Farmer'}`}
        subtitle="🌾 Kisan Connected Hub • Active"
        rightAction={<Badge label="FARMER" variant="farmer" />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Farm Profile Summary Card */}
        <Card style={styles.profileSummaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.summaryTitle}>🏡 My Farm Profile</Text>
            <Badge label="Verified Landholder" variant="success" size="sm" />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location:</Text>
            <Text style={styles.metaValue}>
              {profile.village ? `${profile.village}, ` : ''}{profile.district || 'Mandya'}, {profile.state || 'Karnataka'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Land Holding:</Text>
            <Text style={styles.metaValue}>
              {profile.land_size_acres ? `${profile.land_size_acres} Acres` : '4.5 Acres'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Soil Type:</Text>
            <Text style={styles.metaValue}>{profile.soil_type || 'Red Sandy Loam'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Primary Crops:</Text>
            <Text style={styles.metaValue}>{profile.primary_crops || 'Sugarcane, Paddy, Ragi'}</Text>
          </View>

          <Button
            title="Edit Farm Profile"
            variant="secondary"
            size="sm"
            onPress={onOpenProfile}
            style={styles.editBtn}
          />
        </Card>

        {/* Agricultural Actions Grid */}
        <Text style={styles.sectionHeading}>Agricultural Services</Text>
        <View style={styles.actionGrid}>
          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 3 will unlock full dynamic weather telemetry', 'Weather Engine')}
          >
            <Text style={styles.tileEmoji}>⛅</Text>
            <Text style={styles.tileTitle}>Weather Forecast</Text>
            <Text style={styles.tileSub}>29°C • Partly Cloudy</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 9 connects live AGMARKNET APMC mandi rates', 'Mandi Prices')}
          >
            <Text style={styles.tileEmoji}>📈</Text>
            <Text style={styles.tileTitle}>Mandi Rates</Text>
            <Text style={styles.tileSub}>Paddy: ₹2,200/qtl</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 8 opens Farmer Crop Selling Hub', 'Crop Marketplace')}
          >
            <Text style={styles.tileEmoji}>🌽</Text>
            <Text style={styles.tileTitle}>Sell Produce</Text>
            <Text style={styles.tileSub}>List Harvest Direct</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 12 automated N-P-K recommendation engine', 'Soil Health')}
          >
            <Text style={styles.tileEmoji}>🧪</Text>
            <Text style={styles.tileTitle}>Soil Health</Text>
            <Text style={styles.tileSub}>Test Log & N-P-K</Text>
          </Card>
        </View>

        {/* Account Management & Logout */}
        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Session</Text>
          <Text style={styles.accountSub}>Signed in as {user?.email} • Role: FARMER</Text>
          <View style={styles.btnRow}>
            <Button title="Account Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.flexBtn} />
            <Button title="Sign Out" variant="danger" size="sm" onPress={logout} style={styles.flexBtn} />
          </View>
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
  profileSummaryCard: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  metaValue: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  editBtn: {
    marginTop: spacing.sm,
  },
  sectionHeading: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionTile: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
  },
  tileEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  tileTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tileSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  accountCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  accountTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  accountSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
});
