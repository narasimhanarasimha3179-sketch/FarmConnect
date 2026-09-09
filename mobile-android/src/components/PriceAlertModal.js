import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import CustomButton from './CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function PriceAlertModal({ visible, record, onClose, onAlertSaved }) {
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above'); // 'above' | 'below'

  if (!record) return null;

  const handleClose = () => {
    setTargetPrice('');
    setCondition('above');
    onClose();
  };

  const handleSave = () => {
    const numericTarget = parseFloat(targetPrice.trim());
    if (isNaN(numericTarget) || numericTarget <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price threshold in ₹.');
      return;
    }

    onAlertSaved({
      commodity: record.commodity,
      market: record.market,
      variety: record.variety,
      targetPrice: numericTarget,
      condition,
    });
    setTargetPrice('');
    setCondition('above');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Set Price Trigger</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              {record.commodity} ({record.variety}) at {record.market}
            </Text>

            {/* Condition Selector */}
            <Text style={styles.inputLabel}>Trigger Condition</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, condition === 'above' && styles.toggleBtnActive]}
                onPress={() => setCondition('above')}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, condition === 'above' && styles.toggleTextActive]}>
                  Rises Above (≥)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, condition === 'below' && styles.toggleBtnActive]}
                onPress={() => setCondition('below')}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, condition === 'below' && styles.toggleTextActive]}>
                  Falls Below (≤)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Target Price Input */}
            <Text style={styles.inputLabel}>Target Price (₹ per Quintal)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2600"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={setTargetPrice}
            />

            <View style={styles.actionRow}>
              <CustomButton title="Save Alert" onPress={handleSave} style={styles.submitBtn} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
  },
  closeBtn: {
    fontSize: 18,
    color: COLORS.textSecondary,
    padding: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  input: {
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  actionRow: {
    marginTop: SPACING.xs,
  },
  submitBtn: {
    width: '100%',
  },
});