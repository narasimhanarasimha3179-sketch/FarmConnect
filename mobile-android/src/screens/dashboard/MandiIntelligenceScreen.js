import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import MandiIntelligenceScreen from '../screens/dashboard/MandiIntelligenceScreen';

const COMMODITY_TAGS = ['All', 'Paddy (Dhan)', 'Tomato', 'Cotton', 'Onion', 'Maize', 'Soyabean'];

const MANDI_DATA = [
  {
    id: 'm1',
    market: 'APMC Mandya',
    state: 'Karnataka',
    commodity: 'Paddy (Dhan)',
    variety: 'Sona Masuri',
    modalPrice: '₹ 2,450 / Qtl',
    minPrice: '₹ 2,200',
    maxPrice: '₹ 2,680',
    trend: '+ ₹ 120 (3.2%)',
    trendDirection: 'up',
    date: 'Today, 11:30 AM',
  },
  {
    id: 'm2',
    market: 'APMC Kolar',
    state: 'Karnataka',
    commodity: 'Tomato',
    variety: 'Hybrid Red',
    modalPrice: '₹ 1,800 / Qtl',
    minPrice: '₹ 1,500',
    maxPrice: '₹ 2,100',
    trend: '- ₹ 80 (2.1%)',
    trendDirection: 'down',
    date: 'Today, 10:15 AM',
  },
  {
    id: 'm3',
    market: 'APMC Dharwad',
    state: 'Karnataka',
    commodity: 'Cotton',
    variety: 'Medium Staple',
    modalPrice: '₹ 7,150 / Qtl',
    minPrice: '₹ 6,800',
    maxPrice: '₹ 7,400',
    trend: '+ ₹ 210 (4.1%)',
    trendDirection: 'up',
    date: 'Today, 09:45 AM',
  },
  {
    id: 'm4',
    market: 'APMC Lasalgaon',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Red Fresh',
    modalPrice: '₹ 1,650 / Qtl',
    minPrice: '₹ 1,350',
    maxPrice: '₹ 1,900',
    trend: '+ ₹ 50 (1.2%)',
    trendDirection: 'up',
    date: 'Today, 08:30 AM',
  },
  {
    id: 'm5',
    market: 'APMC Davanagere',
    state: 'Karnataka',
    commodity: 'Maize',
    variety: 'Yellow Feed',
    modalPrice: '₹ 2,180 / Qtl',
    minPrice: '₹ 2,050',
    maxPrice: '₹ 2,290',
    trend: '+ ₹ 40 (0.9%)',
    trendDirection: 'up',
    date: 'Today, 11:00 AM',
  },
];

export default function MandiIntelligenceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredData = MANDI_DATA.filter((item) => {
    const matchesTag =
      selectedTag === 'All' || item.commodity.toLowerCase().includes(selectedTag.toLowerCase());
    const matchesSearch =
      item.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const renderItem = ({ item }) => {
    const isUp = item.trendDirection === 'up';

    return (
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.marketTitle}>{item.market}</Text>
            <Text style={styles.subInfo}>
              {item.state} • {item.date}
            </Text>
          </View>
          <View style={[styles.trendBadge, isUp ? styles.trendUp : styles.trendDown]}>
            <Text style={[styles.trendText, isUp ? styles.textTrendUp : styles.textTrendDown]}>
              {item.trend}
            </Text>
          </View>
        </View>

        {/* Commodity & Variety */}
        <View style={styles.commodityRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>🌾 {item.commodity}</Text>
          </View>
          <Text style={styles.varietyText}>Var: {item.variety}</Text>
        </View>

        {/* Price Table Matrix */}
        <View style={styles.priceContainer}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Min Rate</Text>
            <Text style={styles.priceValueSub}>{item.minPrice}</Text>
          </View>
          <View style={[styles.priceColumn, styles.priceColumnCenter]}>
            <Text style={styles.modalPriceLabel}>Modal Benchmark</Text>
            <Text style={styles.modalPriceValue}>{item.modalPrice}</Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Max Rate</Text>
            <Text style={styles.priceValueSub}>{item.maxPrice}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 APMC Mandi Intelligence</Text>
        <Text style={styles.headerSubtitle}>Real-time agricultural market benchmark rates</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search APMC market, crop, or variety..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Commodity Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {COMMODITY_TAGS.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagPill, isActive && styles.tagPillActive]}
                onPress={() => setSelectedTag(tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Price Cards List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No Market Records Found</Text>
            <Text style={styles.emptyDesc}>
              Try adjusting your search query or selecting a different crop category.
            </Text>
          </View>
        }
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 13,
    marginTop: 2,
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
  filterWrapper: {
    paddingVertical: SPACING.sm,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  tagPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tagTextActive: {
    color: '#ffffff',
  },
  listContainer: {
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
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  marketTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  subInfo: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: COLORS.accentSoft,
  },
  trendDown: {
    backgroundColor: COLORS.dangerSoft,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textTrendUp: {
    color: COLORS.success,
  },
  textTrendDown: {
    color: COLORS.danger,
  },
  commodityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  badgePill: {
    backgroundColor: COLORS.background,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  varietyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceColumnCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValueSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalPriceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  modalPriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
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