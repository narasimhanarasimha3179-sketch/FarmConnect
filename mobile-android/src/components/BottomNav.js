import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../services/AppContext';
import { COLORS } from '../constants/theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: '🌾' },
  { key: 'Scanner', label: 'AI Scan', icon: '📷' },
  { key: 'Marketplace', label: 'Market', icon: '🛒' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
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
    flexDirection: 'row',
    height: 64,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeLabel: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryLight,
    marginTop: 2,
  },
});