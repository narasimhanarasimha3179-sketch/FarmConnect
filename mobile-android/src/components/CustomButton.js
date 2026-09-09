import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  loading = false,
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        isPrimary && styles.primaryBtn,
        variant === 'secondary' && styles.secondaryBtn,
        isOutline && styles.outlineBtn,
        (disabled || loading) && styles.disabledBtn,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : '#ffffff'} size="small" />
      ) : (
        <Text
          style={[
            TYPOGRAPHY.buttonText,
            isOutline && styles.outlineText,
            variant === 'secondary' && styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  secondaryBtn: {
    backgroundColor: COLORS.accentSoft,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  outlineText: {
    color: COLORS.primaryLight,
  },
  secondaryText: {
    color: COLORS.primary,
  },
});