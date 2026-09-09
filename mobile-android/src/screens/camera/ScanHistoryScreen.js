import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { scanStorage } from '../../services/scanStorage';
import DiagnosisModal from '../../components/DiagnosisModal';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function ScanHistoryScreen({ onBack }) {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadScans = useCallback(async () => {
    const list = await scanStorage.getScans();
    setScans(list);
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleClear = () => {
    Alert.alert(
      'Clear Archive',
      'Are you sure you want to delete all stored crop diagnostic records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await scanStorage.clearScans();
            setScans([]);
          },
        },
      ]
    );
  };

  const openScanDetail = (scan) => {
    setSelectedScan(scan);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const isSevere = item.severity === 'Severe';
    const isModerate = item.severity === 'Moderate';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openScanDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cropBadge}>{item.crop || 'Crop'} Inspection</Text>
          <View
            style={[
              styles.severityBadge,
              isSevere && styles.badgeSevere,
              isModerate && styles.badgeModerate,
              !isSevere && !isModerate && styles.badgeNormal,
            ]}
          >
            <Text
              style={[
                styles.severityText,
                isSevere && styles.textSevere,
                isModerate && styles.textModerate,
                !isSevere && !isModerate && styles.textNormal,
              ]}
            >
              {item.severity}
            </Text>
          </View>
        </View>

        <Text style={styles.diseaseName}>{item.disease}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        <Text style={styles.symptomsPreview} numberOfLines={2}>
          {item.symptoms}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Camera</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scan Records</Text>
        {scans.length > 0 ? (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Main List */}
      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Scans Archived</Text>
          <Text style={styles.emptyDesc}>
            Foliage scans and treatment plans will appear here after capturing frames in the scanner.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full Detail Modal */}
      <DiagnosisModal
        visible={modalVisible}
        diagnosis={selectedScan}
        onClose={() => setModalVisible(false)}
        onSaveScan={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    height: 54,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  clearText: {
    color: '#ffcdd2',
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  listPadding: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeSevere: {
    backgroundColor: COLORS.dangerSoft,
  },
  badgeModerate: {
    backgroundColor: COLORS.warningSoft,
  },
  badgeNormal: {
    backgroundColor: COLORS.accentSoft,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textSevere: {
    color: COLORS.danger,
  },
  textModerate: {
    color: COLORS.warning,
  },
  textNormal: {
    color: COLORS.success,
  },
  diseaseName: {
    ...TYPOGRAPHY.h3,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  symptomsPreview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});