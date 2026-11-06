// FarmConnect Live Mandi Prices & Market Trends Screen (Phase 9)
// Verified APMC rates, historical price charts, market comparisons & price alerts

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function MandiPriceScreen({ onBack }) {
  const { showSuccess, showError, showInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Sugarcane');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // History & Comparison data
  const [priceHistory, setPriceHistory] = useState([]);
  const [marketComparison, setMarketComparison] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Price Alert Modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('ABOVE');
  const [submittingAlert, setSubmittingAlert] = useState(false);

  useEffect(() => {
    loadMandiRates();
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedCommodity) {
      loadPriceHistory(selectedCommodity);
      loadMarketComparison(selectedCommodity);
    }
  }, [selectedCommodity]);

  async function loadMandiRates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiClient.get(`/mandi/rates?${params.toString()}`);
      if (res.data?.success) {
        setRates(res.data.data);
      }
    } catch (err) {
      showError('Failed to load live APMC market rates.', 'Market Error');
    } finally {
      setLoading(false);
    }
  }

  async function loadPriceHistory(commodity) {
    setHistoryLoading(true);
    try {
      const res = await apiClient.get(`/mandi/history?commodity=${encodeURIComponent(commodity)}`);
      if (res.data?.success) {
        setPriceHistory(res.data.data);
      }
    } catch (err) {
      console.log('Price history err:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadMarketComparison(commodity) {
    try {
      const res = await apiClient.get(`/mandi/comparison?commodity=${encodeURIComponent(commodity)}`);
      if (res.data?.success) {
        setMarketComparison(res.data.data);
      }
    } catch (err) {
      console.log('Comparison err:', err);
    }
  }

  async function handleCreateAlert() {
    if (!alertTargetPrice) {
      showError('Please specify target rate threshold.', 'Validation');
      return;
    }
    setSubmittingAlert(true);
    try {
      const res = await apiClient.post('/mandi/alerts', {
        commodity: selectedCommodity,
        target_price: parseFloat(alertTargetPrice),
        condition: alertCondition,
      });
      if (res.data?.success) {
        showSuccess(`Price alert set for ${selectedCommodity} at ₹${alertTargetPrice}!`, 'Alert Active');
        setShowAlertModal(false);
        setAlertTargetPrice('');
      }
    } catch (err) {
      showError(err.message || 'Failed to activate price alert.', 'Alert Error');
    } finally {
      setSubmittingAlert(false);
    }
  }

  const commodities = ['Sugarcane', 'Paddy (Dhan)', 'Ragi (Finger Millet)', 'Tomato', 'Onion', 'Cotton'];
  const districts = ['ALL', 'Mandya', 'Hubli', 'Kolar', 'Raichur'];

  return (
    <View style={styles.container}>
      <Header
        title="Live APMC Mandi Ticker"
        subtitle="Verified government market arrival prices & trends"
        onBack={onBack}
        rightAction={
          <Button
            title="🔔 Set Alert"
            size="sm"
            variant="outline"
            onPress={() => setShowAlertModal(true)}
          />
        }
      />

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search commodity, APMC market or variety..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadMandiRates}
          placeholderTextColor="#9ca3af"
        />
        <Button title="Filter" size="sm" variant="primary" onPress={loadMandiRates} />
      </View>

      {/* Commodity Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.commodityScroll}
      >
        {commodities.map((comm) => (
          <TouchableOpacity
            key={comm}
            style={[styles.commChip, selectedCommodity === comm && styles.activeCommChip]}
            onPress={() => setSelectedCommodity(comm)}
          >
            <Text style={[styles.commChipText, selectedCommodity === comm && styles.activeCommChipText]}>
              {comm}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* District Selector Chips */}
      <View style={styles.districtRow}>
        <Text style={styles.districtLabel}>District:</Text>
        {districts.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.distPill, selectedDistrict === d && styles.activeDistPill]}
            onPress={() => setSelectedDistrict(d)}
          >
            <Text style={[styles.distText, selectedDistrict === d && styles.activeDistText]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* PRICE TREND CHART CARD */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>{selectedCommodity} 7-Day Trend</Text>
              <Text style={styles.chartSub}>Historical APMC modal price movement</Text>
            </View>
            <Badge label="VERIFIED APMC" variant="success" />
          </View>

          {historyLoading ? (
            <LoadingIndicator text="Compiling price trend curves..." />
          ) : priceHistory.length === 0 ? (
            <Text style={styles.noHistoryText}>No trend points available for {selectedCommodity}.</Text>
          ) : (
            <View style={styles.chartArea}>
              <View style={styles.barsContainer}>
                {priceHistory.map((item, idx) => {
                  const maxPrice = Math.max(...priceHistory.map((h) => h.modal_price));
                  const minPrice = Math.min(...priceHistory.map((h) => h.modal_price));
                  const range = maxPrice - minPrice || 1;
                  const heightPercent = 40 + Math.round(((item.modal_price - minPrice) / range) * 50);

                  return (
                    <View key={idx} style={styles.barColumn}>
                      <Text style={styles.barValueText}>₹{item.modal_price}</Text>
                      <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                      <Text style={styles.barDateText}>{item.date.slice(5)}</Text>
                      <Text style={styles.trendArrow}>
                        {item.trend === 'UP' ? '▲' : item.trend === 'DOWN' ? '▼' : '●'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </Card>

        {/* INTER-MANDI COMPARISON */}
        {marketComparison.length > 1 && (
          <Card style={styles.comparisonCard}>
            <Text style={styles.sectionHeading}>🏛 Inter-Mandi Price Comparison</Text>
            <Text style={styles.comparisonSub}>Compare rates across different district market yards to maximize profit</Text>
            {marketComparison.map((m, idx) => (
              <View key={idx} style={styles.comparisonRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mandiNameText}>{m.market_mandi}</Text>
                  <Text style={styles.mandiSubText}>{m.district}, {m.state} • {m.arrival_date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.comparisonPriceText}>₹{m.modal_price}</Text>
                  <Text style={styles.rangeText}>Min ₹{m.min_price} - Max ₹{m.max_price}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* LIVE RATES TICKER */}
        <Text style={styles.sectionHeading}>📋 Live APMC Rates Board</Text>
        {loading ? (
          <LoadingIndicator text="Fetching latest mandi arrivals..." />
        ) : rates.length === 0 ? (
          <EmptyState title="No Records" message="No mandi arrivals found for the chosen filters." />
        ) : (
          rates.map((rate) => (
            <Card key={rate.id} style={styles.rateCard}>
              <View style={styles.rateCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropTitleText}>{rate.commodity}</Text>
                  <Text style={styles.varietyText}>Variety: {rate.variety}</Text>
                  <Text style={styles.locationText}>📍 {rate.market_mandi} ({rate.district})</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Badge
                    label={rate.trend === 'UP' ? '▲ RISING' : rate.trend === 'DOWN' ? '▼ FALLING' : '● STABLE'}
                    variant={rate.trend === 'UP' ? 'success' : rate.trend === 'DOWN' ? 'danger' : 'neutral'}
                  />
                  <Text style={styles.modalPriceText}>₹{rate.modal_price} <Text style={styles.unitText}>/Quintal</Text></Text>
                </View>
              </View>

              <View style={styles.priceBandRow}>
                <Text style={styles.bandLabel}>Min: <Text style={styles.bandVal}>₹{rate.min_price}</Text></Text>
                <Text style={styles.bandDivider}>|</Text>
                <Text style={styles.bandLabel}>Modal: <Text style={[styles.bandVal, { color: colors.primary }]}>₹{rate.modal_price}</Text></Text>
                <Text style={styles.bandDivider}>|</Text>
                <Text style={styles.bandLabel}>Max: <Text style={styles.bandVal}>₹{rate.max_price}</Text></Text>
              </View>

              <Text style={styles.dateNotice}>Official APMC arrival date: {rate.arrival_date}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* PRICE ALERT MODAL */}
      <Modal visible={showAlertModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Target Rate Alert</Text>
            <Text style={styles.modalSub}>Receive instant notification when {selectedCommodity} reaches your price</Text>

            <Text style={styles.inputLabel}>Alert Condition</Text>
            <View style={styles.conditionRow}>
              {['ABOVE', 'BELOW'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.conditionBtn, alertCondition === c && styles.activeConditionBtn]}
                  onPress={() => setAlertCondition(c)}
                >
                  <Text style={[styles.conditionText, alertCondition === c && styles.activeConditionText]}>
                    {c === 'ABOVE' ? 'Rate Exceeds (≥)' : 'Rate Drops Below (≤)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Target Price (₹/Quintal)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 3400"
              value={alertTargetPrice}
              onChangeText={setAlertTargetPrice}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setShowAlertModal(false)}
                style={styles.flexBtn}
              />
              <Button
                title="Activate Alert"
                variant="primary"
                size="sm"
                disabled={submittingAlert}
                onPress={handleCreateAlert}
                style={styles.flexBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: '#ffffff',
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.sm,
    color: '#111827',
  },
  commodityScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#ffffff',
  },
  commChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: spacing.xs,
  },
  activeCommChip: {
    backgroundColor: colors.primary,
  },
  commChipText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  activeCommChipText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  districtLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  distPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 4,
    backgroundColor: '#f3f4f6',
  },
  activeDistPill: {
    backgroundColor: '#3b82f6',
  },
  distText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  activeDistText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  scroll: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  chartCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  chartTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  chartSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  noHistoryText: {
    fontSize: typography.sizes.xs,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  chartArea: {
    height: 140,
    marginTop: spacing.sm,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: 'center',
    width: 44,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#374151',
    marginBottom: 2,
  },
  barFill: {
    width: 22,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barDateText: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  trendArrow: {
    fontSize: 8,
    color: '#16a34a',
  },
  comparisonCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  comparisonSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mandiNameText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  mandiSubText: {
    fontSize: 10,
    color: '#6b7280',
  },
  comparisonPriceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  rangeText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  rateCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitleText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  varietyText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginTop: 2,
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  modalPriceText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: 4,
  },
  unitText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  priceBandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    marginVertical: spacing.xs,
    justifyContent: 'space-between',
  },
  bandLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  bandVal: {
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  bandDivider: {
    color: '#d1d5db',
  },
  dateNotice: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#374151',
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  conditionBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  activeConditionBtn: {
    backgroundColor: colors.primary,
  },
  conditionText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  activeConditionText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.sm,
    color: '#111827',
    marginBottom: spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
});
