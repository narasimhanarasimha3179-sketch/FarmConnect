// FarmConnect Government Agricultural Schemes Hub (Phase 18)
// Central & Karnataka State welfare schemes, eligibility checklists & direct application portal links

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function GovernmentSchemesScreen({ onBack }) {
  const { showSuccess, showError, showInfo } = useNotification();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('ALL'); // 'ALL', 'Central', 'Karnataka'
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL', 'FINANCIAL', 'SUBSIDY', 'IRRIGATION', 'INSURANCE'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSchemes();
  }, [selectedState, selectedCategory]);

  async function loadSchemes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState !== 'ALL') params.append('state', selectedState);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiClient.get(`/schemes?${params.toString()}`);
      if (res.data?.success) {
        setSchemes(res.data.data);
      }
    } catch (err) {
      showError('Failed to load welfare schemes.', 'Schemes Error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPortal(url) {
    if (url) {
      showInfo(`Opening official government portal: ${url}`, 'External Portal');
      // In mobile environment, Linking.openURL(url) opens system browser
    }
  }

  const categories = ['ALL', 'FINANCIAL', 'SUBSIDY', 'IRRIGATION', 'INSURANCE'];

  return (
    <View style={styles.container}>
      <Header
        title="Government Agricultural Schemes"
        subtitle="Central & Karnataka State welfare assistance & subsidies"
        onBack={onBack}
        rightAction={<Badge label="OFFICIAL DBT" variant="success" />}
      />

      {/* State Filter Bar */}
      <View style={styles.stateBar}>
        {['ALL', 'Karnataka', 'Central'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.stateBtn, selectedState === s && styles.activeStateBtn]}
            onPress={() => setSelectedState(s)}
          >
            <Text style={[styles.stateBtnText, selectedState === s && styles.activeStateBtnText]}>
              {s === 'ALL' ? '🌐 All Portals' : s === 'Karnataka' ? '🟡 Karnataka State' : '🇮🇳 Central Govt'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.activeCatChip]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.activeCatChipText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schemes Directory */}
      {loading ? (
        <LoadingIndicator text="Fetching latest welfare schemes & subsidy allotments..." />
      ) : schemes.length === 0 ? (
        <EmptyState title="No Schemes Found" message="Try selecting another category or state filter." />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {schemes.map((scheme) => (
            <Card key={scheme.id} style={styles.schemeCard}>
              <View style={styles.schemeHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.schemeTitle}>{scheme.title}</Text>
                  <Text style={styles.schemeSub}>{scheme.state} • {scheme.category}</Text>
                </View>
                <Badge
                  label={scheme.state === 'Karnataka' ? 'KARNATAKA' : 'CENTRAL'}
                  variant={scheme.state === 'Karnataka' ? 'warning' : 'primary'}
                />
              </View>

              <View style={styles.benefitBox}>
                <Text style={styles.benefitLead}>💰 Benefits & Subsidy:</Text>
                <Text style={styles.benefitText}>{scheme.benefits}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>📋 Eligibility Criteria:</Text>
                <Text style={styles.infoBody}>{scheme.eligibility}</Text>

                <Text style={[styles.infoTitle, { marginTop: spacing.xs }]}>📑 Required Documents:</Text>
                <Text style={styles.infoBody}>{scheme.required_documents}</Text>

                <Text style={styles.deadlineText}>⏰ Application Deadline: {scheme.deadline}</Text>
              </View>

              <View style={styles.portalActionRow}>
                <Button
                  title="Check Eligibility & Apply Now ↗"
                  variant="primary"
                  size="sm"
                  onPress={() => handleOpenPortal(scheme.application_url)}
                  style={styles.flexBtn}
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: spacing.xs,
  },
  stateBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  activeStateBtn: {
    backgroundColor: colors.primary,
  },
  stateBtnText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  activeStateBtnText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  categoryScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  catChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCatChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  catChipText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  activeCatChipText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  scroll: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  schemeCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  schemeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  schemeSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  benefitBox: {
    backgroundColor: '#f0fdf4',
    padding: spacing.sm,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
    marginVertical: spacing.xs,
  },
  benefitLead: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#166534',
  },
  benefitText: {
    fontSize: typography.sizes.xs,
    color: '#15803d',
    lineHeight: 18,
    marginTop: 2,
  },
  infoSection: {
    marginVertical: spacing.xs,
  },
  infoTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#374151',
  },
  infoBody: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    lineHeight: 18,
    marginTop: 1,
  },
  deadlineText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 6,
    fontStyle: 'italic',
  },
  portalActionRow: {
    marginTop: spacing.xs,
  },
  flexBtn: {
    flex: 1,
  },
});
