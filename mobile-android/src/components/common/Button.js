// FarmConnect Accessible Touch-Friendly Button
// Compliant with Android accessibility standards (minimum 48dp touch target)

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon = null,
  style = null,
  textStyle = null,
  accessibilityLabel,
}) {
  const getContainerStyle = () => {
    const base = [styles.button];

    // Size variants
    if (size === 'sm') base.push(styles.sizeSm);
    else if (size === 'lg') base.push(styles.sizeLg);
    else base.push(styles.sizeMd);

    // Visual variants
    switch (variant) {
      case 'secondary':
        base.push(styles.variantSecondary);
        break;
      case 'outline':
        base.push(styles.variantOutline);
        break;
      case 'text':
        base.push(styles.variantText);
        break;
      case 'danger':
        base.push(styles.variantDanger);
        break;
      case 'primary':
      default:
        base.push(styles.variantPrimary);
        break;
    }

    if (disabled || loading) {
      base.push(styles.disabled);
    }

    if (style) base.push(style);
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text];

    if (size === 'sm') base.push(styles.textSm);
    else if (size === 'lg') base.push(styles.textLg);
    else base.push(styles.textMd);

    switch (variant) {
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      case 'outline':
        base.push(styles.textOutline);
        break;
      case 'text':
        base.push(styles.textText);
        break;
      case 'danger':
        base.push(styles.textDanger);
        break;
      case 'primary':
      default:
        base.push(styles.textPrimary);
        break;
    }

    if (textStyle) base.push(textStyle);
    return base;
  };

  const spinnerColor =
    variant === 'outline' || variant === 'text' ? colors.primaryLight : colors.textInverse;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getContainerStyle()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Standard Android touch target
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: typography.weights.semiBold,
    textAlign: 'center',
  },
  // Sizes
  sizeSm: {
    minHeight: 38,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  sizeMd: {
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  sizeLg: {
    minHeight: 56,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
  textMd: {
    fontSize: typography.sizes.md,
  },
  textLg: {
    fontSize: typography.sizes.lg,
  },
  // Variants
  variantPrimary: {
    backgroundColor: colors.primaryLight,
  },
  textPrimary: {
    color: colors.textInverse,
  },
  variantSecondary: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  textSecondary: {
    color: colors.primary,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  textOutline: {
    color: colors.primaryLight,
  },
  variantText: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  textText: {
    color: colors.primaryLight,
  },
  variantDanger: {
    backgroundColor: colors.error,
  },
  textDanger: {
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.5,
    elevation: 0,
  },
});
