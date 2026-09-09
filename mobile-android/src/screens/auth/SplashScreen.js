import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useApp } from '../../services/AppContext';
import { COLORS, SPACING } from '../../constants/theme';

export default function SplashScreen() {
  const { setCurrentScreen, user } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      // If user session exists, route to Main; otherwise prompt Onboarding/Login
      if (user) {
        setCurrentScreen('Main');
      } else {
        setCurrentScreen('Onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🌱</Text>
        </View>
        <Text style={styles.title}>FarmConnect</Text>
        <Text style={styles.tagline}>Smart Agricultural Ecosystem</Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.loadingText}>Initializing workspace...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
  },
  iconText: {
    fontSize: 44,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#c8e6c9',
    marginTop: SPACING.xs,
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  loadingText: {
    color: '#e8f5e9',
    fontSize: 12,
    marginTop: 6,
  },
});