// FarmConnect Notification Infrastructure & Context
// Provides an in-app global notification banner manager for all screens and components

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, StatusBar } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const hideNotification = useCallback(() => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  }, [opacityAnim]);

  const showNotification = useCallback((type, message, title = null, duration = 4000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({ type, message, title });

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideNotification();
      }, duration);
    }
  }, [opacityAnim, hideNotification]);

  const showSuccess = useCallback((msg, title = 'Success') => showNotification('success', msg, title), [showNotification]);
  const showError = useCallback((msg, title = 'Error') => showNotification('error', msg, title, 5000), [showNotification]);
  const showWarning = useCallback((msg, title = 'Warning') => showNotification('warning', msg, title), [showNotification]);
  const showInfo = useCallback((msg, title = 'Notice') => showNotification('info', msg, title), [showNotification]);

  const getStyleForType = (type) => {
    switch (type) {
      case 'success':
        return { bg: colors.successBg, border: colors.success, text: colors.success, icon: '✓' };
      case 'warning':
        return { bg: colors.warningBg, border: colors.warning, text: colors.amber, icon: '⚠' };
      case 'error':
        return { bg: colors.errorBg, border: colors.error, text: colors.error, icon: '✕' };
      case 'info':
      default:
        return { bg: colors.infoBg, border: colors.info, text: colors.info, icon: 'ℹ' };
    }
  };

  const styleConfig = notification ? getStyleForType(notification.type) : null;

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
      }}
    >
      {children}
      {notification && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              opacity: opacityAnim,
              backgroundColor: styleConfig.bg,
              borderColor: styleConfig.border,
            },
          ]}
        >
          <View style={styles.contentRow}>
            <Text style={[styles.icon, { color: styleConfig.text }]}>{styleConfig.icon}</Text>
            <View style={styles.textColumn}>
              {notification.title ? (
                <Text style={[styles.title, { color: styleConfig.text }]}>{notification.title}</Text>
              ) : null}
              <Text style={styles.message}>{notification.message}</Text>
            </View>
            <TouchableOpacity onPress={hideNotification} style={styles.closeButton} accessibilityLabel="Close alert">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 48,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
    marginTop: 1,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.normal,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
});
