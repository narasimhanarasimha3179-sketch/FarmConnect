// FarmConnect Real-Time Logistics & Order Tracking Screen (Phase 20)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { colors } from '../../theme';
import { Header, Card, Badge, Button, Input } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function TrackingScreen({ route, navigation, trackingId = 'FC-TRK-882104-A1' }) {
  const [trackingNumber, setTrackingNumber] = useState(trackingId);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (idToQuery) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/logistics/track/${idToQuery || trackingNumber}`);
      if (res.data?.success) {
        setShipment(res.data.shipment);
      } else {
        setError(res.data?.message || 'Tracking number not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(trackingId);
  }, [trackingId]);

  const stages = [
    { label: 'Confirmed', key: 'ORDER_CONFIRMED', step: 1 },
    { label: 'Dispatched', key: 'DISPATCHED', step: 2 },
    { label: 'In Transit', key: 'IN_TRANSIT', step: 3 },
    { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY', step: 4 },
    { label: 'Delivered', key: 'DELIVERED', step: 5 },
  ];

  const currentStep = shipment ? shipment.progress_stage : 1;

  const handleCallDriver = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Consignment Tracking" showBack onBack={() => navigation?.goBack?.()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholder="Enter Tracking # or Order #"
            />
          </View>
          <Button
            title="Track"
            variant="primary"
            onPress={() => fetchTracking(trackingNumber)}
            style={styles.searchBtn}
          />
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTxt}>Fetching GPS Telemetry...</Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTxt}>{error}</Text>
          </Card>
        ) : shipment ? (
          <View>
            {/* Shipment Status Header Card */}
            <Card style={styles.mainCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.trackingTitle}>Tracking ID</Text>
                  <Text style={styles.trackingVal}>{shipment.tracking_number}</Text>
                </View>
                <Badge
                  label={shipment.status.replace(/_/g, ' ')}
                  variant={shipment.status === 'DELIVERED' ? 'success' : 'primary'}
                />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Order Reference:</Text>
                <Text style={styles.metaVal}>{shipment.order_number}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Estimated Delivery:</Text>
                <Text style={styles.metaValBold}>{shipment.estimated_delivery}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Current Hub:</Text>
                <Text style={styles.metaVal}>{shipment.current_location}</Text>
              </View>
            </Card>

            {/* 5-Stage Visual Progress Bar */}
            <Card style={styles.timelineCard}>
              <Text style={styles.timelineTitle}>Transit Progression</Text>
              <View style={styles.stagesContainer}>
                {stages.map((st, i) => {
                  const isDone = currentStep >= st.step;
                  const isCurrent = currentStep === st.step;
                  return (
                    <View key={st.key} style={styles.stageItem}>
                      <View style={[styles.circle, isDone && styles.circleDone, isCurrent && styles.circleCurrent]}>
                        <Text style={[styles.circleTxt, isDone && styles.circleTxtDone]}>
                          {isDone ? '✓' : st.step}
                        </Text>
                      </View>
                      <Text style={[styles.stageLabel, isCurrent && styles.stageLabelCurrent]}>
                        {st.label}
                      </Text>
                      {i < stages.length - 1 && (
                        <View style={[styles.line, currentStep > st.step && styles.lineDone]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Driver & Logistics Fleet Info */}
            <Card style={styles.fleetCard}>
              <Text style={styles.fleetTitle}>Assigned Logistics Fleet</Text>
              <View style={styles.fleetRow}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 24 }}>🚚</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.driverName}>{shipment.driver_name || 'Designated Driver'}</Text>
                  <Text style={styles.courierName}>{shipment.courier_partner}</Text>
                  <Text style={styles.vehicleNo}>Vehicle: {shipment.vehicle_number || 'N/A'}</Text>
                </View>
                {shipment.driver_phone ? (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCallDriver(shipment.driver_phone)}
                  >
                    <Text style={styles.callIcon}>📞</Text>
                    <Text style={styles.callTxt}>Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Card>

            {/* Checkpoints Historical Log */}
            <Card style={styles.historyCard}>
              <Text style={styles.historyTitle}>Activity Milestones</Text>
              {shipment.timeline_checkpoints?.map((chk, idx) => (
                <View key={idx} style={styles.checkpointRow}>
                  <View style={styles.dot} />
                  <View style={styles.checkpointContent}>
                    <Text style={styles.checkpointLocation}>{chk.title || chk.location}</Text>
                    <Text style={styles.checkpointDesc}>{chk.description}</Text>
                    <Text style={styles.checkpointTime}>
                      {new Date(chk.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBtn: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  loaderBox: {
    alignItems: 'center',
    padding: 40,
  },
  loadingTxt: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFEBEE',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTxt: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  mainCard: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  trackingTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  trackingVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaVal: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  metaValBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineCard: {
    padding: 16,
    marginBottom: 14,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleDone: {
    backgroundColor: colors.primary,
  },
  circleCurrent: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  circleTxt: {
    fontSize: 12,
    color: '#757575',
    fontWeight: 'bold',
  },
  circleTxtDone: {
    color: '#FFF',
  },
  stageLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stageLabelCurrent: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  line: {
    position: 'absolute',
    top: 14,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  lineDone: {
    backgroundColor: colors.primary,
  },
  fleetCard: {
    padding: 16,
    marginBottom: 14,
  },
  fleetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  courierName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  vehicleNo: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  callBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  callIcon: {
    fontSize: 14,
  },
  callTxt: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  historyCard: {
    padding: 16,
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  checkpointRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: 12,
  },
  checkpointContent: {
    flex: 1,
  },
  checkpointLocation: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  checkpointDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  checkpointTime: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});
