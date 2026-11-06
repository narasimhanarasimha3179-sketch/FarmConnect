// FarmConnect Agricultural Digital Knowledge Library Screen (Phase 23)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme';
import { Header, Card, Badge, Input, EmptyState, Button } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function LibraryScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchArticles = async (cat, search) => {
    try {
      setLoading(true);
      let url = '/library/articles?limit=20';
      if (cat) url += `&category=${cat}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await apiClient.get(url);
      if (res.data?.success) {
        setArticles(res.data.articles || []);
      }
    } catch (err) {
      console.error('fetchArticles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/library/categories');
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('fetchCategories error:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const handleCategorySelect = (cat) => {
    const nextCat = selectedCategory === cat ? null : cat;
    setSelectedCategory(nextCat);
    fetchArticles(nextCat, searchQuery);
  };

  const handleSearch = () => {
    fetchArticles(selectedCategory, searchQuery);
  };

  const renderArticle = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => setSelectedArticle(item)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Badge label={item.category.replace(/_/g, ' ')} variant="primary" />
          <Text style={styles.readTime}>⏱️ {item.read_time_mins} min read</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.summary}>{item.summary}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.author}>✍️ {item.author}</Text>
          <Text style={styles.readMore}>Read Guide →</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Krishi Knowledge Library" showBack onBack={() => navigation?.goBack?.()} />

      <View style={styles.searchSection}>
        <View style={{ flex: 1 }}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search agronomy, soil, irrigation..."
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text style={[styles.chipTxt, !selectedCategory && styles.chipTxtActive]}>All Guides</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.category}
              style={[styles.chip, selectedCategory === c.category && styles.chipActive]}
              onPress={() => handleCategorySelect(c.category)}
            >
              <Text style={[styles.chipTxt, selectedCategory === c.category && styles.chipTxtActive]}>
                {c.category.replace(/_/g, ' ')} ({c.article_count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="No Articles Found"
              description="No agricultural library guides matched your query."
              icon="📚"
            />
          }
        />
      )}

      {/* Article Detail Reading Modal */}
      <Modal visible={!!selectedArticle} animationType="slide" transparent onRequestClose={() => setSelectedArticle(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Badge label={selectedArticle?.category || 'AGRONOMY'} variant="primary" />
              <TouchableOpacity onPress={() => setSelectedArticle(null)}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.articleScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalArticleTitle}>{selectedArticle?.title}</Text>
              <Text style={styles.modalAuthor}>Author: {selectedArticle?.author}</Text>
              <Text style={styles.modalDate}>Published: {selectedArticle?.published_at?.split('T')[0]}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>Overview & Field Objective</Text>
              <Text style={styles.modalSummary}>{selectedArticle?.summary}</Text>

              <Text style={styles.sectionHeader}>Cultivation Principles & Protocol</Text>
              <Text style={styles.modalBody}>{selectedArticle?.content}</Text>

              <Button
                title="Close Guide"
                variant="neutral"
                onPress={() => setSelectedArticle(null)}
                style={{ marginTop: 24, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chipsRow: {
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTxt: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTxtActive: {
    color: '#FFF',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 8,
  },
  author: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  readMore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeTxt: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  articleScroll: {
    marginTop: 8,
  },
  modalArticleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  modalAuthor: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  modalDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  modalSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  modalBody: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
