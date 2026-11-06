// FarmConnect Universal Multi-Domain Global Search Screen (Phase 24)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors } from '../../theme';
import { Header, Card, Badge, Input, EmptyState } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function GlobalSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (textToSearch) => {
    const q = textToSearch !== undefined ? textToSearch : query;
    if (!q || !q.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await apiClient.get(`/search?q=${encodeURIComponent(q.trim())}`);
      if (res.data?.success) {
        setResults(res.data.items || []);
        setTotalMatches(res.data.total_matches || 0);
      }
    } catch (err) {
      console.error('handleSearch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'PRODUCT':
        return '🛒';
      case 'CROP_MARKET':
        return '🌾';
      case 'SCHEME':
        return '🏛️';
      case 'MANDI':
        return '📈';
      case 'GUIDE':
        return '📖';
      case 'LIBRARY':
        return '📚';
      default:
        return '🔍';
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.resultCard}>
      <TouchableOpacity
        style={styles.cardRow}
        activeOpacity={0.7}
        onPress={() => {
          // Navigation deeplink hook
          if (item.domain === 'PRODUCT') navigation?.navigate?.('Store');
          else if (item.domain === 'CROP_MARKET') navigation?.navigate?.('CropMarket');
          else if (item.domain === 'MANDI') navigation?.navigate?.('MandiPrices');
          else if (item.domain === 'SCHEME') navigation?.navigate?.('Schemes');
        }}
      >
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 24 }}>{getDomainIcon(item.domain)}</Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            <Badge label={item.badge} variant={item.domain === 'SCHEME' ? 'accent' : 'primary'} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="FarmConnect Global Search" showBack onBack={() => navigation?.goBack?.()} />

      <View style={styles.searchBarBox}>
        <Input
          value={query}
          onChangeText={(txt) => {
            setQuery(txt);
            if (txt.length >= 3) {
              handleSearch(txt);
            }
          }}
          placeholder="Search Paddy, Urea, Mandya APMC, PM-KISAN..."
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
      </View>

      {/* Suggested Quick Search Tags */}
      {!searched && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionHeader}>Frequent Agronomic Searches:</Text>
          <View style={styles.tagsRow}>
            {['Sugarcane', 'Paddy Seeds', 'PM-KISAN', 'Mandya APMC', 'Drip Lateral', 'Rice Blast'].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagPill}
                  onPress={() => {
                    setQuery(tag);
                    handleSearch(tag);
                  }}
                >
                  <Text style={styles.tagTxt}>{tag}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTxt}>Searching All Agronomic Databases...</Text>
        </View>
      ) : searched ? (
        <View style={{ flex: 1 }}>
          <View style={styles.countRow}>
            <Text style={styles.countTxt}>
              Found {totalMatches} results for "{query}"
            </Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item, idx) => item.id + '_' + idx}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                title="No Matches Found"
                description={`No products, crops, schemes, or guides found for "${query}". Try another term.`}
                icon="🔍"
              />
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBarBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagTxt: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTxt: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  resultCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
