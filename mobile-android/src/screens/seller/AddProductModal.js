// FarmConnect Add & Edit Product Modal for Sellers
// Comprehensive catalog editor for agricultural inputs, seeds, fertilizers, and tools

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Badge, Button, Input, Header } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../services/apiClient';

export default function AddProductModal({ visible, onClose, onProductSaved }) {
  const { showSuccess, showError } = useNotification();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FERTILIZERS');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('bag (25kg)');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'SEEDS', label: '🌱 Seeds' },
    { id: 'FERTILIZERS', label: '🧪 Fertilizers' },
    { id: 'TOOLS', label: '🔧 Farm Tools' },
    { id: 'EQUIPMENT', label: '⚙ Machinery' },
    { id: 'PESTICIDES', label: '🛡 Crop Care' },
  ];

  const handleSave = async () => {
    if (!title || !price || !stockQuantity) {
      showError('Please enter product title, price, and available stock', 'Missing Information');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/seller/products', {
        title,
        category,
        price: Number(price),
        unit,
        stock_quantity: Number(stockQuantity),
        description: description || 'Certified genuine agricultural product.',
      });

      if (res.success) {
        showSuccess(`${title} listed in your inventory!`, 'Product Added');
        if (onProductSaved) onProductSaved(res.data.product);
        onClose();
        setTitle('');
        setPrice('');
        setDescription('');
      } else {
        showError(res.message || 'Failed to add product', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Header
          title="Add New Agri Product"
          subtitle="Stock & Inventory Catalogue"
          onBack={onClose}
          rightAction={<Badge label="SELLER" variant="seller" />}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>📦 Product Identification</Text>
            <Input
              label="Product Title"
              placeholder="e.g. Bio-Potash Organic Fertilizer 25kg"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Select Category</Text>
            <View style={styles.catPills}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catPill, category === c.id ? styles.catPillActive : null]}
                  onPress={() => setCategory(c.id)}
                >
                  <Text style={[styles.catText, category === c.id ? styles.catTextActive : null]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Retail Price (₹)"
              placeholder="e.g. 750"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Input
              label="Selling Unit"
              placeholder="e.g. bag (25kg), bottle (1L), pack (5kg)"
              value={unit}
              onChangeText={setUnit}
            />

            <Input
              label="Current Stock Quantity Available"
              placeholder="e.g. 100"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="numeric"
            />

            <Input
              label="Product Description / Specifications"
              placeholder="e.g. 100% natural potash derived from molasses and bio-culture..."
              value={description}
              onChangeText={setDescription}
            />

            <Button
              title="Add Product to Store"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onPress={handleSave}
              style={styles.saveBtn}
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
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.soilBrown,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  catPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  catPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catPillActive: {
    backgroundColor: colors.amberLight,
    borderColor: colors.amber,
  },
  catText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  catTextActive: {
    color: colors.soilBrown,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
