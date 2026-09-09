import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from 'react-native';
import BiddingModal from '../../components/BiddingModal';
import CreateListingModal from '../../components/CreateListingModal';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const MARKETPLACE_CATEGORIES = ['All', 'Cereals', 'Vegetables', 'Pulses', 'Oilseeds', 'Commercial'];

const INITIAL_LISTINGS = [
  {
    id: 'lot_101',
    farmerName: 'Ramesh Gowda',
    location: 'Mandya, Karnataka',
    commodity: 'Sona Masuri Paddy',
    category: 'Cereals',
    quantity: '120 Quintals',
    basePrice: '₹ 2,300 / Qtl',
    currentBid: '₹ 2,480 / Qtl',
    totalBids: 8,
    harvestDate: 'Harvested 3 days ago',
    qualityGrade: 'Grade A',
    status: 'Live Bidding',
  },
  {
    id: 'lot_102',
    farmerName: 'Shivanna H.',
    location: 'Kolar, Karnataka',
    commodity: 'Hybrid Red Tomato',
    category: 'Vegetables',
    quantity: '45 Quintals',
    basePrice: '₹ 1,600 / Qtl',
    currentBid: '₹ 1,750 / Qtl',
    totalBids: 12,
    harvestDate: 'Harvested yesterday',
    qualityGrade: 'Grade A+',
    status: 'Live Bidding',
  },
  {
    id: 'lot_103',
    farmerName: 'Basavaraj Patil',
    location: 'Dharwad, Karnataka',
    commodity: 'Medium Staple Cotton',
    category: 'Commercial',
    quantity: '80 Quintals',
    basePrice: '₹ 6,900 / Qtl',
    currentBid: '₹ 7,200 / Qtl',
    totalBids: 5,
    harvestDate: 'Harvested 1 week ago',
    qualityGrade: 'Grade A',
    status: 'Live Bidding',
  },
  {
    id: 'lot_104',
    farmerName: 'Anil Kumar',
    location: 'Shimoga, Karnataka',
    commodity: 'Yellow Feed Maize',
    category: 'Cereals',
    quantity: '150 Quintals',
    basePrice: '₹ 2,050 / Qtl',
    currentBid: '₹ 2,190 / Qtl',
    totalBids: 6,
    harvestDate: 'Harvested 4 days ago',
    qualityGrade: 'Grade B+',
    status: 'Live Bidding',
  },
];

export default function MarketplaceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [selectedLot, setSelectedLot] = useState(null);
  const [biddingModalVisible, setBiddingModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const filteredListings = useMemo(() => {
    const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
    return listings.filter((item) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !query ||
        item.commodity.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.farmerName.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  const renderListingCard = ({ item }) => (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardTop}>
        <View style={styles.headerInfo}>
          <Text style={styles.commodityName}>{item.commodity}</Text>
          <Text style={styles.farmerLocation}>
            {item.farmerName} • 📍 {item.location}
          </Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeBadgeText}>{item.qualityGrade}</Text>
        </View>
      </View>

      {/* Lot Parameters */}
      <View style={styles.tagsRow}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>📦 {item.quantity}</Text>
        </View>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>🕒 {item.harvestDate}</Text>
        </View>
      </View>

      {/* Pricing Matrix */}
      <View style={styles.biddingBox}>
        <View style={styles.bidColumn}>
          <Text style={styles.bidLabel}>Base Price</Text>
          <Text style={styles.basePriceText}>{item.basePrice}</Text>
        </View>
        <View style={[styles.bidColumn, styles.bidColumnActive]}>
          <Text style={styles.highestBidLabel}>Highest Bid ({item.totalBids} bids)</Text>
          <Text style={styles.highestBidText}>{item.currentBid}</Text>
        </View>
      </View>

      {/* Card Action */}
      <TouchableOpacity
        style={styles.bidActionBtn}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedLot(item);
          setBiddingModalVisible(true);
        }}
      >
        <Text style={styles.bidActionBtnText}>Inspect Lot & Place Bid</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🌾 Direct Farmer Market</Text>
          <Text style={styles.headerSubtitle}>Verified harvest lots with live transparent bidding</Text>
        </View>
        <TouchableOpacity
          style={styles.createListingBtn}
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createListingBtnText}>+ Sell</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop, region, or farmer..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Category Strip */}
      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MARKETPLACE_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Feed List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Harvest Lots Found</Text>
            <Text style={styles.emptyDesc}>
              No listings currently match the active filters or search criteria.
            </Text>
          </View>
        }
      />

      {/* Bidding Modal */}
      <BiddingModal
        visible={biddingModalVisible}
        lot={selectedLot}
        onClose={() => setBiddingModalVisible(false)}
        onPlaceBid={(bidData) => {
          setListings((prevListings) =>
            prevListings.map((item) => {
              if (item.id === bidData.lotId) {
                return {
                  ...item,
                  currentBid: bidData.formattedBid,
                  totalBids: item.totalBids + 1,
                };
              }
              return item;
            })
          );
          setBiddingModalVisible(false);
        }}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onListingCreated={(newLot) => {
          setListings((prev) => [newLot, ...prev]);
          setCreateModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
  },
  createListingBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createListingBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearSearch: {
    color: COLORS.textMuted,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  categoryWrapper: {
    paddingVertical: SPACING.sm,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  feedContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  commodityName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  farmerLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: SPACING.sm,
  },
  pillBadge: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  biddingBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bidColumn: {
    flex: 1,
  },
  bidColumnActive: {
    alignItems: 'flex-end',
  },
  bidLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  basePriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  highestBidLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  highestBidText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bidActionBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  bidActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 1.5,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: 4,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});