// FarmConnect Crop Marketplace (Phase 8)
// Direct Farmer-to-Buyer wholesale produce trade, grade ratings, harvest calendar & enquiries

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function CropMarketplaceScreen({ onBack }) {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // New Listing Modal (Farmer)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('Quintal');
  const [newPrice, setNewPrice] = useState('');
  const [newMandi, setNewMandi] = useState('Mandya APMC Hub');
  const [newGrade, setNewGrade] = useState('Grade A');
  const [newHarvestDate, setNewHarvestDate] = useState('2026-11-25');
  const [newDesc, setNewDesc] = useState('');
  const [submittingCrop, setSubmittingCrop] = useState(false);

  // Enquiry / Price Bid Modal (Buyer)
  const [enquiryCrop, setEnquiryCrop] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  useEffect(() => {
    loadCropListings();
  }, [selectedGrade, sortBy]);

  async function loadCropListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== 'ALL') params.append('quality_grade', selectedGrade);
      if (searchCrop.trim()) params.append('crop_name', searchCrop.trim());
      if (sortBy) params.append('sort', sortBy);

      const res = await apiClient.get(`/crop-market/listings?${params.toString()}`);
      if (res.data?.success) {
        setCrops(res.data.data);
      }
    } catch (err) {
      showError('Failed to load crop marketplace listings.', 'Market Error');
    } finally {
      setLoading(false);
    }
  }

  // Farmer creates new listing
  async function handleCreateListing() {
    if (!newCropName || !newVariety || !newQty || !newPrice) {
      showError('Please fill in crop name, variety, quantity and price.', 'Validation');
      return;
    }
    setSubmittingCrop(true);
    try {
      const res = await apiClient.post('/crop-market/listings', {
        crop_name: newCropName,
        variety: newVariety,
        quantity_available: parseFloat(newQty),
        unit: newUnit,
        expected_price: parseFloat(newPrice),
        mandi_location: newMandi,
        quality_grade: newGrade,
        harvest_date: newHarvestDate,
        description: newDesc,
      });
      if (res.data?.success) {
        showSuccess(`Harvest listing for ${newCropName} published!`, 'Listing Active');
        setShowAddModal(false);
        setNewCropName('');
        setNewVariety('');
        setNewQty('');
        setNewPrice('');
        loadCropListings();
      }
    } catch (err) {
      showError(err.message || 'Failed to publish crop harvest.', 'Publish Error');
    } finally {
      setSubmittingCrop(false);
    }
  }

  // Buyer submits procurement enquiry / bid
  async function handleSubmitEnquiry() {
    if (!offeredPrice || !reqQty) {
      showError('Please enter your offer price and requested quantity.', 'Validation');
      return;
    }
    setSubmittingEnquiry(true);
    try {
      const res = await apiClient.post('/crop-market/enquiries', {
        crop_id: enquiryCrop.id,
        offered_price: parseFloat(offeredPrice),
        quantity_requested: parseFloat(reqQty),
        unit: enquiryCrop.unit,
        message: enquiryMessage,
      });
      if (res.data?.success) {
        showSuccess(`Direct procurement bid sent to ${enquiryCrop.farmer_name}!`, 'Bid Submitted');
        setEnquiryCrop(null);
        setOfferedPrice('');
        setReqQty('');
        setEnquiryMessage('');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit buyer enquiry.', 'Bid Error');
    } finally {
      setSubmittingEnquiry(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title="Direct Crop Marketplace"
        subtitle="Trade farm harvests directly with verified farmers"
        onBack={onBack}
        rightAction={
          user?.role === 'FARMER' || user?.role === 'ADMIN' ? (
            <Button
              title="+ List Produce"
              size="sm"
              variant="primary"
              onPress={() => setShowAddModal(true)}
            />
          ) : null
        }
      />

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Paddy, Sugarcane, Ragi, Onions..."
          value={searchCrop}
          onChangeText={setSearchCrop}
          onSubmitEditing={loadCropListings}
          placeholderTextColor="#9ca3af"
        />
        <Button title="Search" size="sm" variant="primary" onPress={loadCropListings} />
      </View>

      {/* Grade Filters */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Quality Grade:</Text>
        {['ALL', 'Grade A', 'Grade B'].map((grade) => (
          <TouchableOpacity
            key={grade}
            style={[styles.gradePill, selectedGrade === grade && styles.activeGradePill]}
            onPress={() => setSelectedGrade(grade)}
          >
            <Text style={[styles.gradeText, selectedGrade === grade && styles.activeGradeText]}>
              {grade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listings */}
      {loading ? (
        <LoadingIndicator text="Loading verified farm harvests..." />
      ) : crops.length === 0 ? (
        <EmptyState
          title="No Crop Listings Found"
          message="No farmers currently have active harvest batches matching your criteria."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.cropList}>
          {crops.map((crop) => (
            <Card key={crop.id} style={styles.cropCard}>
              <View style={styles.cropRow}>
                <Image
                  source={{ uri: crop.image_url || 'https://images.unsplash.com/photo-1596704017254-9b121068fb31' }}
                  style={styles.cropImage}
                />
                <View style={styles.cropInfo}>
                  <View style={styles.badgeRow}>
                    <Badge label={crop.quality_grade} variant="success" />
                    <Badge label={crop.status} variant="neutral" />
                  </View>

                  <Text style={styles.cropName}>{crop.crop_name}</Text>
                  <Text style={styles.varietyText}>Variety: {crop.variety}</Text>
                  <Text style={styles.farmerText}>Farmer: {crop.farmer_name} • 📍 {crop.mandi_location}</Text>

                  <View style={styles.metricRow}>
                    <View>
                      <Text style={styles.metricLabel}>Expected Rate</Text>
                      <Text style={styles.metricValue}>₹{crop.expected_price} <Text style={styles.metricUnit}>/{crop.unit}</Text></Text>
                    </View>
                    <View style={{ marginLeft: spacing.md }}>
                      <Text style={styles.metricLabel}>Available Lot</Text>
                      <Text style={styles.lotValue}>{crop.quantity_available} {crop.unit}</Text>
                    </View>
                  </View>

                  <Text style={styles.harvestDateText}>📅 Harvest Date: {crop.harvest_date}</Text>

                  <View style={styles.btnRow}>
                    <Button
                      title="Make an Offer / Bid"
                      variant="primary"
                      size="sm"
                      onPress={() => {
                        setEnquiryCrop(crop);
                        setOfferedPrice(crop.expected_price.toString());
                        setReqQty(crop.quantity_available.toString());
                      }}
                      style={styles.flexBtn}
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* BUYER PRICE BID & ENQUIRY MODAL */}
      <Modal visible={!!enquiryCrop} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Offer: {enquiryCrop?.crop_name}</Text>
            <Text style={styles.modalSub}>
              Farmer: {enquiryCrop?.farmer_name} • Asking: ₹{enquiryCrop?.expected_price}/{enquiryCrop?.unit}
            </Text>

            <Text style={styles.inputLabel}>Your Offered Price (₹/{enquiryCrop?.unit})</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={offeredPrice}
              onChangeText={setOfferedPrice}
              placeholder="e.g. 3200"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Quantity Required ({enquiryCrop?.unit})</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={reqQty}
              onChangeText={setReqQty}
              placeholder={`Max ${enquiryCrop?.quantity_available}`}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Message to Farmer</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              multiline
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              placeholder="e.g. We require delivery at Mandya APMC yard next week."
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setEnquiryCrop(null)}
                style={styles.flexBtn}
              />
              <Button
                title="Send Offer"
                variant="primary"
                size="sm"
                disabled={submittingEnquiry}
                onPress={handleSubmitEnquiry}
                style={styles.flexBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* FARMER ADD CROP LISTING MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.sm }}>
              <Text style={styles.modalTitle}>🌾 List Harvest Produce</Text>
              <Text style={styles.modalSub}>Post your crop to wholesale buyers across Karnataka</Text>

              <Text style={styles.inputLabel}>Crop Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Sona Masoori Paddy, Sugarcane"
                value={newCropName}
                onChangeText={setNewCropName}
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Variety *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Co 86032, Raw Fine Grain"
                value={newVariety}
                onChangeText={setNewVariety}
                placeholderTextColor="#9ca3af"
              />

              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="100"
                    value={newQty}
                    onChangeText={setNewQty}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newUnit}
                    onChangeText={setNewUnit}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Expected Price (₹/unit) *</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="2450"
                value={newPrice}
                onChangeText={setNewPrice}
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Mandi / Delivery Location</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Mandya APMC Hub"
                value={newMandi}
                onChangeText={setNewMandi}
                placeholderTextColor="#9ca3af"
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowAddModal(false)}
                  style={styles.flexBtn}
                />
                <Button
                  title="Publish Listing"
                  variant="primary"
                  size="sm"
                  disabled={submittingCrop}
                  onPress={handleCreateListing}
                  style={styles.flexBtn}
                />
              </View>
            </ScrollView>
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  gradePill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 4,
    backgroundColor: '#f3f4f6',
  },
  activeGradePill: {
    backgroundColor: '#16a34a',
  },
  gradeText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  activeGradeText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  cropList: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  cropCard: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  cropRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cropImage: {
    width: 100,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cropInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  cropName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  varietyText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  farmerText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#16a34a',
  },
  metricUnit: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  lotValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  harvestDateText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  btnRow: {
    marginTop: spacing.xs,
  },
  flexBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    padding: spacing.md,
    maxHeight: '90%',
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
    marginBottom: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.sm,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
