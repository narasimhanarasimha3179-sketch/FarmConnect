// FarmConnect Admin Governance Dashboard
// Role-protected oversight console for system administrators

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function AdminDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showInfo } = useNotification();

  return (
    <View style={styles.container}>
      <Header
        title="Admin Governance Console"
        subtitle={`System Administrator • ${user?.name}`}
        rightAction={<Badge label="ADMIN" variant="admin" />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.adminCard}>
          <Text style={styles.adminTitle}>🛡 Platform Governance & Security</Text>
          <Text style={styles.adminSub}>Full oversight across Farmers, Buyers, Sellers, and Transactions</Text>
        </Card>

        <Text style={styles.sectionHeading}>Administrative Controls</Text>
        <View style={styles.actionGrid}>
          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 6 centralized multi-role user directory', 'User Management')}
          >
            <Text style={styles.tileEmoji}>👥</Text>
            <Text style={styles.tileTitle}>User Management</Text>
            <Text style={styles.tileSub}>Farmers, Buyers & Sellers</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 6 seller merchant verification review', 'KYC Verification')}
          >
            <Text style={styles.tileEmoji}>📑</Text>
            <Text style={styles.tileTitle}>Seller KYC</Text>
            <Text style={styles.tileSub}>License Approvals</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 18 Government schemes CMS', 'Schemes CMS')}
          >
            <Text style={styles.tileEmoji}>🏛</Text>
            <Text style={styles.tileTitle}>Govt Schemes</Text>
            <Text style={styles.tileSub}>Manage Portals</Text>
          </Card>

          <Card
            style={styles.actionTile}
            onPress={() => showInfo('Phase 25 security audits and access logs', 'Audit Logs')}
          >
            <Text style={styles.tileEmoji}>🔒</Text>
            <Text style={styles.tileTitle}>Security & Audit</Text>
            <Text style={styles.tileSub}>System Logs</Text>
          </Card>
        </View>

        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Session</Text>
          <Text style={styles.accountSub}>Signed in as {user?.email} • Role: ADMIN</Text>
          <View style={styles.btnRow}>
            <Button title="Admin Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.flexBtn} />
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
  adminCard: {
    padding: spacing.md,
    backgroundColor: '#f3e8ff',
    borderColor: '#a855f7',
    borderWidth: 1.5,
  },
  adminTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#6b21a8',
  },
  adminSub: {
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
