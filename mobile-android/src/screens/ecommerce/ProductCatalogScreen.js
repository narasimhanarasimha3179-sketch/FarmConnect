// FarmConnect Agricultural E-Commerce Catalog (Phase 7)
// Multi-category store covering all 10 verified agriculture input categories

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
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function ProductCatalogScreen({ onBack, onOpenCart }) {
  const { showSuccess, showError, showInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc', 'rating_desc'
  const [products, setProducts] = useState([]);

  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  async function loadCategories() {
    try {
      const res = await apiClient.get('/ecommerce/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.log('Categories load err:', err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sort', sortBy);

      const res = await apiClient.get(`/ecommerce/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      showError('Failed to load product catalog.', 'Catalog Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenDetail(prod) {
    setSelectedProduct(prod);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/ecommerce/products/${prod.id}`);
      if (res.data?.success) {
        setProductDetail(res.data.data);
      }
    } catch (err) {
      showError('Failed to load product specifications.', 'Product Error');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddToCart(item) {
    try {
      await apiClient.post('/buyer/cart', {
        item_id: item.id,
        item_type: 'PRODUCT',
        title: item.title,
        unit_price: item.price,
        unit: item.unit,
        quantity: 1,
      });
      showSuccess(`Added "${item.title}" to cart!`, 'Cart Updated');
    } catch (err) {
      showError(err.message || 'Could not add to cart.', 'Cart Error');
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title="Agri Inputs E-Commerce"
        subtitle="Certified seeds, bio-fertilizers, tools & equipment"
        onBack={onBack}
        rightAction={
          <Button
            title="Cart 🛒"
            size="sm"
            variant="outline"
            onPress={onOpenCart}
          />
        }
      />

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fertilizers, hybrid seeds, sprinklers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadProducts}
          returnKeyType="search"
          placeholderTextColor="#9ca3af"
        />
        <Button title="Search" size="sm" variant="primary" onPress={loadProducts} />
      </View>

      {/* Category Pills (All 10 Categories) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity
          style={[styles.catPill, selectedCategory === 'ALL' && styles.activeCatPill]}
          onPress={() => setSelectedCategory('ALL')}
        >
          <Text style={[styles.catPillText, selectedCategory === 'ALL' && styles.activeCatPillText]}>
            🌟 All Items
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catPill, selectedCategory === cat.key && styles.activeCatPill]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.catPillText, selectedCategory === cat.key && styles.activeCatPillText]}>
              {cat.icon} {cat.name} ({cat.itemCount})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        {[['newest', 'Newest'], ['price_asc', 'Price: Low-High'], ['price_desc', 'Price: High-Low'], ['rating_desc', 'Top Rated']].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            onPress={() => setSortBy(val)}
            style={[styles.sortChip, sortBy === val && styles.activeSortChip]}
          >
            <Text style={[styles.sortChipText, sortBy === val && styles.activeSortChipText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products Grid */}
      {loading ? (
        <LoadingIndicator text="Fetching verified agricultural inputs..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          message="No items match your filter criteria. Try clearing search or choosing another category."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.productList}>
          {products.map((item) => (
            <Card key={item.id} style={styles.productCard}>
              <View style={styles.productRow}>
                <Image
                  source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c' }}
                  style={styles.productThumb}
                />
                <View style={styles.productInfo}>
                  <View style={styles.badgeRow}>
                    <Badge label={item.category.replace('_', ' ')} variant="neutral" />
                    <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                  </View>
                  <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.sellerName}>Seller: {item.shop_name || 'Cauvery Agri Inputs'}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    <Text style={styles.unitText}>/ {item.unit}</Text>
                    <Text style={styles.stockText}>• {item.stock_quantity > 0 ? `In Stock (${item.stock_quantity})` : 'Out of Stock'}</Text>
                  </View>

                  <View style={styles.btnRow}>
                    <Button
                      title="Details"
                      variant="outline"
                      size="sm"
                      onPress={() => handleOpenDetail(item)}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="+ Add to Cart"
                      variant="primary"
                      size="sm"
                      disabled={item.stock_quantity <= 0}
                      onPress={() => handleAddToCart(item)}
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* PRODUCT DETAIL MODAL */}
      <Modal visible={!!selectedProduct} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.detailModalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
              <View style={styles.detailHeader}>
                <Badge label={selectedProduct?.category?.replace('_', ' ') || 'PRODUCT'} variant="success" />
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.closeBtn}>✕ Close</Text>
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: selectedProduct?.image_url }}
                style={styles.detailImage}
              />

              <Text style={styles.detailTitle}>{selectedProduct?.title}</Text>
              <Text style={styles.detailPrice}>₹{selectedProduct?.price} <Text style={styles.detailUnit}>/ {selectedProduct?.unit}</Text></Text>

              <Card style={styles.specsBox}>
                <Text style={styles.specsTitle}>Product Specifications & Advisory</Text>
                <Text style={styles.specsDesc}>{selectedProduct?.description}</Text>
                <Text style={styles.specsDetail}>
                  <Text style={styles.boldText}>Authorized Merchant: </Text>
                  {productDetail?.shop_name || 'Cauvery Seeds & Fertilizers'}
                </Text>
                <Text style={styles.specsDetail}>
                  <Text style={styles.boldText}>License: </Text>
                  {productDetail?.license_number || 'KA-AGRI-4821'}
                </Text>
                <Text style={styles.specsDetail}>
                  <Text style={styles.boldText}>Store Depot: </Text>
                  {productDetail?.store_address || 'Mandya Industrial Estate, KA'}
                </Text>
              </Card>

              {/* Verified Customer Reviews */}
              <Text style={styles.sectionTitle}>Customer Feedback & Field Reports</Text>
              {productDetail?.reviews && productDetail.reviews.length > 0 ? (
                productDetail.reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewItem}>
                    <Text style={styles.reviewerName}>{rev.user_name} • ⭐ {rev.rating}/5</Text>
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviews}>No customer reviews yet for this product.</Text>
              )}

              <View style={{ marginTop: spacing.md }}>
                <Button
                  title="Add to Shopping Cart"
                  variant="primary"
                  size="md"
                  onPress={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
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
  categoryScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#ffffff',
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: spacing.xs,
  },
  activeCatPill: {
    backgroundColor: colors.primary,
  },
  catPillText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  activeCatPillText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  sortChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 4,
  },
  activeSortChip: {
    backgroundColor: '#e0e7ff',
  },
  sortChipText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  activeSortChipText: {
    color: '#4338ca',
    fontWeight: typography.weights.bold,
  },
  productList: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  productCard: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  productThumb: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#f59e0b',
  },
  productTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  sellerName: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  unitText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginLeft: 2,
  },
  stockText: {
    fontSize: typography.sizes.xs,
    color: '#059669',
    marginLeft: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  detailModalCard: {
    maxHeight: '90%',
    padding: spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  closeBtn: {
    fontSize: typography.sizes.sm,
    color: '#ef4444',
    fontWeight: typography.weights.bold,
  },
  detailImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  detailTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  detailPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: 2,
  },
  detailUnit: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
  },
  specsBox: {
    padding: spacing.sm,
    backgroundColor: '#f9fafb',
    marginVertical: spacing.sm,
  },
  specsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#374151',
    marginBottom: 4,
  },
  specsDesc: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  specsDetail: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: spacing.xs,
  },
  reviewerName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  reviewComment: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginTop: 2,
  },
  noReviews: {
    fontSize: typography.sizes.xs,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
