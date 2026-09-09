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
  Alert,
} from 'react-native';
import { useApp } from '../../services/AppContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const STORE_CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Tools'];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Certified Hybrid Tomato Seeds (100g)',
    category: 'Seeds',
    price: '₹ 450',
    seller: 'Kisan Krishi Kendra',
    rating: '4.8 ★',
    stock: 'In Stock (42 packs)',
    description: 'High germination rate, resistant to early blight.',
  },
  {
    id: 'prod_2',
    title: 'Bio NPK Organic Fertilizer (50kg)',
    category: 'Fertilizers',
    price: '₹ 1,150',
    seller: 'Green Earth Bio Inputs',
    rating: '4.7 ★',
    stock: 'In Stock (18 bags)',
    description: 'Enriched organic nitrogen, phosphorus, and potassium.',
  },
  {
    id: 'prod_3',
    title: 'Neem Oil Botanical Pesticide (1L)',
    category: 'Pesticides',
    price: '₹ 380',
    seller: 'Sri Manjunatha Agro',
    rating: '4.9 ★',
    stock: 'In Stock (60 bottles)',
    description: '10,000 PPM cold-pressed neem formulation.',
  },
  {
    id: 'prod_4',
    title: 'Battery Knapsack Sprayer 16L',
    category: 'Tools',
    price: '₹ 2,499',
    seller: 'Deccan Farm Machinery',
    rating: '4.6 ★',
    stock: 'In Stock (9 units)',
    description: 'Rechargeable 12V 12Ah battery with dual brass nozzles.',
  },
];

export default function AgriStoreScreen() {
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products] = useState(INITIAL_PRODUCTS);

  const isSeller = user?.role === 'agri_seller' || user?.role === 'seller';

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchQuery =
        !q || p.title.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAction = (item) => {
    if (isSeller) {
      Alert.alert('Manage Inventory', `Editing stock level for: ${item.title}`);
    } else {
      Alert.alert('Order Placed', `Inquiry sent to ${item.seller} for ${item.title}.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Agri Inputs & Supplies</Text>
        <Text style={styles.headerSubtitle}>
          {isSeller
            ? 'Dealer catalog & inventory management'
            : 'Buy certified seeds, bio-fertilizers & farm equipment'}
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search seeds, fertilizer, machinery..."
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

      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STORE_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.titleArea}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.sellerName}>Dealer: {item.seller}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.stock}>{item.stock}</Text>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => handleAction(item)}
            >
              <Text style={styles.actionBtnText}>
                {isSeller ? 'Manage Stock' : 'Order Direct from Dealer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#c8e6c9', fontSize: 12, marginTop: 2 },
  searchWrapper: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
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
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  clearSearch: { color: COLORS.textMuted, fontSize: 14, paddingHorizontal: 4 },
  categoryWrapper: { paddingVertical: SPACING.sm },
  categoryScroll: { paddingHorizontal: SPACING.md, gap: 8 },
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
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  categoryTextActive: { color: '#ffffff' },
  feedContainer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleArea: { flex: 1, marginRight: SPACING.sm },
  productTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  sellerName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  ratingBadge: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: SPACING.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  stock: { fontSize: 12, fontWeight: '600', color: COLORS.success },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
});