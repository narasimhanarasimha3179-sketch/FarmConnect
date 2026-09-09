import React, { useState, useMemo } from 'react';
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

const TIMEFRAMES = ['7 Days', '1 Month', '3 Months'];

const TIMEFRAME_DATA = {
  '7 Days': [
    { day: 'Day 1', rate: 2150 },
    { day: 'Day 2', rate: 2200 },
    { day: 'Day 3', rate: 2180 },
    { day: 'Day 4', rate: 2320 },
    { day: 'Day 5', rate: 2380 },
    { day: 'Day 6', rate: 2410 },
    { day: 'Today', rate: 2450 },
  ],
  '1 Month': [
    { day: 'Wk 1', rate: 2050 },
    { day: 'Wk 2', rate: 2120 },
    { day: 'Wk 3', rate: 2280 },
    { day: 'Wk 4', rate: 2450 },
  ],
  '3 Months': [
    { day: 'M-2', rate: 1980 },
    { day: 'M-1', rate: 2180 },
    { day: 'Cur', rate: 2450 },
  ],
};

export default function MandiDetailModal({ visible, record, onClose, onSetAlert }) {
  const [selectedFrame, setSelectedFrame] = useState('7 Days');

  const chartSeries = useMemo(() => {
    const rawSeries = TIMEFRAME_DATA[selectedFrame] || TIMEFRAME_DATA['7 Days'];
    const rates = rawSeries.map((item) => item.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const spread = maxRate - minRate || 1;

    return rawSeries.map((item) => ({
      ...item,
      heightRatio: 0.35 + ((item.rate - minRate) / spread) * 0.65,
    }));
  }, [selectedFrame]);

  if (!record) return null;

  const isUp = record.trendDirection === 'up';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{record.commodity} Analytics</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.headerMeta}>
              <Text style={styles.marketName}>{record.market}</Text>
              <Text style={styles.varietyName}>{record.variety}</Text>
            </View>
            <Text style={styles.currentPrice}>{record.modalPrice}</Text>
            <View style={styles.trendRow}>
              <Text style={[styles.trendBadge, isUp ? styles.trendUp : styles.trendDown]}>
                {record.trend}
              </Text>
              <Text style={styles.trendDescriptor}>vs previous trading session</Text>
            </View>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeRow}>
            {TIMEFRAMES.map((frame) => {
              const isActive = selectedFrame === frame;
              return (
                <TouchableOpacity
                  key={frame}
                  style={[styles.frameBtn, isActive && styles.frameBtnActive]}
                  onPress={() => setSelectedFrame(frame)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.frameText, isActive && styles.frameTextActive]}>
                    {frame}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Visual Trend Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Modal Price Trajectory (₹ / Qtl)</Text>
            <View style={styles.barsContainer}>
              {chartSeries.map((item, index) => {
                const isLatest = index === chartSeries.length - 1;
                return (
                  <View key={item.day} style={styles.barColumn}>
                    <Text style={styles.barRateText}>₹{item.rate}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${Math.round(item.heightRatio * 100)}%` },
                          isLatest ? styles.barFillActive : styles.barFillNormal,
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDayText, isLatest && styles.barDayActive]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Market Arrivals & Trade Volume */}
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Daily Influx & Mandi Volume</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Daily Arrivals</Text>
                <Text style={styles.metricValue}>420 Tonnes</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Active Traders</Text>
                <Text style={styles.metricValue}>38 Licensed</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>State MSP</Text>
                <Text style={styles.metricValue}>₹ 2,183 / Qtl</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Trading Status</Text>
                <Text style={[styles.metricValue, { color: COLORS.success }]}>Active Session</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Alert CTA */}
        <View style={styles.footer}>
          <CustomButton
            title="Set Price Threshold Alert"
            onPress={onSetAlert}
            variant="secondary"
          />
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
  topBar: {
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
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 48,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerMeta: {
    marginBottom: 4,
  },
  marketName: {
    ...TYPOGRAPHY.h2,
  },
  varietyName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.xs,
  },
  trendBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendUp: {
    backgroundColor: COLORS.accentSoft,
    color: COLORS.success,
  },
  trendDown: {
    backgroundColor: COLORS.dangerSoft,
    color: COLORS.danger,
  },
  trendDescriptor: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frameBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  frameBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  frameText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  frameTextActive: {
    color: '#ffffff',
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  barsContainer: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barRateText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 16,
    height: 90,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barFillNormal: {
    backgroundColor: '#a5d6a7',
  },
  barFillActive: {
    backgroundColor: COLORS.primaryLight,
  },
  barDayText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  barDayActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  metricsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});