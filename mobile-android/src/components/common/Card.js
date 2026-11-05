// FarmConnect Elevated Card Container
// Core visual container for agricultural metrics, mandi ticker cards, and market items

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export default function Card({
  children,
  onPress = null,
  style = null,
  variant = 'elevated', // 'elevated' | 'outlined' | 'flat'
  padding = 'md',       // 'none' | 'sm' | 'md' | 'lg'
  accessibilityLabel,
}) {
  const getCardStyle = () => {
    const list = [styles.card];

    if (variant === 'outlined') list.push(styles.variantOutlined);
    else if (variant === 'flat') list.push(styles.variantFlat);
    else list.push(styles.variantElevated);

    if (padding === 'none') list.push(styles.paddingNone);
    else if (padding === 'sm') list.push(styles.paddingSm);
    else if (padding === 'lg') list.push(styles.paddingLg);
    else list.push(styles.paddingMd);

    if (style) list.push(style);
    return list;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={getCardStyle()}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  variantElevated: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variantOutlined: {
    borderWidth: 1.5,
    borderColor: colors.border,
    elevation: 0,
  },
  variantFlat: {
    backgroundColor: colors.surfaceMuted,
    elevation: 0,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: spacing.sm,
  },
  paddingMd: {
    padding: spacing.md,
  },
  paddingLg: {
    padding: spacing.lg,
  },
});
