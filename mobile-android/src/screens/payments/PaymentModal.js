// FarmConnect Secure Checkout & Tax Invoice Modal (Phase 19)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme';
import { Button, Card, Badge } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function PaymentModal({ visible, order, onClose, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!order) return null;

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await apiClient.post('/payments/create-intent', {
        order_id: order.id || order.order_number,
        amount: order.total_amount,
        payment_method: selectedMethod,
      });

      if (res.data?.success) {
        setPaymentSession(res.data);
      } else {
        setErrorMessage(res.data?.message || 'Payment initiation failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Payment server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await apiClient.post('/payments/verify', {
        payment_id: paymentSession?.payment_id,
        transaction_ref: paymentSession?.transaction_ref,
        status: 'SUCCESS',
      });

      if (res.data?.success) {
        // Fetch Tax Invoice
        const receiptRes = await apiClient.get(`/payments/receipt/${order.id || order.order_number}`);
        if (receiptRes.data?.success) {
          setReceipt(receiptRes.data.receipt);
        }
        if (onSuccess) onSuccess(res.data);
      } else {
        setErrorMessage(res.data?.message || 'Payment verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {receipt ? 'Tax Invoice & Receipt' : 'FarmConnect Secure Payment'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {receipt ? (
              // Digital Tax Invoice View
              <View style={styles.receiptContainer}>
                <View style={styles.receiptBadgeRow}>
                  <Badge label="GST COMPLIANT" variant="success" />
                  <Badge label="PAID" variant="primary" />
                </View>
                <Text style={styles.invoiceNum}>{receipt.invoice_number}</Text>
                <Text style={styles.invoiceMeta}>Date: {new Date(receipt.invoice_date).toLocaleDateString()}</Text>
                <Text style={styles.invoiceMeta}>GSTIN: {receipt.platform_gstin}</Text>

                <View style={styles.divider} />
                <Text style={styles.billToTitle}>Billed To:</Text>
                <Text style={styles.billToName}>{receipt.billed_to.name}</Text>
                <Text style={styles.billToAddr}>{receipt.billed_to.address}</Text>

                <View style={styles.divider} />
                <Text style={styles.itemsTitle}>Purchased Consignments:</Text>
                {receipt.items.map((it, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemTitle}>{it.title} ({it.quantity} {it.unit})</Text>
                    <Text style={styles.itemPrice}>₹{it.total_price}</Text>
                  </View>
                ))}

                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalVal}>₹{receipt.subtotal}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>GST (5% Agricultural Input)</Text>
                  <Text style={styles.totalVal}>₹{receipt.gst_amount}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>Total Paid</Text>
                  <Text style={styles.grandTotalVal}>₹{receipt.total_amount}</Text>
                </View>
                <Text style={styles.txnRef}>Transaction Ref: {receipt.transaction_ref}</Text>

                <Button title="Done" variant="primary" onPress={onClose} style={styles.doneBtn} />
              </View>
            ) : paymentSession ? (
              // Payment Confirmation / UPI Intent View
              <View style={styles.sessionContainer}>
                <View style={styles.qrSimulation}>
                  <Text style={styles.qrCodeIcon}>📱</Text>
                  <Text style={styles.qrLabel}>UPI Payment Ready</Text>
                  <Text style={styles.qrVpa}>VPA: farmconnect@icici</Text>
                  <Text style={styles.amountDisplay}>₹{paymentSession.amount}</Text>
                </View>

                <Text style={styles.refInfo}>Ref: {paymentSession.transaction_ref}</Text>

                <Button
                  title={loading ? 'Verifying...' : 'Simulate Bank Success & Verify'}
                  variant="primary"
                  onPress={handleConfirmPayment}
                  loading={loading}
                  style={styles.payBtn}
                />
              </View>
            ) : (
              // Select Payment Method
              <View>
                <Card style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Order Total</Text>
                  <Text style={styles.summaryAmount}>₹{order.total_amount}</Text>
                  <Text style={styles.summarySub}>Order #{order.order_number || order.id}</Text>
                </Card>

                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                {['UPI', 'CARD', 'NETBANKING', 'COD'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[styles.methodOption, selectedMethod === method && styles.methodSelected]}
                    onPress={() => setSelectedMethod(method)}
                  >
                    <Text style={styles.methodIcon}>
                      {method === 'UPI' ? '📲' : method === 'CARD' ? '💳' : method === 'NETBANKING' ? '🏦' : '💵'}
                    </Text>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>
                        {method === 'UPI'
                          ? 'UPI (GPay / PhonePe / Paytm)'
                          : method === 'CARD'
                          ? 'Credit / Debit Card (Rupay / Visa)'
                          : method === 'NETBANKING'
                          ? 'Net Banking (All Indian Banks)'
                          : 'Cash On Delivery / Mandi Weighing'}
                      </Text>
                      <Text style={styles.methodDesc}>
                        {method === 'UPI' ? 'Instant zero fee settlement' : 'Secure 256-bit encrypted gateway'}
                      </Text>
                    </View>
                    <View style={[styles.radio, selectedMethod === method && styles.radioActive]} />
                  </TouchableOpacity>
                ))}

                <Button
                  title={loading ? 'Initiating Gateway...' : `Proceed to Pay ₹${order.total_amount}`}
                  variant="primary"
                  onPress={handleInitiatePayment}
                  loading={loading}
                  style={styles.payBtn}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  closeTxt: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  body: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  summaryCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 4,
  },
  summarySub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  methodIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  payBtn: {
    marginTop: 16,
    marginBottom: 20,
  },
  sessionContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qrSimulation: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
  },
  qrCodeIcon: {
    fontSize: 60,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  qrVpa: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
  },
  refInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  receiptContainer: {
    padding: 8,
  },
  receiptBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  invoiceNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  invoiceMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  billToName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  billToAddr: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemTitle: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  totalVal: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  grandTotalRow: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 6,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  txnRef: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  doneBtn: {
    marginTop: 20,
  },
});
