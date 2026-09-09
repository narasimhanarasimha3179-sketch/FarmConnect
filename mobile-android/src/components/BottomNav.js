import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../services/AppContext';
import { COLORS } from '../constants/theme';

export default function BottomNav() {
  const { activeTab, setActiveTab, user } = useApp();
  const role = (user?.role || 'farmer').toLowerCase();

  // Dynamically configure tabs per user role
  const navItems = [
    { id: 'Home', label: 'Mandi', icon: '📊' },

    // Pathology Scanner only visible for Farmers and Experts
    ...(role === 'farmer' || role === 'expert'
      ? [{ id: 'Scanner', label: role === 'expert' ? 'Pathology' : 'Scanner', icon: '📷' }]
      : []),

    // Harvest lot auctions visible for Farmers, Buyers, and Experts
    ...(role === 'farmer' || role === 'buyer' || role === 'expert'
      ? [{ id: 'Marketplace', label: role === 'buyer' ? 'Bidding' : 'Market', icon: '🌾' }]
      : []),

    // Agri Supplies & Catalog visible for Farmers, Agri-Sellers, and Buyers
    ...(role === 'agri_seller' || role === 'farmer' || role === 'buyer'
      ? [{ id: 'Store', label: role === 'agri_seller' ? 'My Catalog' : 'Supplies', icon: '🛍️' }]
      : []),

    { id: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
});