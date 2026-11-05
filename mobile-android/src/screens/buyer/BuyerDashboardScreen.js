// FarmConnect Complete Buyer Dashboard
// Phase 4 Deliverable: Product/Crop browsing, Cart, Wishlist, Checkout, and Order Fulfilment

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card, Badge, Button, Input, Header, LoadingIndicator } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../services/apiClient';

import CartModal from './CartModal';
import OrderTrackingModal from './OrderTrackingModal';

export default function BuyerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [dashboardData, setDashboardData] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showCart, setShowCart] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const loadData = async () => {
    try {
      const [dashRes, catRes, cartRes] = await Promise.all([
        apiClient.get('/buyer/dashboard'),
        apiClient.get(`/buyer/catalog?category=${activeCategory}&search=${searchQuery}`),
        apiClient.get('/buyer/cart'),
      ]);

      if (dashRes.success && dashRes.data && dashRes.data.buyer) {
        setDashboardData(dashRes.data);
      }

      if (catRes.success && catRes.data && catRes.data.items) {
        setCatalogItems(catRes.data.items);
      }

      if (cartRes.success && cartRes.data && cartRes.data.cart) {
        setCartCount(cartRes.data.cart.items.length);
      }
    } catch (err) {
      console.error('Error fetching buyer data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    showSuccess('Refreshed marketplace listings & prices', 'Updated');
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/buyer/catalog?category=${activeCategory}&search=${searchQuery}`);
      if (res.success && res.data && res.data.items) {
        setCatalogItems(res.data.items);
      }
    } catch (err) {
      showError(err.message, 'Search Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const res = await apiClient.post('/buyer/cart', {
        item_id: item.id,
        item_type: item.item_type,
        title: item.title,
        unit_price: item.price,
        quantity: 1,
        unit: item.unit,
      });

      if (res.success) {
        showSuccess(`${item.title} added to procurement cart!`, 'Cart Updated');
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      showError(err.message, 'Error');
    }
  };

  const handleToggleWishlist = async (item) => {
    try {
      const res = await apiClient.post('/buyer/wishlist', {
        item_id: item.id,
        item_type: item.item_type,
        title: item.title,
        unit_price: item.price,
        unit: item.unit,
      });

      if (res.success) {
        showSuccess(res.message, res.data?.action === 'ADDED' ? 'Saved' : 'Removed');
      }
    } catch (err) {
      showError(err.message, 'Error');
    }
  };

  const profile = dashboardData?.buyer?.profile || user?.profile || {};

  return (
    <View style={styles.container}>
      <Header
        title={profile.business_name || user?.name || 'Buyer Hub'}
        subtitle={`Procurement Hub • ${profile.buyer_type || 'Wholesaler'}`}
        rightAction={
          <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartIconBtn}>
            <Text style={styles.cartIconText}>🛒</Text>
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.skyBlue]} />}
      >
        {/* Search & Filter Bar */}
        <Card style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.inputCol}>
              <Input
                placeholder="Search crops, seeds, fertilizers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <Button title="Search" variant="primary" size="sm" onPress={handleSearch} style={styles.searchBtn} />
          </View>

          {/* Filter Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { id: 'ALL', label: 'All Listings' },
              { id: 'FARM_PRODUCE', label: '🌾 Farm Harvest' },
              { id: 'SEEDS', label: '🌱 Seeds' },
              { id: 'FERTILIZERS', label: '🧪 Fertilizers' },
              { id: 'TOOLS', label: '🔧 Farm Tools' },
              { id: 'EQUIPMENT', label: '⚙ Machinery' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, activeCategory === cat.id ? styles.filterChipActive : null]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[styles.filterText, activeCategory === cat.id ? styles.filterTextActive : null]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Quick Order Tracking Ticker */}
        <Card style={styles.trackingCard}>
          <View style={styles.trackHeader}>
            <Text style={styles.trackTitle}>📦 Consignment Tracking</Text>
            <Badge label="IN-TRANSIT" variant="info" size="sm" />
          </View>
          <Text style={styles.trackSub}>Consignment #FC-ORD-2026-59450 • 2 Bags Paddy Seeds</Text>
          <Button
            title="Track Consignment Timeline"
            variant="outline"
            size="sm"
            onPress={() => setSelectedOrderId('latest')}
            style={styles.trackBtn}
          />
        </Card>

        {/* Product & Crop Catalog Feed */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedTitle}>Available Harvest & Input Listings ({catalogItems.length})</Text>
          <Badge label="VERIFIED SELLERS" variant="success" size="sm" />
        </View>

        {isLoading ? (
          <LoadingIndicator message="Loading verified agricultural supply..." />
        ) : catalogItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌾</Text>
            <Text style={styles.emptyTitle}>No Listings Found</Text>
            <Text style={styles.emptySub}>Try searching for a different crop name or reset the category filter.</Text>
          </Card>
        ) : (
          catalogItems.map((item) => (
            <Card key={`${item.item_type}_${item.id}`} style={styles.catalogCard}>
              <View style={styles.itemTopRow}>
                <View style={styles.itemTitleCol}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSource}>{item.source_name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggleWishlist(item)} style={styles.wishBtn}>
                  <Text style={styles.wishHeart}>♥</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemDesc}>{item.description}</Text>

              <View style={styles.itemMetaRow}>
                <View>
                  <Text style={styles.itemPrice}>₹{item.price} <Text style={styles.itemUnit}>/ {item.unit}</Text></Text>
                  <Text style={styles.itemStock}>Stock Available: {item.stock_quantity} {item.unit}</Text>
                </View>
                <Badge label={`★ ${item.rating}`} variant="warning" size="sm" />
              </View>

              <View style={styles.itemActionRow}>
                <Button
                  title="+ Add to Procurement Cart"
                  variant="primary"
                  size="sm"
                  onPress={() => handleAddToCart(item)}
                  style={styles.addCartBtn}
                />
              </View>
            </Card>
          ))
        )}

        {/* Account Management & Sign Out */}
        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Session</Text>
          <Text style={styles.accountSub}>Signed in as {user?.email} • Verified Buyer / Trader</Text>
          <View style={styles.accountBtns}>
            <Button title="Profile Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.btnFlex} />
            <Button title="Sign Out" variant="danger" size="sm" onPress={logout} style={styles.btnFlex} />
          </View>
        </Card>
      </ScrollView>

      {/* Cart & Checkout Modal */}
      <CartModal
        visible={showCart}
        onClose={() => setShowCart(false)}
        onOrderPlaced={(order) => {
          setSelectedOrderId(order.id);
          setCartCount(0);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        visible={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </View>
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
  cartIconBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  cartIconText: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.amber,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  searchCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inputCol: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  searchBtn: {
    height: 50,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.skyBlueBg,
    borderColor: colors.skyBlue,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.skyBlue,
    fontWeight: typography.weights.bold,
  },
  trackingCard: {
    padding: spacing.md,
    backgroundColor: colors.skyBlueBg,
    borderColor: colors.skyBlue,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.skyBlue,
  },
  trackSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  trackBtn: {
    marginTop: 4,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  feedTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  catalogCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  itemSource: {
    fontSize: typography.sizes.xs,
    color: colors.primaryLight,
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  wishBtn: {
    padding: spacing.xs,
  },
  wishHeart: {
    fontSize: 20,
    color: colors.error,
  },
  itemDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
    lineHeight: typography.lineHeights.tight,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.soilBrown,
  },
  itemUnit: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  itemStock: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemActionRow: {
    marginTop: spacing.sm,
  },
  addCartBtn: {
    width: '100%',
  },
  accountCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  accountTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  accountSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accountBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnFlex: {
    flex: 1,
  },
});
