// FarmConnect Loading Indicator & Agricultural Progress Spinner
// Clear, communicative loading states preventing farmer uncertainty on slower 3G/4G connections

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function LoadingIndicator({
  message = 'Loading...',
  subtext = null,
  size = 'large',
  color = colors.primaryLight,
  fullscreen = false,
  style = null,
}) {
  const content = (
    <View style={[styles.container, fullscreen ? styles.fullscreen : null, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 999,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  subtext: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
