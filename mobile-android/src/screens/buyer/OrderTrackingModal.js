// FarmConnect Order Tracking & Lifecycle Timeline Modal
// Complete shipment progress, delivery address, invoice details, and customer rating

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Badge, Button, Input, Header } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../services/apiClient';

export default function OrderTrackingModal({ visible, orderId, onClose }) {
  const { showSuccess, showError } = useNotification();

  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadTracking = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/buyer/orders/${orderId}`);
      if (res.success && res.data && res.data.order) {
        setOrderData(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order tracking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible && orderId) {
      loadTracking();
    }
  }, [visible, orderId]);

  const handleSubmitReview = async () => {
    if (!comment) {
      showError('Please write a brief comment with your review', 'Comment Required');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const firstItem = orderData?.items?.[0];
      const res = await apiClient.post('/buyer/reviews', {
        target_type: firstItem ? firstItem.item_type : 'PRODUCT',
        target_id: firstItem ? firstItem.item_id : 'general',
        rating,
        comment,
      });

      if (res.success) {
        showSuccess('Review & rating saved!', 'Feedback Received');
        setComment('');
      } else {
        showError(res.message, 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const stages = orderData?.tracking_stages || [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Header
          title={orderData?.order_number || 'Order Tracking'}
          subtitle={`Status: ${orderData?.order_status || 'CONFIRMED'}`}
          onBack={onClose}
          rightAction={<Badge label={orderData?.order_status || 'ACTIVE'} variant="buyer" />}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Tracking Stepper Timeline */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🚚 Order Fulfilment Timeline</Text>
            <View style={styles.timeline}>
              {stages.map((stage, idx) => (
                <View key={stage.step} style={styles.timelineRow}>
                  <View style={styles.stepIndicatorCol}>
                    <View style={[styles.stepDot, stage.completed ? styles.stepDotCompleted : null]}>
                      <Text style={styles.stepDotText}>{stage.completed ? '✓' : stage.step}</Text>
                    </View>
                    {idx < stages.length - 1 ? (
                      <View style={[styles.stepLine, stage.completed ? styles.stepLineCompleted : null]} />
                    ) : null}
                  </View>

                  <View style={styles.stepContentCol}>
                    <Text style={[styles.stepName, stage.completed ? styles.stepNameCompleted : null]}>
                      {stage.name}
                    </Text>
                    <Text style={styles.stepNote}>{stage.note}</Text>
                    {stage.timestamp ? <Text style={styles.stepTime}>{stage.timestamp}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Delivery & Destination Details */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>📦 Shipping Destination</Text>
            <Text style={styles.infoLabel}>Recipient: <Text style={styles.infoVal}>{orderData?.shipping_name}</Text></Text>
            <Text style={styles.infoLabel}>Address: <Text style={styles.infoVal}>{orderData?.shipping_address}</Text></Text>
            <Text style={styles.infoLabel}>Contact: <Text style={styles.infoVal}>{orderData?.shipping_phone}</Text></Text>
            <Text style={styles.infoLabel}>Payment: <Text style={styles.infoVal}>{orderData?.payment_method} ({orderData?.payment_status})</Text></Text>
          </Card>

          {/* Ordered Items Breakdown */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🌾 Items in this Consignment</Text>
            {orderData?.items?.map((item) => (
              <View key={item.id} style={styles.orderItemRow}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemTitle}>{item.title}</Text>
                  <Text style={styles.orderItemMeta}>
                    ₹{item.unit_price} / {item.unit} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.orderItemTotal}>₹{item.total_price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLbl}>Total Invoiced Amount:</Text>
              <Text style={styles.totalVal}>₹{orderData?.total_amount}</Text>
            </View>
          </Card>

          {/* Customer Reviews & Quality Rating */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Rate Produce & Seller Quality</Text>
            <Text style={styles.rateSub}>How satisfied are you with the crop quality and packaging?</Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn}>
                  <Text style={[styles.starIcon, rating >= s ? styles.starFilled : null]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Feedback / Review"
              placeholder="e.g. Grain moisture was within standard APMC norms. Excellent packing."
              value={comment}
              onChangeText={setComment}
            />

            <Button
              title="Submit Quality Review"
              variant="primary"
              size="md"
              loading={isSubmittingReview}
              onPress={handleSubmitReview}
            />
          </Card>
        </ScrollView>
      </View>
    </Modal>
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
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeline: {
    paddingVertical: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.sm,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    minHeight: 28,
  },
  stepLineCompleted: {
    backgroundColor: colors.primaryLight,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  stepName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  stepNameCompleted: {
    color: colors.primary,
  },
  stepNote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepTime: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoVal: {
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  orderItemMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLbl: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryLight,
  },
  rateSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  starRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  starBtn: {
    padding: spacing.xs,
  },
  starIcon: {
    fontSize: 28,
    color: colors.border,
  },
  starFilled: {
    color: colors.amber,
  },
});
