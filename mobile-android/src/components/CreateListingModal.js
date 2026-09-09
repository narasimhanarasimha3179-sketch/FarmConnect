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

const CATEGORIES = ['Cereals', 'Vegetables', 'Pulses', 'Oilseeds', 'Commercial'];
const GRADES = ['Grade A+', 'Grade A', 'Grade B+', 'Grade B'];

export default function CreateListingModal({ visible, onClose, onListingCreated }) {
  const [commodity, setCommodity] = useState('');
  const [category, setCategory] = useState('Cereals');
  const [quantity, setQuantity] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCommodity('');
    setCategory('Cereals');
    setQuantity('');
    setBasePrice('');
    setQualityGrade('Grade A');
    setLocation('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePublish = () => {
    const trimmedCommodity = commodity.trim();
    const trimmedQuantity = quantity.trim();
    const numericBasePrice = parseFloat(basePrice.trim());
    const trimmedLocation = location.trim();

    if (!trimmedCommodity) {
      Alert.alert('Validation Error', 'Please enter crop or commodity name.');
      return;
    }
    if (!trimmedQuantity || isNaN(parseFloat(trimmedQuantity)) || parseFloat(trimmedQuantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive quantity in Quintals.');
      return;
    }
    if (!numericBasePrice || isNaN(numericBasePrice) || numericBasePrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid base floor price in ₹.');
      return;
    }
    if (!trimmedLocation) {
      Alert.alert('Validation Error', 'Please specify your farm / district location.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onListingCreated({
        id: 'lot_' + Date.now(),
        farmerName: 'You (Verified Farmer)',
        location: trimmedLocation,
        commodity: trimmedCommodity,
        category,
        quantity: `${trimmedQuantity} Quintals`,
        basePrice: `₹ ${numericBasePrice.toLocaleString('en-IN')} / Qtl`,
        currentBid: `₹ ${numericBasePrice.toLocaleString('en-IN')} / Qtl`,
        totalBids: 0,
        harvestDate: 'Listed just now',
        qualityGrade,
        status: 'Live Bidding',
      });
      resetForm();
      Alert.alert('Listing Live', 'Your harvest lot is now active on the direct market feed.');
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeBtnText}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Harvest Lot</Text>
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
            {/* Commodity Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Commodity / Crop Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sona Masuri Paddy, Hybrid Tomato"
                placeholderTextColor={COLORS.textMuted}
                value={commodity}
                onChangeText={setCommodity}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Category</Text>
              <View style={styles.choiceRow}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.choicePill, isActive && styles.choicePillActive]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.choiceText, isActive && styles.choiceTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quantity and Grade Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flexContainer]}>
                <Text style={styles.label}>Total Quantity (Quintals)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 85"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={[styles.inputGroup, styles.flexContainer]}>
                <Text style={styles.label}>Base Price (₹ / Qtl)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2350"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={basePrice}
                  onChangeText={setBasePrice}
                />
              </View>
            </View>

            {/* Quality Grade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quality / Purity Grade</Text>
              <View style={styles.choiceRow}>
                {GRADES.map((grade) => {
                  const isActive = qualityGrade === grade;
                  return (
                    <TouchableOpacity
                      key={grade}
                      style={[styles.choicePill, isActive && styles.choicePillActive]}
                      onPress={() => setQualityGrade(grade)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.choiceText, isActive && styles.choiceTextActive]}>
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Farm Pickup Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Pickup Location (District, State)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mandya, Karnataka"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Submission CTA */}
            <CustomButton
              title="Publish Harvest Lot to Market"
              onPress={handlePublish}
              loading={loading}
              style={styles.submitBtn}
            />
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
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choicePillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  choiceTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
});