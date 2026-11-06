// FarmConnect Agricultural Weather & Field Advisory Screen (Phase 10)
// Location-based meteorological telemetry, daily forecasts, rain alerts & irrigation guidance

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function WeatherScreen({ onBack }) {
  const { showError, showInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Mandya');
  const [weatherData, setWeatherData] = useState(null);
  const [advisories, setAdvisories] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  useEffect(() => {
    loadWeatherData(selectedDistrict);
    loadDistricts();
  }, [selectedDistrict]);

  async function loadDistricts() {
    try {
      const res = await apiClient.get('/weather/districts');
      if (res.data?.success) {
        setDistrictsList(res.data.data);
      }
    } catch (err) {
      console.log('Districts load error:', err);
    }
  }

  async function loadWeatherData(district) {
    setLoading(true);
    try {
      const [currRes, advRes] = await Promise.all([
        apiClient.get(`/weather/current?district=${encodeURIComponent(district)}`),
        apiClient.get(`/weather/advisories?district=${encodeURIComponent(district)}`),
      ]);

      if (currRes.data?.success) {
        setWeatherData(currRes.data.data);
      }
      if (advRes.data?.success) {
        setAdvisories(advRes.data.advisories || []);
      }
    } catch (err) {
      showError('Failed to load localized weather telemetry.', 'Weather Error');
    } finally {
      setLoading(false);
    }
  }

  const supportedDistricts = ['Mandya', 'Mysuru', 'Kolar', 'Hubli', 'Raichur'];

  return (
    <View style={styles.container}>
      <Header
        title="Agro-Weather Telemetry"
        subtitle="Location-based rainfall forecasts & crop advisories"
        onBack={onBack}
        rightAction={
          <Badge
            label={`${weatherData?.temp_c || 29}°C • ${weatherData?.condition || 'Fair'}`}
            variant="success"
          />
        }
      />

      {/* District Selector Chips */}
      <View style={styles.districtBar}>
        <Text style={styles.districtLabel}>District:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {supportedDistricts.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.districtChip, selectedDistrict === d && styles.activeDistrictChip]}
              onPress={() => setSelectedDistrict(d)}
            >
              <Text style={[styles.districtChipText, selectedDistrict === d && styles.activeDistrictChipText]}>
                📍 {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingIndicator text="Fetching micro-climatic sensor feed..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* CURRENT WEATHER HERO CARD */}
          <Card style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.districtTitle}>{weatherData?.district}, {weatherData?.state}</Text>
                <Text style={styles.conditionSub}>{weatherData?.condition}</Text>
              </View>
              <Text style={styles.weatherIcon}>
                {weatherData?.rainfall_chance > 50 ? '🌧' : weatherData?.temp_c > 30 ? '☀️' : '⛅'}
              </Text>
            </View>

            <View style={styles.heroMetricRow}>
              <Text style={styles.tempLarge}>{weatherData?.temp_c}°<Text style={styles.tempUnit}>C</Text></Text>
              <View style={styles.metricsCol}>
                <Text style={styles.metricItem}>💧 Humidity: <Text style={styles.boldMetric}>{weatherData?.humidity}%</Text></Text>
                <Text style={styles.metricItem}>🌧 Rain Chance: <Text style={styles.boldMetric}>{weatherData?.rainfall_chance}%</Text></Text>
                <Text style={styles.metricItem}>💨 Wind Speed: <Text style={styles.boldMetric}>{weatherData?.wind_speed_kmh} km/h</Text></Text>
              </View>
            </View>

            <View style={styles.advisoryBanner}>
              <Text style={styles.advisoryLead}>🌱 Real-time Field Advisory:</Text>
              <Text style={styles.advisoryText}>{weatherData?.advisory}</Text>
            </View>
          </Card>

          {/* 4-DAY FORECAST CARDS */}
          <Text style={styles.sectionHeading}>📅 4-Day Daily Agro-Forecast</Text>
          <View style={styles.forecastGrid}>
            {weatherData?.forecast?.map((day, idx) => (
              <Card key={idx} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <Text style={styles.forecastEmoji}>
                  {day.rain > 50 ? '🌧' : day.temp > 30 ? '☀️' : '⛅'}
                </Text>
                <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                <Text style={styles.forecastCondition}>{day.condition}</Text>
                <Badge
                  label={`${day.rain}% Rain`}
                  variant={day.rain > 50 ? 'warning' : 'neutral'}
                  size="sm"
                />
              </Card>
            ))}
          </View>

          {/* SMART FIELD ADVISORIES */}
          <Text style={styles.sectionHeading}>🚜 Smart Agronomic Recommendations</Text>
          {advisories.map((adv, idx) => (
            <Card key={idx} style={styles.advCard}>
              <View style={styles.advHeader}>
                <Text style={styles.advTitle}>{adv.title}</Text>
                <Badge
                  label={adv.urgency}
                  variant={
                    adv.urgency === 'HOLD' || adv.urgency === 'WARNING'
                      ? 'danger'
                      : adv.urgency === 'HIGH_PRIORITY'
                      ? 'warning'
                      : 'success'
                  }
                />
              </View>
              <Text style={styles.advRecommendation}>{adv.recommendation}</Text>
            </Card>
          ))}

          {/* SENSOR REFRESH TIMESTAMP */}
          <Text style={styles.syncTime}>
            Official telemetry synchronized: {new Date(weatherData?.updated_at || Date.now()).toLocaleTimeString()}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  districtBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  districtLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  districtChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  activeDistrictChip: {
    backgroundColor: colors.primary,
  },
  districtChipText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    fontWeight: typography.weights.medium,
  },
  activeDistrictChipText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  scroll: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    padding: spacing.md,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  districtTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#065f46',
  },
  conditionSub: {
    fontSize: typography.sizes.sm,
    color: '#047857',
    marginTop: 2,
  },
  weatherIcon: {
    fontSize: 36,
  },
  heroMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  tempLarge: {
    fontSize: 44,
    fontWeight: typography.weights.bold,
    color: '#065f46',
  },
  tempUnit: {
    fontSize: typography.sizes.lg,
    color: '#047857',
  },
  metricsCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metricItem: {
    fontSize: typography.sizes.xs,
    color: '#065f46',
  },
  boldMetric: {
    fontWeight: typography.weights.bold,
    color: '#047857',
  },
  advisoryBanner: {
    backgroundColor: '#ffffff',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  advisoryLead: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  advisoryText: {
    fontSize: typography.sizes.xs,
    color: '#374151',
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  forecastCard: {
    width: '23%',
    padding: spacing.xs,
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  forecastEmoji: {
    fontSize: 20,
    marginVertical: 2,
  },
  forecastTemp: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  forecastCondition: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  advCard: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  advHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  advTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  advRecommendation: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    lineHeight: 18,
  },
  syncTime: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
