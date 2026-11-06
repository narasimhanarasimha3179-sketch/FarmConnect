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
  Modal,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card, Badge, Button, Input, Header, LoadingIndicator } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../services/apiClient';

import CartModal from './CartModal';
import OrderTrackingModal from './OrderTrackingModal';

export default function BuyerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Enhanced Features
  const [showCart, setShowCart] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Price Negotiation State
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [selectedCropItem, setSelectedCropItem] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('10');
  const [bidMsg, setBidMsg] = useState('Immediate pickup with prompt RTGS/UPI payment.');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [buyerEnquiries, setBuyerEnquiries] = useState([]);

  // Tax Invoice & QC Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Bulk Forward Contract Estimator
  const [forwardCommodity, setForwardCommodity] = useState('Paddy Sona Masoori');
  const [forwardTonnes, setForwardTonnes] = useState('25');
  const [forwardDays, setForwardDays] = useState('30');

  const loadData = async () => {
    try {
      const [dashRes, catRes, cartRes, enqRes] = await Promise.all([
        apiClient.get('/buyer/dashboard'),
        apiClient.get(`/buyer/catalog?category=${activeCategory}&search=${searchQuery}`),
        apiClient.get('/buyer/cart'),
        apiClient.get('/crop-market/buyer/enquiries'),
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

      const eData = enqRes.data || enqRes;
      if (eData?.success && eData.data) {
        setBuyerEnquiries(eData.data);
      }
    } catch (err) {
      console.error('Error fetching buyer data:', err);
    }
  };

  const handleOpenNegotiate = (item) => {
    setSelectedCropItem(item);
    setBidPrice(String(item.price ? Math.round(item.price * 0.95) : 3000));
    setBidQty(String(Math.min(item.stock_quantity || 10, 20)));
    setShowNegotiateModal(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!bidPrice || !bidQty || !selectedCropItem) {
      showError('Offered price and quantity are required.', 'Missing Info');
      return;
    }
    setIsSubmittingBid(true);
    try {
      const res = await apiClient.post('/crop-market/enquiries', {
        crop_id: selectedCropItem.id,
        offered_price: Number(bidPrice),
        quantity_requested: Number(bidQty),
        unit: selectedCropItem.unit || 'Quintal',
        message: bidMsg,
      });
      const data = res.data || res;
      if (data?.success || res.success) {
        showSuccess(`Counter-offer of ₹${bidPrice}/qtl submitted to farmer!`, 'Offer Dispatched');
        setShowNegotiateModal(false);
        await loadData();
      } else {
        showError(data?.message || res.message || 'Failed to submit counter-offer', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsSubmittingBid(false);
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
        {/* Buyer Commercial Enterprise & Profile Card */}
        <Card style={styles.profileSummaryCard}>
          <View style={styles.profileSummaryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.enterpriseName}>{profile.business_name || 'Kiran Wholesales & Grain Depot'}</Text>
              <Text style={styles.enterpriseRole}>Licensed APMC Wholesaler & Food Stockist</Text>
            </View>
            <Badge label="VERIFIED BUYER" variant="success" size="sm" />
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.profileMetaRow}>
            <Text style={styles.profileMetaLabel}>GSTIN / License:</Text>
            <Text style={styles.profileMetaVal}>{profile.gst_number || '29ABCDE1234F1Z5'}</Text>
          </View>
          <View style={styles.profileMetaRow}>
            <Text style={styles.profileMetaLabel}>Delivery Yard:</Text>
            <Text style={styles.profileMetaVal} numberOfLines={1}>
              {profile.delivery_address || 'Shop #12, APMC Market Yard, Mandya'}
            </Text>
          </View>
          <View style={styles.profileMetaRow}>
            <Text style={styles.profileMetaLabel}>Authorized Contact:</Text>
            <Text style={styles.profileMetaVal}>{user?.name} ({user?.phone || '9845012346'})</Text>
          </View>
          <TouchableOpacity onPress={onOpenProfile} style={styles.editProfilePill}>
            <Text style={styles.editProfileText}>Manage Trade Profile & Address →</Text>
          </TouchableOpacity>
        </Card>

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
            <Text style={styles.trackTitle}>📦 Consignment Tracking & Invoices</Text>
            <Badge label="IN-TRANSIT" variant="info" size="sm" />
          </View>
          <Text style={styles.trackSub}>Consignment #FC-ORD-2026-59450 • 2 Bags Paddy Seeds (Sona Masoori)</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
            <Button
              title="Track Consignment"
              variant="outline"
              size="sm"
              onPress={() => setSelectedOrderId('latest')}
              style={{ flex: 1 }}
            />
            <Button
              title="📄 Tax Invoice & QC"
              variant="secondary"
              size="sm"
              onPress={() => setShowInvoiceModal(true)}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* My Active Counter-Offers & Enquiries */}
        {buyerEnquiries.length > 0 ? (
          <Card style={styles.enquiriesCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>💬 Direct Farmer Negotiations ({buyerEnquiries.length})</Text>
              <Badge label="BID TRACKER" variant="primary" size="sm" />
            </View>
            <Text style={styles.enquirySub}>Real-time status of your price counter-offers submitted to farmers.</Text>
            {buyerEnquiries.map((enq) => (
              <View key={enq.id} style={styles.enquiryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.enquiryCrop}>{enq.crop_name} ({enq.variety})</Text>
                  <Text style={styles.enquiryMeta}>
                    Offered: <Text style={{ fontWeight: 'bold', color: colors.primary }}>₹{enq.offered_price}/qtl</Text> • Qty: {enq.quantity_requested} {enq.unit || 'qtl'}
                  </Text>
                  <Text style={styles.enquiryLoc}>📍 APMC Yard: {enq.mandi_location || 'Mandya Yard'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Badge
                    label={enq.status}
                    variant={enq.status === 'ACCEPTED' ? 'success' : enq.status === 'DECLINED' ? 'error' : 'warning'}
                    size="sm"
                  />
                  <Text style={styles.enquiryTime}>{new Date(enq.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Bulk Forward Contract Estimator */}
        <Card style={styles.forwardCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📑 Bulk Procurement Forward Contract Estimator</Text>
            <Badge label="INSTITUTIONAL BUYER" variant="info" size="sm" />
          </View>
          <Text style={styles.forwardSub}>Pre-book harvest volumes with locked-in APMC floor rates & 10% token deposit.</Text>

          <View style={styles.forwardInputsRow}>
            <View style={{ flex: 1 }}>
              <Input label="Commodity" value={forwardCommodity} onChangeText={setForwardCommodity} />
            </View>
            <View style={{ width: 100 }}>
              <Input label="Tonnes" value={forwardTonnes} onChangeText={setForwardTonnes} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.forwardResultBox}>
            <View style={styles.forwardStat}>
              <Text style={styles.forwardVal}>
                ₹{((Number(forwardTonnes) || 1) * 31500).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.forwardLbl}>Est. Contract Value</Text>
            </View>
            <View style={styles.forwardStat}>
              <Text style={[styles.forwardVal, { color: colors.success }]}>
                ₹{Math.round(((Number(forwardTonnes) || 1) * 31500) * 0.1).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.forwardLbl}>10% Token Advance</Text>
            </View>
            <View style={styles.forwardStat}>
              <Text style={[styles.forwardVal, { color: colors.primary }]}>5% Rebate</Text>
              <Text style={styles.forwardLbl}>Volume Tier</Text>
            </View>
          </View>
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
                  title="+ Add to Cart"
                  variant="primary"
                  size="sm"
                  onPress={() => handleAddToCart(item)}
                  style={styles.addCartBtn}
                />
                {item.item_type === 'CROP' ? (
                  <Button
                    title="💬 Negotiate Price"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleOpenNegotiate(item)}
                    style={{ flex: 1, marginLeft: spacing.xs }}
                  />
                ) : null}
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
          loadData();
        }}
        onOpenTracking={(orderId) => {
          setSelectedOrderId(orderId);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        visible={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Price Counter-Offer / Negotiation Modal */}
      <Modal visible={showNegotiateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>💬 Direct Farmer Price Negotiation</Text>
            <Text style={styles.modalSub}>
              Propose a counter-bid to the farmer for {selectedCropItem?.title}.
            </Text>

            <Input
              label="Offered Price (₹ / Quintal)"
              placeholder="e.g. 3100"
              value={bidPrice}
              onChangeText={setBidPrice}
              keyboardType="numeric"
            />
            <Input
              label="Required Quantity (Quintals)"
              placeholder="e.g. 20"
              value={bidQty}
              onChangeText={setBidQty}
              keyboardType="numeric"
            />
            <Input
              label="Pickup / Payment Terms"
              value={bidMsg}
              onChangeText={setBidMsg}
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" variant="outline" size="md" onPress={() => setShowNegotiateModal(false)} style={styles.btnFlex} />
              <Button title="Send Counter-Offer" variant="primary" size="md" loading={isSubmittingBid} onPress={handleSubmitCounterOffer} style={styles.btnFlex} />
            </View>
          </Card>
        </View>
      </Modal>

      {/* GST Tax Invoice & Quality Certification Modal */}
      <Modal visible={showInvoiceModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceTitle}>TAX INVOICE & QC CERTIFICATE</Text>
                <Text style={styles.invoiceSub}>Original for Recipient • FSSAI Lic: 1122333400012</Text>
              </View>
              <Badge label="GST COMPLIANT" variant="success" size="sm" />
            </View>

            <View style={styles.invoiceDivider} />

            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>Consignment:</Text>
              <Text style={styles.invoiceVal}>#FC-ORD-2026-59450</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>Billed To:</Text>
              <Text style={styles.invoiceVal}>{profile.business_name || 'Kiran Wholesales'}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>Buyer GSTIN:</Text>
              <Text style={styles.invoiceVal}>{profile.gst_number || '29ABCDE1234F1Z5'}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>Item / HSN Code:</Text>
              <Text style={styles.invoiceVal}>Paddy Sona Masoori (HSN 1006)</Text>
            </View>

            <View style={styles.qcBox}>
              <Text style={styles.qcTitle}>🌾 Certified Agri-Lab Quality Report:</Text>
              <Text style={styles.qcText}>• Grain Moisture: 12.2% (Optimal standard &lt; 14%)</Text>
              <Text style={styles.qcText}>• Foreign Matter: 0.2% • Broken Grains: 1.1%</Text>
              <Text style={styles.qcText}>• Grade: Grade A Certified by KSAMB Lab Mandya</Text>
            </View>

            <View style={styles.invoiceDivider} />

            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>Taxable Amount:</Text>
              <Text style={styles.invoiceVal}>₹24,000.00</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>CGST (2.5%):</Text>
              <Text style={styles.invoiceVal}>₹600.00</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLbl}>SGST (2.5%):</Text>
              <Text style={styles.invoiceVal}>₹600.00</Text>
            </View>

            <View style={styles.invoiceTotalRow}>
              <Text style={styles.invoiceTotalLbl}>Total Invoice Value:</Text>
              <Text style={styles.invoiceTotalVal}>₹25,200.00</Text>
            </View>

            <Button
              title="Close Tax Invoice"
              variant="outline"
              size="md"
              onPress={() => setShowInvoiceModal(false)}
              style={{ marginTop: spacing.md }}
            />
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
  profileSummaryCard: {
    padding: spacing.md,
    backgroundColor: '#F0F7FF',
    borderColor: '#B3D7FF',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  profileSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  enterpriseName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  enterpriseRole: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#D0E3F7',
    marginVertical: spacing.xs,
  },
  profileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  profileMetaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  profileMetaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '65%',
  },
  editProfilePill: {
    marginTop: spacing.xs,
    paddingVertical: 4,
    alignItems: 'flex-end',
  },
  editProfileText: {
    fontSize: 12,
    color: colors.skyBlue,
    fontWeight: typography.weights.bold,
  },
  // Enquiries & Negotiations
  enquiriesCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  enquirySub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  enquiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  enquiryCrop: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  enquiryMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  enquiryLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  enquiryTime: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Forward Contract
  forwardCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#F7FBFF',
    borderColor: colors.skyBlue,
    borderWidth: 1.5,
  },
  forwardSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  forwardInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  forwardResultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  forwardStat: {
    alignItems: 'center',
    flex: 1,
  },
  forwardVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  forwardLbl: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Modals & Invoices
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
    color: colors.primary,
    marginBottom: 2,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  invoiceSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  invoiceLbl: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  invoiceVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  qcBox: {
    backgroundColor: '#F3FAF4',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginVertical: spacing.xs,
  },
  qcTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  qcText: {
    fontSize: 10,
    color: colors.textPrimary,
    marginTop: 1,
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  invoiceTotalLbl: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  invoiceTotalVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
