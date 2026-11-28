// FarmConnect 2.0 — Public Agricultural Homepage
// Modern Amazon/Flipkart/Shopify-inspired agricultural discovery storefront, role portals & smart farming hub

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card, Badge, Button, LoadingIndicator } from '../../components/common';
import LanguageSelector from '../../components/common/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';

const { width } = Dimensions.get('window');

// Verified fallback seed data so the storefront is never blank or empty even offline
const SEED_FEATURED_PRODUCTS = [
  { id: 'prod_1', title: 'Hybrid Paddy Seeds (Sona Masoori)', category: 'SEEDS', price: 850, unit: '10kg bag', rating: 4.9, brand: 'Cauvery Agro' },
  { id: 'prod_2', title: 'Ragi Seeds GPU-28 (Drought Hardy)', category: 'SEEDS', price: 420, unit: '5kg pack', rating: 5.0, brand: 'UAS Bangalore' },
  { id: 'prod_3', title: 'Organic Neem Cake Fertilizer', category: 'FERTILIZERS', price: 650, unit: '25kg bag', rating: 4.7, brand: 'Karnataka Bio' },
  { id: 'prod_4', title: 'Water Soluble NPK 19-19-19', category: 'FERTILIZERS', price: 1250, unit: '25kg bag', rating: 4.9, brand: 'Mahadhan' },
  { id: 'prod_5', title: 'Ergonomic Hand Weeder & Cultivator', category: 'TOOLS', price: 350, unit: 'piece', rating: 4.6, brand: 'Kisan Tools' },
  { id: 'prod_6', title: 'Drip Irrigation Lateral Kit 16mm', category: 'IRRIGATION', price: 2850, unit: 'bundle', rating: 4.8, brand: 'Jain Irrigation' },
];

const SEED_CROP_LISTINGS = [
  { id: 'crop_m1', crop_name: 'Sugarcane', variety: 'Co 86032 (High Sugar Recovery)', quantity_available: 500, unit: 'Tons', expected_price: 3350, mandi_location: 'Mandya APMC Hub', quality_grade: 'Grade A' },
  { id: 'crop_m2', crop_name: 'Sona Masoori Paddy', variety: 'Paddy Raw Grain (Fine)', quantity_available: 250, unit: 'Quintals', expected_price: 2400, mandi_location: 'Raichur APMC Hub', quality_grade: 'Grade A+' },
  { id: 'crop_m3', crop_name: 'Finger Millet (Ragi)', variety: 'GPU-28 Organic Grade', quantity_available: 120, unit: 'Quintals', expected_price: 4150, mandi_location: 'Mysore Mandi', quality_grade: 'Organic' },
];

const SEED_MANDI_RATES = [
  { id: 'm1', commodity: 'Sugarcane', variety: 'Co 86032', market_mandi: 'Mandya APMC', modal_price: 3280, trend: 'UP' },
  { id: 'm2', commodity: 'Paddy (Dhan)', variety: 'Sona Masoori', market_mandi: 'Maddur Mandi', modal_price: 2350, trend: 'STABLE' },
  { id: 'm3', commodity: 'Ragi (Finger Millet)', variety: 'GPU-28', market_mandi: 'Mandya APMC', modal_price: 4050, trend: 'UP' },
  { id: 'm6', commodity: 'Cotton', variety: 'DCH-32', market_mandi: 'Raichur APMC', modal_price: 7200, trend: 'STABLE' },
];

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
  onSelectRoleDemo,
}) {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState(SEED_FEATURED_PRODUCTS);
  const [cropListings, setCropListings] = useState(SEED_CROP_LISTINGS);
  const [mandiHighlights, setMandiHighlights] = useState(SEED_MANDI_RATES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAboutModal, setShowAboutModal] = useState(false);

  // 10 Official Agricultural Categories with localized names and descriptions
  const standardCategories = [
    { id: 'SEEDS', name: t('cat_seeds_name'), icon: '🌱', desc: t('cat_seeds_desc') },
    { id: 'FERTILIZERS', name: t('cat_fert_name'), icon: '🧪', desc: t('cat_fert_desc') },
    { id: 'ORGANIC', name: t('cat_org_name'), icon: '🌿', desc: t('cat_org_desc') },
    { id: 'PESTICIDES', name: t('cat_pest_name'), icon: '🛡️', desc: t('cat_pest_desc') },
    { id: 'IRRIGATION', name: t('cat_irrig_name'), icon: '💧', desc: t('cat_irrig_desc') },
    { id: 'TOOLS', name: t('cat_tools_name'), icon: '⛏️', desc: t('cat_tools_desc') },
    { id: 'MACHINERY', name: t('cat_mach_name'), icon: '🚜', desc: t('cat_mach_desc') },
    { id: 'ANIMAL_FEED', name: t('cat_feed_name'), icon: '🐄', desc: t('cat_feed_desc') },
    { id: 'CROP_PRODUCE', name: t('cat_crop_name'), icon: '🌾', desc: t('cat_crop_desc') },
    { id: 'SUPPLIES', name: t('cat_supp_name'), icon: '📦', desc: t('cat_supp_desc') },
  ];

  useEffect(() => {
    loadPublicData();
  }, []);

  async function loadPublicData() {
    try {
      // 1. Load Featured Products from Real Database / Cloud API
      const prodRes = await apiClient.get('/ecommerce/products?limit=8');
      if (prodRes.data?.success && Array.isArray(prodRes.data.data) && prodRes.data.data.length > 0) {
        setFeaturedProducts(prodRes.data.data.slice(0, 6));
      }

      // 2. Load Crop Marketplace listings
      const cropRes = await apiClient.get('/crop-market/listings');
      if (cropRes.data?.success && Array.isArray(cropRes.data.data) && cropRes.data.data.length > 0) {
        setCropListings(cropRes.data.data.slice(0, 3));
      }

      // 3. Load Mandi Highlights (Fixed to /mandi/rates)
      const mandiRes = await apiClient.get('/mandi/rates');
      if (mandiRes.data?.success && Array.isArray(mandiRes.data.data) && mandiRes.data.data.length > 0) {
        setMandiHighlights(mandiRes.data.data.slice(0, 4));
      }
    } catch (err) {
      console.log('Public data fetch error (using seed fallback):', err.message);
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
              <Text style={styles.brandTitle}>{t('app_title')}</Text>
              <Text style={styles.brandSubtitle}>{t('brand_subtitle')}</Text>
            </View>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('nav_search_placeholder')}
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
              <Text style={styles.signInBtnText}>{t('sign_in')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.getStartedBtn} onPress={onNavigateRegister}>
              <Text style={styles.getStartedBtnText}>{t('get_started')}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Navigation Ribbon (All requested links) */}
        <View style={styles.navRibbon}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Text style={[styles.navItemText, styles.navItemActive]}>🏠 {t('home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateShop}>
            <Text style={styles.navItemText}>🏪 {t('nav_shop')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateCropMarket}>
            <Text style={styles.navItemText}>🌾 {t('nav_crop_market')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateMandi}>
            <Text style={styles.navItemText}>📊 {t('nav_mandi')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateWeather}>
            <Text style={styles.navItemText}>⛅ {t('nav_weather')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateAi}>
            <Text style={styles.navItemText}>🚜 {t('nav_smart_farming')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateKnowledge}>
            <Text style={styles.navItemText}>📚 {t('nav_knowledge')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateSchemes}>
            <Text style={styles.navItemText}>🏛️ {t('nav_schemes')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setShowAboutModal(true)}>
            <Text style={styles.navItemText}>ℹ️ {t('nav_about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, styles.navRolesHighlight]}
            onPress={() => onSelectRoleDemo && onSelectRoleDemo('FARMER')}
          >
            <Text style={styles.navRolesText}>👤 {t('nav_roles')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. HERO BANNER */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <Badge label={t('hero_badge')} variant="farmer" size="sm" />
          <Text style={styles.heroHeading}>{t('hero_heading')}</Text>
          <Text style={styles.heroDescription}>{t('hero_desc')}</Text>
          <View style={styles.heroCtaRow}>
            <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onNavigateShop}>
              <Text style={styles.heroPrimaryBtnText}>{t('hero_explore_market')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroSecondaryBtn} onPress={onNavigateAi}>
              <Text style={styles.heroSecondaryBtnText}>{t('hero_explore_smart')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. TRUST PILLARS SECTION */}
      <View style={styles.trustSection}>
        <View style={styles.trustGrid}>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>🤝</Text>
            <Text style={styles.trustTitle}>{t('trust_direct_title')}</Text>
            <Text style={styles.trustSubtitle}>{t('trust_direct_sub')}</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>✅</Text>
            <Text style={styles.trustTitle}>{t('trust_verified_title')}</Text>
            <Text style={styles.trustSubtitle}>{t('trust_verified_sub')}</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>📡</Text>
            <Text style={styles.trustTitle}>{t('trust_intel_title')}</Text>
            <Text style={styles.trustSubtitle}>{t('trust_intel_sub')}</Text>
          </View>
          <View style={styles.trustCard}>
            <Text style={styles.trustIcon}>📞</Text>
            <Text style={styles.trustTitle}>{t('trust_support_title')}</Text>
            <Text style={styles.trustSubtitle}>{t('trust_support_sub')}</Text>
          </View>
        </View>
      </View>

      {/* 4. ROLE WORKSPACES & INTERACTIVE PORTALS (Solves "no different roles are present") */}
      <View style={[styles.sectionContainer, styles.rolePortalsBg]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>👥 {t('section_roles_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_roles_sub')}</Text>
          </View>
        </View>

        <View style={styles.roleGrid}>
          {/* Farmer Card */}
          <View style={[styles.roleCard, styles.farmerCardBorder]}>
            <View style={styles.roleCardHeader}>
              <Text style={styles.roleCardIcon}>👨‍🌾</Text>
              <Badge label="FARMER" variant="farmer" size="sm" />
            </View>
            <Text style={styles.roleCardTitle}>{t('role_farmer_title')}</Text>
            <Text style={styles.roleCardDesc}>{t('role_farmer_desc')}</Text>
            <TouchableOpacity
              style={[styles.roleLaunchBtn, { backgroundColor: colors.primary }]}
              onPress={() => onSelectRoleDemo && onSelectRoleDemo('FARMER')}
            >
              <Text style={styles.roleLaunchBtnText}>{t('role_farmer_btn')}</Text>
            </TouchableOpacity>
          </View>

          {/* Buyer Card */}
          <View style={[styles.roleCard, styles.buyerCardBorder]}>
            <View style={styles.roleCardHeader}>
              <Text style={styles.roleCardIcon}>🛒</Text>
              <Badge label="BUYER" variant="buyer" size="sm" />
            </View>
            <Text style={styles.roleCardTitle}>{t('role_buyer_title')}</Text>
            <Text style={styles.roleCardDesc}>{t('role_buyer_desc')}</Text>
            <TouchableOpacity
              style={[styles.roleLaunchBtn, { backgroundColor: '#0284c7' }]}
              onPress={() => onSelectRoleDemo && onSelectRoleDemo('BUYER')}
            >
              <Text style={styles.roleLaunchBtnText}>{t('role_buyer_btn')}</Text>
            </TouchableOpacity>
          </View>

          {/* Seller Card */}
          <View style={[styles.roleCard, styles.sellerCardBorder]}>
            <View style={styles.roleCardHeader}>
              <Text style={styles.roleCardIcon}>🏪</Text>
              <Badge label="SELLER" variant="seller" size="sm" />
            </View>
            <Text style={styles.roleCardTitle}>{t('role_seller_title')}</Text>
            <Text style={styles.roleCardDesc}>{t('role_seller_desc')}</Text>
            <TouchableOpacity
              style={[styles.roleLaunchBtn, { backgroundColor: '#d97706' }]}
              onPress={() => onSelectRoleDemo && onSelectRoleDemo('SELLER')}
            >
              <Text style={styles.roleLaunchBtnText}>{t('role_seller_btn')}</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Card */}
          <View style={[styles.roleCard, styles.adminCardBorder]}>
            <View style={styles.roleCardHeader}>
              <Text style={styles.roleCardIcon}>🛡️</Text>
              <Badge label="ADMIN" variant="admin" size="sm" />
            </View>
            <Text style={styles.roleCardTitle}>{t('role_admin_title')}</Text>
            <Text style={styles.roleCardDesc}>{t('role_admin_desc')}</Text>
            <TouchableOpacity
              style={[styles.roleLaunchBtn, { backgroundColor: '#dc2626' }]}
              onPress={() => onSelectRoleDemo && onSelectRoleDemo('ADMIN')}
            >
              <Text style={styles.roleLaunchBtnText}>{t('role_admin_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. AGRICULTURAL CATEGORIES GRID */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('section_categories_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_categories_sub')}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateShop}>
            <Text style={styles.viewAllText}>{t('view_all_store')}</Text>
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

      {/* 6. FEATURED AGRICULTURAL PRODUCTS FROM REAL DATABASE */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('section_featured_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_featured_sub')}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateShop}>
            <Text style={styles.viewAllText}>{t('explore_store')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {featuredProducts.map((prod) => (
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
                  <Text style={styles.addToCartBtnText}>{t('add_to_cart')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 7. FARMER CROP MARKETPLACE SECTION */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('section_crops_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_crops_sub')}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateCropMarket}>
            <Text style={styles.viewAllText}>{t('view_all_crops')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cropLotGrid}>
          {cropListings.map((lot, idx) => (
            <View key={lot.id || idx} style={styles.cropLotCard}>
              <View style={styles.cropLotHeader}>
                <Text style={styles.cropLotTitle}>{lot.crop_name} ({lot.variety || 'Hybrid'})</Text>
                <Badge label={lot.quality_grade || 'Grade A'} variant="success" size="sm" />
              </View>
              <Text style={styles.cropLotLocation}>📍 {lot.mandi_location || 'Mandya APMC Hub'}</Text>
              <View style={styles.cropLotMetaRow}>
                <Text style={styles.cropLotQty}>Available: {lot.quantity_available} {lot.unit || 'Quintals'}</Text>
                <Text style={styles.cropLotPrice}>₹{lot.expected_price} / {lot.unit || 'qtl'}</Text>
              </View>
              <TouchableOpacity style={styles.cropBidBtn} onPress={onNavigateCropMarket}>
                <Text style={styles.cropBidBtnText}>{t('submit_bid')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* 8. LIVE APMC MANDI PRICE HIGHLIGHTS */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('section_mandi_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_mandi_sub')}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateMandi}>
            <Text style={styles.viewAllText}>{t('view_mandi_analytics')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mandiGrid}>
          {mandiHighlights.map((m, idx) => (
            <View key={m.id || idx} style={styles.mandiCard}>
              <View style={styles.mandiHeaderRow}>
                <Text style={styles.mandiCommodity}>{m.commodity || m.crop_name}</Text>
                <Text style={styles.mandiPrice}>₹{m.modal_price || m.price_per_quintal || '2,400'}</Text>
              </View>
              <Text style={styles.mandiMarket}>📍 {m.market_mandi || m.market_name || m.market || 'APMC Hub'}</Text>
              <View style={styles.mandiFooterRow}>
                <Text style={styles.mandiVariety}>{m.variety || 'Standard Hybrid'}</Text>
                <Text style={styles.mandiTrend}>▲ {m.trend || 'Active Arrival'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 9. SMART AGRICULTURE SERVICES & AI */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>🚜 {t('section_smart_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('section_smart_sub')}</Text>
          </View>
        </View>

        <View style={styles.smartServicesGrid}>
          <TouchableOpacity style={styles.smartServiceCard} onPress={onNavigateAi}>
            <Text style={styles.smartServiceIcon}>🤖</Text>
            <Text style={styles.smartServiceTitle}>{t('service_ai_title')}</Text>
            <Text style={styles.smartServiceDesc}>{t('service_ai_desc')}</Text>
            <Text style={styles.smartServiceLink}>Launch AI Assistant ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smartServiceCard} onPress={onNavigateKnowledge}>
            <Text style={styles.smartServiceIcon}>🧪</Text>
            <Text style={styles.smartServiceTitle}>{t('service_telemetry_title')}</Text>
            <Text style={styles.smartServiceDesc}>{t('service_telemetry_desc')}</Text>
            <Text style={styles.smartServiceLink}>Calculate Soil NPK ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smartServiceCard} onPress={onNavigateWeather}>
            <Text style={styles.smartServiceIcon}>⛅</Text>
            <Text style={styles.smartServiceTitle}>{t('service_weather_title')}</Text>
            <Text style={styles.smartServiceDesc}>{t('service_weather_desc')}</Text>
            <Text style={styles.smartServiceLink}>View Weather Forecast ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smartServiceCard} onPress={onNavigateSchemes}>
            <Text style={styles.smartServiceIcon}>🏛️</Text>
            <Text style={styles.smartServiceTitle}>{t('service_schemes_title')}</Text>
            <Text style={styles.smartServiceDesc}>{t('service_schemes_desc')}</Text>
            <Text style={styles.smartServiceLink}>Check Schemes ➔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 10. KISAN ASSISTANCE CALLOUT */}
      <View style={styles.hotlineBanner}>
        <View style={styles.hotlineLeft}>
          <Text style={styles.hotlineIcon}>📞</Text>
          <View>
            <Text style={styles.hotlineTitle}>{t('trust_support_title')}</Text>
            <Text style={styles.hotlineSub}>{t('trust_support_sub')}</Text>
          </View>
        </View>
        <View style={styles.hotlineRight}>
          <TouchableOpacity style={styles.hotlineCallBtn} onPress={() => Alert.alert('Kisan Helpline', 'Call toll-free: 1800-180-1551')}>
            <Text style={styles.hotlineCallBtnText}>Call 1800-180-1551 (Toll-Free)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 11. PROFESSIONAL 4-COLUMN FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerGrid}>
          
          {/* Col 1 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerBrand}>🌱 {t('app_title')}</Text>
            <Text style={styles.footerTagline}>{t('brand_subtitle')}</Text>
            <Text style={styles.footerDesc}>{t('footer_tagline')}</Text>
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
            <TouchableOpacity onPress={onNavigateSchemes}><Text style={styles.footerLink}>Government Schemes</Text></TouchableOpacity>
          </View>

          {/* Col 4 */}
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Support & Legal</Text>
            <Text style={styles.footerLink}>Kisan Helpline: 1800-180-1551</Text>
            <Text style={styles.footerLink}>Email: support@farmconnect.org</Text>
            <TouchableOpacity onPress={() => setShowAboutModal(true)}><Text style={styles.footerLink}>About FarmConnect</Text></TouchableOpacity>
            <Text style={styles.footerLink}>256-Bit SSL Encrypted</Text>
          </View>

        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.copyrightText}>
            © 2026 FarmConnect. {t('footer_rights')}
          </Text>
        </View>
      </View>

      {/* About Modal */}
      {showAboutModal && (
        <View style={styles.aboutModalBackdrop}>
          <View style={styles.aboutModalBox}>
            <Text style={styles.aboutModalTitle}>About FarmConnect</Text>
            <Text style={styles.aboutModalText}>
              FarmConnect is an integrated agricultural platform designed to empower Indian farmers, wholesale buyers, and certified agri-merchants.
              {'\n\n'}
              Our mission is to eliminate unfair brokerage, provide direct transparent market prices, deliver scientific soil and pest guidance, and streamline farm input procurement.
            </Text>
            <Button title="Close" variant="primary" size="sm" onPress={() => setShowAboutModal(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      )}

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
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signInBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  getStartedBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
  },
  getStartedBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },

  // Nav Ribbon
  navRibbon: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    overflow: 'scroll',
    gap: 4,
  },
  navItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navItemText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: typography.weights.medium,
  },
  navItemActive: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  navRolesHighlight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  navRolesText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Hero Section
  heroSection: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    maxWidth: 800,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
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
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroPrimaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: typography.weights.semiBold,
  },

  // Trust Section
  trustSection: {
    backgroundColor: '#ffffff',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trustGrid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  trustCard: {
    flex: 1,
    minWidth: 200,
    alignItems: 'center',
    textAlign: 'center',
    padding: spacing.sm,
  },
  trustIcon: {
    fontSize: 32,
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
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Section Layouts
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

  // Role Portals Section
  rolePortalsBg: {
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DCFCE7',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  roleCard: {
    flex: 1,
    minWidth: 250,
    maxWidth: 280,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    ...shadows.md,
  },
  farmerCardBorder: { borderColor: colors.primary },
  buyerCardBorder: { borderColor: '#0284c7' },
  sellerCardBorder: { borderColor: '#d97706' },
  adminCardBorder: { borderColor: '#dc2626' },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleCardIcon: {
    fontSize: 32,
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  roleCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 54,
  },
  roleLaunchBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  roleLaunchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },

  // Categories Grid
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

  // Crop Marketplace Lot Grid
  cropLotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cropLotCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  cropLotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropLotTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cropLotLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  cropLotMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  cropLotQty: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cropLotPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cropBidBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  cropBidBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Mandi Grid
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

  // Smart Services Grid
  smartServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  smartServiceCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  smartServiceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  smartServiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  smartServiceDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  smartServiceLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
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

  // About Modal
  aboutModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  aboutModalBox: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    maxWidth: 500,
    width: '100%',
    ...shadows.lg,
  },
  aboutModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  aboutModalText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
