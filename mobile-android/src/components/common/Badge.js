// FarmConnect Status & Role Badge
// Clean visual pill for roles (Farmer, Buyer, Seller, Admin) and item statuses (Available, In-Stock, Pending)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export default function Badge({
  label,
  variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info' | 'farmer' | 'buyer' | 'seller' | 'admin'
  size = 'md',        // 'sm' | 'md'
  style = null,
}) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBg, text: colors.success };
      case 'warning':
        return { bg: colors.warningBg, text: colors.amber };
      case 'error':
        return { bg: colors.errorBg, text: colors.error };
      case 'info':
        return { bg: colors.infoBg, text: colors.info };
      case 'farmer':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'buyer':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'seller':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'admin':
        return { bg: '#f3e8ff', text: '#7e22ce' };
      case 'default':
      default:
        return { bg: colors.surfaceMuted, text: colors.textSecondary };
    }
  };

  const badgeConfig = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeConfig.bg },
        isSm ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: badgeConfig.text },
          isSm ? styles.textSm : styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  badgeMd: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontWeight: typography.weights.semiBold,
  },
  textSm: {
    fontSize: typography.sizes.xs - 2,
  },
  textMd: {
    fontSize: typography.sizes.xs,
  },
});
