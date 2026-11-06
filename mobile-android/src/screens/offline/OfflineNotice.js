// FarmConnect Offline Resilience & Network State Indicator (Phase 28)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { accessibleTouchTarget } from '../../utils/accessibility';

export default function OfflineNotice({ isOffline = false, onRetry }) {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>Offline Mode Active</Text>
          <Text style={styles.subtitle}>Displaying cached agricultural data from local device storage.</Text>
        </View>
        {onRetry ? (
          <TouchableOpacity
            style={[styles.retryBtn, accessibleTouchTarget]}
            onPress={onRetry}
            accessible={true}
            accessibilityLabel="Retry internet connection"
          >
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#37474F',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#ECEFF1',
    fontWeight: 'bold',
    fontSize: 13,
  },
  subtitle: {
    color: '#B0BEC5',
    fontSize: 11,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retryTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
