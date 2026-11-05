// FarmConnect Top Application Header
// Standardized Android-first top bar with agricultural branding, back navigation, and right actions

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

export default function Header({
  title = 'FarmConnect',
  subtitle = null,
  onBack = null,
  rightAction = null,
  style = null,
}) {
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.contentRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleColumn}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 44,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: typography.sizes.xl,
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.primaryBg,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: spacing.md,
  },
});
