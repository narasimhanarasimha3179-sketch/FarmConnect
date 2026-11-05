// FarmConnect Seller Dashboard Screen
// Role-protected view tailored for agricultural merchants and input suppliers

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function SellerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showInfo } = useNotification();
  const profile = user?.profile || {};

  return (
    <View style={styles.container}>
      <Header
        title={`Store: ${profile.shop_name || user?.name}`}
        subtitle="🏪 Merchant Portal • Active"
        rightAction={<Badge label="SELLER" variant="seller" />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.sellerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.shopTitle}>{profile.shop_name || 'Agri Input Store'}</Text>
            <Badge label={profile.is_verified ? 'Verified Seller' : 'Pending KYC'} variant={profile.is_verified ? 'success' : 'warning'} size="sm" />
          </View>
          <Text style={styles.metaText}>License: {profile.license_number || 'Under Review'}</Text>
          <Text style={styles.metaText}>Merchant: {user?.name} ({user?.phone})</Text>
        </Card>

        <Text style={styles.sectionHeading}>Merchant Hub</Text>
        <View style={styles.actionGrid}>
          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 5 opens product inventory catalog', 'Inventory')}
          >
            <Text style={styles.tileEmoji}>📦</Text>
            <Text style={styles.tileTitle}>Manage Inventory</Text>
            <Text style={styles.tileSub}>Seeds, Fertilizers, Tools</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 5 opens add product flow', 'Add Product')}
          >
            <Text style={styles.tileEmoji}>➕</Text>
            <Text style={styles.tileTitle}>Add New Product</Text>
            <Text style={styles.tileSub}>Price, Photos & Stock</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 5 order fulfilment dashboard', 'Orders')}
          >
            <Text style={styles.tileEmoji}>📋</Text>
            <Text style={styles.tileTitle}>Customer Orders</Text>
            <Text style={styles.tileSub}>Dispatch & Fulfill</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 5 sales revenue metrics', 'Revenue')}
          >
            <Text style={styles.tileEmoji}>📊</Text>
            <Text style={styles.tileTitle}>Sales & Revenue</Text>
            <Text style={styles.tileSub}>Performance Insights</Text>
          </Card>
        </View>

        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Session</Text>
          <Text style={styles.accountSub}>Signed in as {user?.email} • Role: SELLER</Text>
          <View style={styles.btnRow}>
            <Button title="Store Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.flexBtn} />
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
  sellerCard: {
    padding: spacing.md,
    backgroundColor: colors.amberLight,
    borderColor: colors.amber,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shopTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.soilBrown,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
