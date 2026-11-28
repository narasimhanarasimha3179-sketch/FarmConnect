// FarmConnect 2.0 — Public Agricultural Homepage
// Modern Amazon/Flipkart/Shopify-inspired agricultural discovery storefront

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card, Badge, Button, LoadingIndicator } from '../../components/common';
import LanguageSelector from '../../components/common/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

export default function PublicHomeScreen({
  onNavigateShop,
  onNavigateCropMarket,
  onNavigateMandi,
  onNavigateWeather,
  onNavigateAi,
  onNavigateKnowledge,
  onNavigateSchemes,
  onNavigateLogin,
  onNavigateRegister,
  onOpenCart,
  cartCount = 0,
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [mandiHighlights, setMandiHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 10 Official Agricultural Categories with authentic icons and metadata
  const standardCategories = [
    { id: 'SEEDS', name: 'Seeds', icon: '🌱', desc: 'Hybrid, OPV & certified grains' },
    { id: 'FERTILIZERS', name: 'Fertilizers', icon: '🧪', desc: 'NPK, Urea, DAP & micronutrients' },
    { id: 'ORGANIC', name: 'Organic Products', icon: '🌿', desc: 'Bio-fertilizers & vermicompost' },
    { id: 'PESTICIDES', name: 'Pesticides & Protection', icon: '🛡️', desc: 'Fungicides, insecticides & IPM' },
    { id: 'IRRIGATION', name: 'Irrigation Equipment', icon: '💧', desc: 'Drip, sprinklers, pipes & motors' },
    { id: 'TOOLS', name: 'Farming Tools', icon: '⛏️', desc: 'Sprayers, pruning tools & hoes' },
    { id: 'MACHINERY', name: 'Agricultural Machinery', icon: '🚜', desc: 'Tillers, weeders, harvesters' },
    { id: 'ANIMAL_FEED', name: 'Animal Feed', icon: '🐄', desc: 'Cattle feed, mineral mix & fodder' },
    { id: 'CROP_PRODUCE', name: 'Crop Produce', icon: '🌾', desc: 'Fresh farm-gate wholesale crops' },
    { id: 'SUPPLIES', name: 'Other Supplies', icon: '📦', desc: 'Tarpaulins, crates & packaging' },
  ];

  useEffect(() => {
    loadPublicData();
  }, []);

  async function loadPublicData() {
    setLoading(true);
    try {
      // 1. Load Categories
      const catRes = await apiClient.get('/ecommerce/categories');
      if (catRes.data?.success && catRes.data.data?.length > 0) {
        setCategories(catRes.data.data);
      } else {
        setCategories(standardCategories);
      }

      // 2. Load Featured Products
      const prodRes = await apiClient.get('/ecommerce/products?limit=8');
      if (prodRes.data?.success) {
        setFeaturedProducts(prodRes.data.data.slice(0, 6));
      }

      // 3. Load Mandi Highlights
      const mandiRes = await apiClient.get('/mandi');
      if (mandiRes.data?.success && Array.isArray(mandiRes.data.data)) {
        setMandiHighlights(mandiRes.data.data.slice(0, 4));
      }
    } catch (err) {
      console.log('Public data fetch error:', err.message);
      setCategories(standardCategories);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onNavigateShop) {
      onNavigateShop(searchQuery.trim());
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. TOP HEADER (Amazon / Shopify style) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          
          {/* Logo & Brand */}
          <TouchableOpacity style={styles.brandContainer} onPress={() => {}}>
            <Text style={styles.brandIcon}>🌱</Text>
            <View>
              <Text style={styles.brandTitle}>FarmConnect</Text>
              <Text style={styles.brandSubtitle}>AGRICULTURAL OS</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Search Bar */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search seeds, fertilizers, machinery, crop produce..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Right Action Bar */}
          <View style={styles.headerActions}>
            <LanguageSelector compact />
            
            <TouchableOpacity style={styles.cartBtn} onPress={onOpenCart}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInBtn} onPress={onNavigateLogin}>
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.getStartedBtn} onPress={onNavigateRegister}>
              <Text style={styles.getStartedBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Navigation Ribbon (Desktop / Tablet) */}
        <View style={styles.navRibbon}>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateShop}>
            <Text style={styles.navItemText}>🏪 Shop Inputs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateCropMarket}>
            <Text style={styles.navItemText}>🌾 Crop Marketplace</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateMandi}>
            <Text style={styles.navItemText}>📊 Mandi Prices</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateWeather}>
            <Text style={styles.navItemText}>⛅ Weather Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateAi}>
            <Text style={styles.navItemText}>🤖 AI Agriculture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateKnowledge}>
            <Text style={styles.navItemText}>📚 Knowledge Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateSchemes}>
            <Text style={styles.navItemText}>🏛️ Government Schemes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. HERO BANNER */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <Badge label="INDIA'S TRUSTED AGRICULTURAL NETWORK" variant="farmer" size="sm" />
          <Text style={styles.heroHeading}>Grow Smarter. Trade Better. Farm Better.</Text>
          <Text style={styles.heroDescription}>
            Your complete agricultural platform for farm inputs, crop trading, live mandi market intelligence, and smart farming assistance.
          </Text>
          <View style={styles.heroCtaRow}>
            <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onNavigateShop}>
              <Text style={styles.heroPrimaryBtnText}>Explore Marketplace ➔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroSecondaryBtn} onPress={onNavigateMandi}>
              <Text style={styles.heroSecondaryBtnText}>Check Live Mandi Prices</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. TRUST PILLARS SECTION */}
      <View style={styles.trustSection}>
        <View style={styles.trustGrid}>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>🤝</Text>
            <Text style={styles.trustTitle}>Direct Connections</Text>
            <Text style={styles.trustSubtitle}>Transparent farmer-to-buyer trade without middlemen.</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>✅</Text>
            <Text style={styles.trustTitle}>100% Verified Inputs</Text>
            <Text style={styles.trustSubtitle}>Certified seeds, genuine fertilizers, and quality tools.</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>📡</Text>
            <Text style={styles.trustTitle}>Live Intelligence</Text>
            <Text style={styles.trustSubtitle}>Real-time APMC mandi prices and Open-Meteo forecasts.</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>📞</Text>
            <Text style={styles.trustTitle}>24x7 Kisan Support</Text>
            <Text style={styles.trustSubtitle}>Toll-free 1800-180-1551 hotline and KVK specialist chat.</Text>
          </View>
        </View>
      </View>

      {/* 4. AGRICULTURAL CATEGORIES GRID */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Agricultural Product Categories</Text>
            <Text style={styles.sectionSubtitle}>Browse verified farm inputs and agricultural supplies</Text>
          </View>
          <TouchableOpacity onPress={onNavigateShop}>
            <Text style={styles.viewAllText}>View All Store Categories ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {standardCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onNavigateShop && onNavigateShop(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryDesc} numberOfLines={2}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. FEATURED AGRICULTURAL PRODUCTS */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Farm Inputs</Text>
            <Text style={styles.sectionSubtitle}>Top rated certified seeds, soil nutrients & equipment</Text>
          </View>
          <TouchableOpacity onPress={onNavigateShop}>
            <Text style={styles.viewAllText}>Explore Store ➔</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingIndicator message="Loading catalog from database..." />
        ) : (
          <View style={styles.productGrid}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map((prod) => (
                <View key={prod.id} style={styles.productCard}>
                  <View style={styles.productImageWrapper}>
                    <Text style={styles.productCardIcon}>🌾</Text>
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>★ {prod.rating || '4.8'}</Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{prod.category || 'SEEDS'}</Text>
                    <Text style={styles.productTitle} numberOfLines={2}>{prod.title || prod.name}</Text>
                    <Text style={styles.productSeller}>By {prod.brand || prod.seller_name || 'Cauvery Agro'}</Text>
                    
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>₹{prod.price}</Text>
                      {prod.unit && <Text style={styles.productUnit}>/{prod.unit}</Text>}
                    </View>

                    <TouchableOpacity
                      style={styles.addToCartBtn}
                      onPress={onNavigateShop}
                    >
                      <Text style={styles.addToCartBtnText}>Add to Cart 🛒</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ color: colors.textSecondary }}>Explore the full catalog in our store.</Text>
                <Button title="Open Farm Inputs Store" variant="primary" size="sm" onPress={onNavigateShop} style={{ marginTop: 10 }} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* 6. LIVE APMC MANDI PRICE HIGHLIGHTS */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Live APMC Mandi Market Prices</Text>
            <Text style={styles.sectionSubtitle}>Direct prices from Karnataka and national agricultural markets</Text>
          </View>
          <TouchableOpacity onPress={onNavigateMandi}>
            <Text style={styles.viewAllText}>All Market Prices ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mandiGrid}>
          {mandiHighlights.length > 0 ? (
            mandiHighlights.map((m, idx) => (
              <View key={idx} style={styles.mandiCard}>
                <View style={styles.mandiHeaderRow}>
                  <Text style={styles.mandiCommodity}>{m.commodity || m.crop_name}</Text>
                  <Text style={styles.mandiPrice}>₹{m.modal_price || m.price_per_quintal || '2,400'}</Text>
                </View>
                <Text style={styles.mandiMarket}>📍 {m.market_name || m.market || 'APMC Hub'}</Text>
                <View style={styles.mandiFooterRow}>
                  <Text style={styles.mandiVariety}>{m.variety || 'Standard Hybrid'}</Text>
                  <Text style={styles.mandiTrend}>▲ Active Arrival</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.mandiCard}>
              <View style={styles.mandiHeaderRow}>
                <Text style={styles.mandiCommodity}>Tomato (Hybrid)</Text>
                <Text style={styles.mandiPrice}>₹28 / kg</Text>
              </View>
              <Text style={styles.mandiMarket}>📍 Kolar APMC Hub</Text>
              <View style={styles.mandiFooterRow}>
                <Text style={styles.mandiVariety}>Grade A</Text>
                <Text style={styles.mandiTrend}>▲ High Demand</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 7. KISAN ASSISTANCE CALLOUT */}
      <View style={styles.hotlineBanner}>
        <View style={styles.hotlineLeft}>
          <Text style={styles.hotlineIcon}>📞</Text>
          <View>
            <Text style={styles.hotlineTitle}>Need Agricultural Guidance?</Text>
            <Text style={styles.hotlineSub}>Connect with KVK Scientists & Government Agronomists 24x7</Text>
          </View>
        </View>
        <View style={styles.hotlineRight}>
          <TouchableOpacity style={styles.hotlineCallBtn} onPress={() => {}}>
            <Text style={styles.hotlineCallBtnText}>Call 1800-180-1551 (Toll-Free)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 8. PROFESSIONAL 4-COLUMN FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerGrid}>
          
          {/* Col 1 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerBrand}>🌱 FarmConnect</Text>
            <Text style={styles.footerTagline}>Smart Agriculture Products & Market Assistance Operating System</Text>
            <Text style={styles.footerDesc}>
              Connecting Indian farmers directly to wholesale buyers, certified input dealers, real-time market prices, and agronomy intelligence.
            </Text>
          </View>

          {/* Col 2 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Marketplace</Text>
            <TouchableOpacity onPress={onNavigateShop}><Text style={styles.footerLink}>Farm Inputs Store</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateCropMarket}><Text style={styles.footerLink}>Crop Marketplace</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateMandi}><Text style={styles.footerLink}>APMC Mandi Rates</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateRegister}><Text style={styles.footerLink}>Sell on FarmConnect</Text></TouchableOpacity>
          </View>

          {/* Col 3 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Smart Farming</Text>
            <TouchableOpacity onPress={onNavigateWeather}><Text style={styles.footerLink}>Weather Advisory</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateAi}><Text style={styles.footerLink}>AI Crop Diagnosis</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateKnowledge}><Text style={styles.footerLink}>Soil & NPK Guides</Text></TouchableOpacity>
            <TouchableOpacity onPress={onNavigateSchemes}><Text style={styles.footerLink}>PM-KISAN & Schemes</Text></TouchableOpacity>
          </View>

          {/* Col 4 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Support & Legal</Text>
            <Text style={styles.footerLink}>Kisan Helpline: 1800-180-1551</Text>
            <Text style={styles.footerLink}>Email: support@farmconnect.org</Text>
            <Text style={styles.footerLink}>Privacy Policy & Terms</Text>
            <Text style={styles.footerLink}>256-Bit SSL Encrypted</Text>
          </View>

        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.copyrightText}>
            © 2026 FarmConnect Agriculture Platform. All rights reserved. Made for Indian Agriculture.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    fontSize: 28,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: '#86efac',
    fontSize: 9,
    fontWeight: typography.weights.semiBold,
    letterSpacing: 1,
  },
  searchBarContainer: {
    flex: 1,
    minWidth: 260,
    maxWidth: 500,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 13,
    color: colors.textPrimary,
  },
  searchBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
  },
  getStartedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
  },
  getStartedBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },

  // Ribbon Navigation
  navRibbon: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    flexDirection: 'row',
    overflowX: 'auto',
    justifyContent: 'center',
    gap: 16,
  },
  navItem: {
    paddingVertical: 2,
  },
  navItemText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.medium,
  },

  // Hero Section
  heroSection: {
    backgroundColor: '#0f381e',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.accent,
  },
  heroOverlay: {
    maxWidth: 800,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroHeading: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: Platform.OS === 'web' ? 44 : 32,
  },
  heroDescription: {
    fontSize: 15,
    color: '#d1fae5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroCtaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  heroPrimaryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: typography.weights.semiBold,
  },

  // Trust Pillars
  trustSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trustGrid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  trustCard: {
    flex: 1,
    minWidth: 200,
    padding: spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    textAlign: 'center',
  },
  trustIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  trustSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Common Section Container
  sectionContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 220,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    textAlign: 'center',
    ...shadows.sm,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Products Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    minWidth: 180,
    maxWidth: 260,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImageWrapper: {
    height: 120,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productCardIcon: {
    fontSize: 48,
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: spacing.sm,
  },
  productCategory: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginVertical: 4,
    minHeight: 34,
  },
  productSeller: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  productUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  addToCartBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },

  // Mandi Cards Grid
  mandiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mandiCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  mandiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mandiCommodity: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  mandiPrice: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  mandiMarket: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  mandiFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  mandiVariety: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mandiTrend: {
    fontSize: 11,
    color: colors.success,
    fontWeight: 'bold',
  },

  // Hotline Banner
  hotlineBanner: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '95%',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: spacing.lg,
  },
  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hotlineIcon: {
    fontSize: 32,
  },
  hotlineTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: '#92400e',
  },
  hotlineSub: {
    fontSize: 12,
    color: '#b45309',
  },
  hotlineRight: {},
  hotlineCallBtn: {
    backgroundColor: '#92400e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  hotlineCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    backgroundColor: '#111827',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  footerGrid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: spacing.xl,
  },
  footerCol: {
    flex: 1,
    minWidth: 200,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  footerTagline: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '600',
    marginBottom: 8,
  },
  footerDesc: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 18,
  },
  footerColTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerBottom: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },

  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
});
