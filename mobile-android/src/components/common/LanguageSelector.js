// FarmConnect Instant Language Selector Component (Phase 16)
// Touch-optimized switcher for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ style = null, compact = false }) {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ', full: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिन्दी', full: 'हिन्दी' },
  ];

  return (
    <View style={[styles.container, compact ? styles.compactContainer : null, style]}>
      <Text style={styles.icon}>🌐</Text>
      {languages.map((lang) => {
        const isActive = currentLanguage === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.pill, isActive ? styles.pillActive : null]}
            onPress={() => changeLanguage(lang.code)}
            accessibilityRole="button"
            accessibilityLabel={`Switch language to ${lang.full}`}
          >
            <Text style={[styles.pillText, isActive ? styles.pillTextActive : null]}>
              {compact ? lang.label : lang.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  compactContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 13,
    marginRight: 2,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  pillActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pillTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
