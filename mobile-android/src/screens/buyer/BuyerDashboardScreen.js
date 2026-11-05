// FarmConnect Buyer Dashboard Screen
// Role-protected view tailored for agricultural buyers, wholesalers, and consumers

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function BuyerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showInfo } = useNotification();
  const profile = user?.profile || {};

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${user?.name || 'Buyer'}`}
        subtitle="🛒 Procurement Hub • Active"
        rightAction={<Badge label="BUYER" variant="buyer" />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.buyerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.bizName}>{profile.business_name || user?.name}</Text>
            <Badge label={profile.buyer_type || 'Wholesaler'} variant="info" size="sm" />
          </View>
          <Text style={styles.contactText}>Phone: {user?.phone} • Email: {user?.email}</Text>
        </Card>

        <Text style={styles.sectionHeading}>Procurement Operations</Text>
        <View style={styles.actionGrid}>
          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 4 opens direct crop procurement catalog', 'Crop Catalog')}
          >
            <Text style={styles.tileEmoji}>🌾</Text>
            <Text style={styles.tileTitle}>Browse Farm Produce</Text>
            <Text style={styles.tileSub}>Direct from Verified Farmers</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 7 input supplies & fertilizers catalog', 'Agri Inputs')}
          >
            <Text style={styles.tileEmoji}>📦</Text>
            <Text style={styles.tileTitle}>Farming Inputs</Text>
            <Text style={styles.tileSub}>Seeds, Tools, Equipment</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 20 full tracking timeline engine', 'Orders')}
          >
            <Text style={styles.tileEmoji}>🚚</Text>
            <Text style={styles.tileTitle}>Order Tracking</Text>
            <Text style={styles.tileSub}>Active Shipments</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 19 Escrow & UPI payment integration', 'Wallet')}
          >
            <Text style={styles.tileEmoji}>💳</Text>
            <Text style={styles.tileTitle}>Digital Payments</Text>
            <Text style={styles.tileSub}>Receipts & Escrow</Text>
          </Card>
        </View>

        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Session</Text>
          <Text style={styles.accountSub}>Signed in as {user?.email} • Role: BUYER</Text>
          <View style={styles.btnRow}>
            <Button title="Profile Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.flexBtn} />
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
  buyerCard: {
    padding: spacing.md,
    backgroundColor: colors.skyBlueBg,
    borderColor: colors.skyBlue,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bizName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.skyBlue,
  },
  contactText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
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
