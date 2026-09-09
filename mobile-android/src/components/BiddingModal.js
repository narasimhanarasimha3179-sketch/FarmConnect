import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import CustomButton from './CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function BiddingModal({ visible, lot, onClose, onPlaceBid }) {
  const [counterBid, setCounterBid] = useState('');
  const [loading, setLoading] = useState(false);

  if (!lot) return null;

  const numericCurrentBid = parseInt(lot.currentBid.replace(/[^0-9]/g, ''), 10) || 0;

  const handleClose = () => {
    setCounterBid('');
    onClose();
  };

  const handleSubmitBid = () => {
    const entered = parseInt(counterBid.trim(), 10);
    if (!entered || isNaN(entered)) {
      Alert.alert('Validation Error', 'Please enter a valid numeric bid amount.');
      return;
    }
    if (entered <= numericCurrentBid) {
      Alert.alert(
        'Bid Below Minimum',
        `Your bid must exceed the current highest offer of ₹ ${numericCurrentBid.toLocaleString('en-IN')}.`
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPlaceBid({
        lotId: lot.id,
        bidAmount: entered,
        formattedBid: `₹ ${entered.toLocaleString('en-IN')} / Qtl`,
      });
      setCounterBid('');
      Alert.alert('Bid Registered', `Your offer of ₹ ${entered.toLocaleString('en-IN')} / Qtl has been placed.`);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lot Auction Details</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Lot Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.badgeRow}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{lot.qualityGrade}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>🟢 {lot.status}</Text>
                </View>
              </View>

              <Text style={styles.commodityTitle}>{lot.commodity}</Text>
              <Text style={styles.farmerSubtitle}>
                Grown by {lot.farmerName} • 📍 {lot.location}
              </Text>

              <View style={styles.specGrid}>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Total Quantity</Text>
                  <Text style={styles.specValue}>{lot.quantity}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Harvest Recency</Text>
                  <Text style={styles.specValue}>{lot.harvestDate}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Base Floor Price</Text>
                  <Text style={styles.specValue}>{lot.basePrice}</Text>
                </View>
                <View style={[styles.specBox, styles.highlightBox]}>
                  <Text style={styles.highlightLabel}>Highest Offer</Text>
                  <Text style={styles.highlightValue}>{lot.currentBid}</Text>
                </View>
              </View>
            </View>

            {/* Quality & Moisture Inspection Parameters */}
            <View style={styles.inspectionSection}>
              <Text style={styles.sectionTitle}>Lab / Visual Inspection</Text>
              <View style={styles.inspectionCard}>
                <View style={styles.inspectionRow}>
                  <Text style={styles.inspectionLabel}>Moisture Content</Text>
                  <Text style={styles.inspectionValue}>11.8% (Dry / Safe Storage)</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.inspectionRow}>
                  <Text style={styles.inspectionLabel}>Grain Purity</Text>
                  <Text style={styles.inspectionValue}>98.5% Clean</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.inspectionRow}>
                  <Text style={styles.inspectionLabel}>Pesticide Residue</Text>
                  <Text style={styles.inspectionValue}>Organic Certified / Trace-free</Text>
                </View>
              </View>
            </View>

            {/* Place Counter Bid Box */}
            <View style={styles.bidFormCard}>
              <Text style={styles.sectionTitle}>Place Competitive Bid</Text>
              <Text style={styles.bidInstruction}>
                Enter your bid rate per quintal. Must be higher than {lot.currentBid}.
              </Text>

              <View style={styles.inputWrapper}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>₹</Text>
                </View>
                <TextInput
                  style={styles.bidInput}
                  placeholder={`e.g. ${numericCurrentBid + 50}`}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={counterBid}
                  onChangeText={setCounterBid}
                />
                <Text style={styles.unitSuffix}>/ Qtl</Text>
              </View>

              <CustomButton
                title="Submit Live Bid"
                onPress={handleSubmitBid}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 48,
  },
  scrollBody: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  gradeBadge: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  commodityTitle: {
    ...TYPOGRAPHY.h2,
    marginTop: 2,
  },
  farmerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  specBox: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  highlightBox: {
    backgroundColor: COLORS.accentSoft,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  inspectionSection: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inspectionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inspectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  inspectionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  inspectionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  bidFormCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  bidInstruction: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  currencyPrefix: {
    marginRight: 6,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bidInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitSuffix: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  submitBtn: {
    marginTop: 4,
  },
});