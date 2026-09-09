import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import CustomButton from './CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function DiagnosisModal({ visible, diagnosis, onClose, onSaveScan }) {
  if (!diagnosis) return null;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Severe':
        return { bg: COLORS.dangerSoft, text: COLORS.danger };
      case 'Moderate':
        return { bg: COLORS.warningSoft, text: COLORS.warning };
      case 'Low':
        return { bg: '#e0f2fe', text: '#0284c7' };
      default:
        return { bg: COLORS.accentSoft, text: COLORS.success };
    }
  };

  const badgeStyle = getSeverityStyle(diagnosis.severity);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diagnostic Report</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Main Condition Card */}
          <View style={styles.conditionCard}>
            <View style={styles.topRow}>
              <Text style={styles.cropLabel}>{diagnosis.crop} Pathology</Text>
              <View style={[styles.severityBadge, { backgroundColor: badgeStyle.bg }]}>
                <Text style={[styles.severityText, { color: badgeStyle.text }]}>
                  {diagnosis.severity} Severity
                </Text>
              </View>
            </View>
            <Text style={styles.diseaseName}>{diagnosis.disease}</Text>
            <Text style={styles.confidenceText}>
              Confidence Score: {Math.round(diagnosis.confidence * 100)}%
            </Text>
          </View>

          {/* Symptoms Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Detected Symptoms</Text>
            <View style={styles.contentBox}>
              <Text style={styles.bodyText}>{diagnosis.symptoms}</Text>
            </View>
          </View>

          {/* Organic Treatments */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>🌿</Text>
              <Text style={styles.sectionHeader}>Recommended Organic Treatments</Text>
            </View>
            <View style={styles.contentBox}>
              {diagnosis.organicRemedies.map((remedy, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.remedyText}>{remedy}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Chemical Treatments */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>🧪</Text>
              <Text style={styles.sectionHeader}>Chemical & Fungicide Controls</Text>
            </View>
            <View style={styles.contentBox}>
              {diagnosis.chemicalRemedies.map((remedy, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.remedyText}>{remedy}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <CustomButton title="Save to Scan Records" onPress={onSaveScan} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  conditionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cropLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diseaseName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contentBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bulletDot: {
    fontSize: 14,
    color: COLORS.primaryLight,
    lineHeight: 18,
  },
  remedyText: {
    ...TYPOGRAPHY.body,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});