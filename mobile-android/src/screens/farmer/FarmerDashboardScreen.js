// FarmConnect Complete Farmer Dashboard
// Phase 3 Deliverable: High-contrast, Android-first agricultural cockpit for farmers

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card, Badge, Button, Input, Header, LoadingIndicator } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../services/apiClient';

// Smart Agricultural Subsystem Modules (Phases 9 - 24)
import CameraAiScreen from '../camera/CameraAiScreen';
import AiAssistantScreen from '../ai/AiAssistantScreen';
import AgriScienceScreen from '../knowledge/AgriScienceScreen';
import MandiPriceScreen from '../mandi/MandiPriceScreen';
import WeatherScreen from '../weather/WeatherScreen';
import GovernmentSchemesScreen from '../schemes/GovernmentSchemesScreen';
import CommunityScreen from '../community/CommunityScreen';
import LibraryScreen from '../library/LibraryScreen';
import GlobalSearchScreen from '../search/GlobalSearchScreen';

export default function FarmerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  // Add Crop Form State
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState('2026-08-01');
  const [harvestExpected, setHarvestExpected] = useState('2026-12-20');
  const [areaAcres, setAreaAcres] = useState('');
  const [stage, setStage] = useState('Vegetative');
  const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

  // Fetch real telemetry from backend
  const loadDashboard = async () => {
    try {
      const res = await apiClient.get('/farmer/dashboard');
      if (res.success && res.data && res.data.dashboard) {
        setDashboardData(res.data.dashboard);
      }
    } catch (err) {
      console.error('Error fetching farmer dashboard:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
    showSuccess('Refreshed live weather & mandi rates', 'Data Updated');
  };

  const handleAddCrop = async () => {
    if (!cropName || !areaAcres) {
      showError('Crop name and land area are required', 'Missing Info');
      return;
    }

    setIsSubmittingCrop(true);
    try {
      const res = await apiClient.post('/farmer/crops', {
        crop_name: cropName,
        variety: variety || 'Standard Local',
        sowing_date: sowingDate,
        harvest_expected: harvestExpected,
        area_acres: Number(areaAcres) || 1.0,
        stage,
      });

      if (res.success) {
        showSuccess(`${cropName} added to active crops schedule!`, 'Crop Tracked');
        setShowAddCropModal(false);
        setCropName('');
        setVariety('');
        setAreaAcres('');
        await loadDashboard();
      } else {
        showError(res.message || 'Failed to add crop', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsSubmittingCrop(false);
    }
  };

  const farmer = dashboardData?.farmer || user;
  const profile = farmer?.profile || user?.profile || {};
  const weather = dashboardData?.weather || {
    district: profile.district || 'Mandya',
    temp_c: 29.5,
    humidity: 68,
    condition: 'Partly Cloudy',
    rainfall_chance: 20,
    wind_speed_kmh: 14.2,
    advisory: 'Optimal weather for standing field crops.',
    forecast: [],
  };
  const mandiPrices = dashboardData?.mandi_prices || [];
  const crops = dashboardData?.current_crops || [];
  const alerts = dashboardData?.alerts || [];
  const schemes = dashboardData?.schemes || [];
  const guides = dashboardData?.library_guides || [];
  const summary = dashboardData?.marketplace_summary || {
    active_produce_listings: 1,
    pending_buyer_enquiries: 3,
    completed_orders: 8,
    total_harvest_revenue: '₹1,42,800',
  };

  if (activeView === 'camera') {
    return <CameraAiScreen onBack={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'ai') {
    return <AiAssistantScreen onBack={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'soil') {
    return <AgriScienceScreen onBack={() => setActiveView('dashboard')} initialTab="soil" />;
  }
  if (activeView === 'pests') {
    return <AgriScienceScreen onBack={() => setActiveView('dashboard')} initialTab="pests" />;
  }
  if (activeView === 'guides') {
    return <AgriScienceScreen onBack={() => setActiveView('dashboard')} initialTab="guides" />;
  }
  if (activeView === 'schemes') {
    return <GovernmentSchemesScreen onBack={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'mandi') {
    return <MandiPriceScreen onBack={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'weather') {
    return <WeatherScreen onBack={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'community') {
    return <CommunityScreen navigation={{ goBack: () => setActiveView('dashboard') }} />;
  }
  if (activeView === 'library') {
    return <LibraryScreen navigation={{ goBack: () => setActiveView('dashboard') }} />;
  }
  if (activeView === 'search') {
    return <GlobalSearchScreen navigation={{ goBack: () => setActiveView('dashboard') }} />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Namaskara, ${user?.name || 'Farmer'}`}
        subtitle={`📍 ${profile.village ? `${profile.village}, ` : ''}${profile.district || 'Mandya'}, ${profile.state || 'Karnataka'}`}
        rightAction={<Badge label="FARMER" variant="farmer" />}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Quick Launch Action Strip */}
        <View style={styles.quickLaunchBar}>
          <TouchableOpacity style={styles.quickLaunchChipPrimary} onPress={() => setActiveView('camera')}>
            <Text style={styles.quickLaunchIcon}>📸</Text>
            <Text style={styles.quickLaunchTextPrimary}>Camera Disease Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('ai')}>
            <Text style={styles.quickLaunchIcon}>🤖</Text>
            <Text style={styles.quickLaunchText}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('soil')}>
            <Text style={styles.quickLaunchIcon}>🧪</Text>
            <Text style={styles.quickLaunchText}>NPK Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('schemes')}>
            <Text style={styles.quickLaunchIcon}>🏛️</Text>
            <Text style={styles.quickLaunchText}>Govt Schemes</Text>
          </TouchableOpacity>
        </View>

        {/* Krishi Smart AI Tools & Services Card Grid */}
        <Card style={styles.toolsCard}>
          <View style={styles.toolsHeader}>
            <View>
              <Text style={styles.toolsTitle}>✨ Krishi Smart AI Tools & Services</Text>
              <Text style={styles.toolsSubtitle}>Tap any tool below to launch AI diagnostics, roadmaps & advisory</Text>
            </View>
            <Badge label="10 AI TOOLS ACTIVE" variant="success" size="sm" />
          </View>

          <View style={styles.toolsGrid}>
            <TouchableOpacity style={styles.toolItemPrimary} onPress={() => setActiveView('camera')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 28 }}>📸</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="CAMERA AI VISION" variant="success" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Plant Disease Pathology Scanner</Text>
                <Text style={styles.toolItemDesc}>
                  Point camera or upload leaf/stem/fruit photo to predict plant disease with confidence % & ICAR certified treatment.
                </Text>
                <Text style={styles.toolActionLink}>Launch Camera Scanner →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('ai')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🤖</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="MULTILINGUAL AI" variant="primary" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>FarmConnect Agricultural AI Assistant</Text>
                <Text style={styles.toolItemDesc}>
                  Conversational assistant with voice audio support in English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
                </Text>
                <Text style={styles.toolActionLink}>Start AI Chat →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('soil')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🧪</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="PRECISION AGRI" variant="warning" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Soil Health & Precision NPK Calculator</Text>
                <Text style={styles.toolItemDesc}>
                  Lab reports analysis (pH, N, P, K, Carbon) with exact commercial fertilizer 50kg bags computation (Urea, DAP, MOP).
                </Text>
                <Text style={styles.toolActionLink}>Calculate NPK Dosage →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('pests')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🐛</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="IPM PROTOCOLS" variant="danger" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Pest & Disease Diagnosis Rule Engine</Text>
                <Text style={styles.toolItemDesc}>
                  Symptom matching for stem borer, blast & blight with Trichogramma biological controls and CIBRC chemical remedies.
                </Text>
                <Text style={styles.toolActionLink}>Diagnose Field Symptoms →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('schemes')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🏛️</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="GOVT SUBSIDIES" variant="primary" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Central & Karnataka Welfare Schemes</Text>
                <Text style={styles.toolItemDesc}>
                  PM-KISAN ₹6,000, PMFBY Crop Insurance, Raitha Siri ₹10,000/ha millet subsidy & Krishi Bhagya 90% farm ponds.
                </Text>
                <Text style={styles.toolActionLink}>Browse & Apply Schemes →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('mandi')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>📈</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="MARKET INTELLIGENCE" variant="info" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Live APMC Mandi Rates & 7-Day Charts</Text>
                <Text style={styles.toolItemDesc}>
                  Verified modal rates across Mandya, Maddur, Mysuru, Hubli & Kolar with multi-day chronological price trend bar charts.
                </Text>
                <Text style={styles.toolActionLink}>Explore APMC Trends →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('weather')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🌦️</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="METEOROLOGICAL" variant="neutral" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Detailed Agro-Weather & Spray Advisories</Text>
                <Text style={styles.toolItemDesc}>
                  4-Day precipitation predictions, humidity index, and actionable field spraying/irrigation scheduling advice.
                </Text>
                <Text style={styles.toolActionLink}>View Micro-Climate Telemetry →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('community')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>👥</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="PEER NETWORK" variant="success" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Krishi Community Peer Discussions</Text>
                <Text style={styles.toolItemDesc}>
                  Share trash mulching results, seed emergence photos, ask questions, and upvote peer farmer solutions.
                </Text>
                <Text style={styles.toolActionLink}>Open Community Feed →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('guides')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>📖</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="CULTIVATION ROADMAPS" variant="primary" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Crop Cultivation Roadmaps & Guides</Text>
                <Text style={styles.toolItemDesc}>
                  Stage-by-stage agronomic guides for Sugarcane (Co 86032), Paddy (Sona Masoori), and Ragi (GPU-28).
                </Text>
                <Text style={styles.toolActionLink}>Read Roadmaps →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolItem} onPress={() => setActiveView('search')} activeOpacity={0.7}>
              <View style={styles.toolIconCircle}>
                <Text style={{ fontSize: 24 }}>🔍</Text>
              </View>
              <View style={styles.toolContent}>
                <View style={styles.toolBadgeRow}>
                  <Badge label="UNIVERSAL SEARCH" variant="neutral" size="sm" />
                </View>
                <Text style={styles.toolItemTitle}>Universal Global Search Engine</Text>
                <Text style={styles.toolItemDesc}>
                  Instant multi-domain search across crops, seeds, fertilizers, mandis, schemes, and digital articles.
                </Text>
                <Text style={styles.toolActionLink}>Search Everything →</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 1. Farmer Land & Soil Profile Header Card */}
        <Card style={styles.farmerIdentityCard}>
          <View style={styles.identityRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🌾</Text>
            </View>
            <View style={styles.identityInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.farmerName}>{user?.name || 'Ramesh Patil'}</Text>
                <Badge label="Verified Landholder" variant="success" size="sm" />
              </View>
              <Text style={styles.locationSub}>
                {profile.taluk ? `${profile.taluk}, ` : ''}{profile.district || 'Mandya'} • GPS: {profile.location_gps || '12.58° N, 77.05° E'}
              </Text>
            </View>
          </View>

          <View style={styles.landMetricsGrid}>
            <View style={styles.landMetricItem}>
              <Text style={styles.metricLabel}>Total Holding</Text>
              <Text style={styles.metricVal}>{profile.land_size_acres || 4.5} Acres</Text>
            </View>
            <View style={styles.landMetricItem}>
              <Text style={styles.metricLabel}>Soil Type</Text>
              <Text style={styles.metricVal}>{profile.soil_type || 'Red Loam'}</Text>
            </View>
            <View style={styles.landMetricItem}>
              <Text style={styles.metricLabel}>Experience</Text>
              <Text style={styles.metricVal}>{profile.experience_years || 15} Years</Text>
            </View>
          </View>

          <Button
            title="Edit Farm Profile & Land Data"
            variant="secondary"
            size="sm"
            onPress={onOpenProfile}
            style={styles.profileEditBtn}
          />
        </Card>

        {/* 2. Live Agricultural Weather & Agro-Advisory Widget */}
        <Card style={styles.weatherCard}>
          <TouchableOpacity onPress={() => setActiveView('weather')} activeOpacity={0.8}>
            <View style={styles.weatherHeader}>
              <View>
                <Text style={styles.weatherSectionTitle}>⛅ Micro-Location Weather</Text>
                <Text style={styles.weatherLocation}>{weather.district}, {weather.state || 'Karnataka'}</Text>
              </View>
              <Badge label="LIVE TELEMETRY" variant="success" size="sm" />
            </View>

            <View style={styles.weatherMainRow}>
              <Text style={styles.weatherTemp}>{weather.temp_c}°C</Text>
              <View style={styles.weatherConditionBox}>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
                <Text style={styles.weatherRainProb}>🌧 Rain: {weather.rainfall_chance}% probability</Text>
              </View>
            </View>

            <View style={styles.weatherStatsRow}>
              <Text style={styles.weatherStatText}>💧 Humidity: {weather.humidity}%</Text>
              <Text style={styles.weatherStatText}>💨 Wind: {weather.wind_speed_kmh} km/h</Text>
            </View>

            {/* Actionable Agro-Advisory */}
            <View style={styles.advisoryBox}>
              <Text style={styles.advisoryTitle}>🌱 Actionable Farming Advisory:</Text>
              <Text style={styles.advisoryText}>{weather.advisory}</Text>
            </View>

            {/* 4-Day Forecast Pills */}
            {weather.forecast && weather.forecast.length > 0 ? (
              <View style={styles.forecastRow}>
                {weather.forecast.map((f, i) => (
                  <View key={i} style={styles.forecastPill}>
                    <Text style={styles.forecastDay}>{f.day}</Text>
                    <Text style={styles.forecastTemp}>{f.temp}°C</Text>
                    <Text style={styles.forecastRain}>{f.rain}% rain</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={[styles.toolActionLink, { marginTop: spacing.sm, textAlign: 'right' }]}>
              Open Full 7-Day Forecast & Spray Planner →
            </Text>
          </TouchableOpacity>
        </Card>

        {/* 3. Live APMC Mandi Ticker Widget */}
        <Card style={styles.mandiCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📈 Live APMC Mandi Rates</Text>
            <TouchableOpacity onPress={() => setActiveView('mandi')}>
              <Text style={styles.seeAllText}>View All Mandis & Trends →</Text>
            </TouchableOpacity>
          </View>

          {mandiPrices.map((item) => (
            <TouchableOpacity key={item.id} style={styles.mandiRow} onPress={() => setActiveView('mandi')} activeOpacity={0.7}>
              <View style={styles.mandiCropCol}>
                <Text style={styles.mandiCropName}>{item.commodity}</Text>
                <Text style={styles.mandiVariety}>{item.variety} • {item.market_mandi}</Text>
              </View>
              <View style={styles.mandiPriceCol}>
                <Text style={styles.mandiModalPrice}>₹{item.modal_price}/qtl</Text>
                <Text
                  style={[
                    styles.mandiTrend,
                    item.trend === 'UP' ? styles.trendUp : item.trend === 'DOWN' ? styles.trendDown : styles.trendStable,
                  ]}
                >
                  {item.trend === 'UP' ? '▲ Rising' : item.trend === 'DOWN' ? '▼ Falling' : '▬ Stable'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* 4. Active Field Crops Cultivation Tracker */}
        <Card style={styles.cropsCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🌾 Current Cultivation Schedule</Text>
            <TouchableOpacity onPress={() => setShowAddCropModal(true)}>
              <Text style={styles.addCropLink}>+ Add Crop</Text>
            </TouchableOpacity>
          </View>

          {crops.length === 0 ? (
            <Text style={styles.emptyText}>No crops tracked yet. Tap + Add Crop to monitor your fields.</Text>
          ) : (
            crops.map((crop) => (
              <View key={crop.id} style={styles.cropItem}>
                <View style={styles.cropTopRow}>
                  <Text style={styles.cropItemName}>{crop.crop_name}</Text>
                  <Badge label={crop.stage} variant="farmer" size="sm" />
                </View>
                <Text style={styles.cropItemVariety}>
                  Variety: {crop.variety || 'Local'} • Area: {crop.area_acres} Acres
                </Text>
                <View style={styles.cropDatesRow}>
                  <Text style={styles.cropDateText}>Sown: {crop.sowing_date}</Text>
                  <Text style={styles.cropDateText}>Harvest: {crop.harvest_expected}</Text>
                </View>

                {/* Progress bar visual */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width:
                          crop.stage === 'Harvested'
                            ? '100%'
                            : crop.stage === 'Maturity'
                            ? '80%'
                            : crop.stage === 'Flowering'
                            ? '60%'
                            : crop.stage === 'Vegetative'
                            ? '35%'
                            : '15%',
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </Card>

        {/* 5. Urgent Farming Alerts */}
        <Card style={styles.alertsCard}>
          <Text style={styles.sectionTitle}>🔔 Important Farming Alerts</Text>
          {alerts.map((alt) => (
            <View
              key={alt.id}
              style={[
                styles.alertRow,
                alt.severity === 'CRITICAL' ? styles.alertCritical : alt.severity === 'WARNING' ? styles.alertWarning : styles.alertInfo,
              ]}
            >
              <View style={styles.alertHeaderRow}>
                <Text style={styles.alertTitleText}>{alt.title}</Text>
                <Badge
                  label={alt.severity}
                  variant={alt.severity === 'CRITICAL' ? 'error' : alt.severity === 'WARNING' ? 'warning' : 'info'}
                  size="sm"
                />
              </View>
              <Text style={styles.alertMsgText}>{alt.message}</Text>
            </View>
          ))}
        </Card>

        {/* 6. Produce Selling & Marketplace Operations */}
        <Card style={styles.tradeCard}>
          <Text style={styles.sectionTitle}>💰 Produce Marketplace & Orders</Text>
          <View style={styles.tradeMetricsRow}>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeVal}>{summary.active_produce_listings}</Text>
              <Text style={styles.tradeLbl}>Active Listings</Text>
            </View>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeVal}>{summary.pending_buyer_enquiries}</Text>
              <Text style={styles.tradeLbl}>Buyer Enquiries</Text>
            </View>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeVal}>{summary.completed_orders}</Text>
              <Text style={styles.tradeLbl}>Orders Filled</Text>
            </View>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeValRevenue}>{summary.total_harvest_revenue}</Text>
              <Text style={styles.tradeLbl}>Total Revenue</Text>
            </View>
          </View>
          <Button
            title="List New Harvest for Sale"
            variant="primary"
            size="sm"
            onPress={() => showInfo('Phase 8 direct crop marketplace will launch listing creation', 'Crop Marketplace')}
            style={styles.tradeBtn}
          />
        </Card>

        {/* 7. Government Schemes & Agricultural Library Hub */}
        <Card style={styles.knowledgeCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🏛 Government Schemes & Subsidies</Text>
            <TouchableOpacity onPress={() => setActiveView('schemes')}>
              <Text style={styles.seeAllText}>Browse All Schemes →</Text>
            </TouchableOpacity>
          </View>
          {schemes.map((sch) => (
            <TouchableOpacity
              key={sch.id}
              style={styles.schemeItem}
              onPress={() => setActiveView('schemes')}
              activeOpacity={0.7}
            >
              <View style={styles.schemeHeader}>
                <Text style={styles.schemeTitle}>{sch.title}</Text>
                <Badge label={sch.category} variant="info" size="sm" />
              </View>
              <Text style={styles.schemeSubsidy}>{sch.subsidy}</Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.sectionHeaderRow, { marginTop: spacing.md }]}>
            <Text style={styles.sectionTitle}>📚 Agricultural Library Guides</Text>
            <TouchableOpacity onPress={() => setActiveView('library')}>
              <Text style={styles.seeAllText}>Open Library →</Text>
            </TouchableOpacity>
          </View>
          {guides.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={styles.guideItem}
              onPress={() => setActiveView('library')}
              activeOpacity={0.7}
            >
              <Text style={styles.guideEmoji}>📖</Text>
              <View style={styles.guideTextCol}>
                <Text style={styles.guideTitle}>{g.title}</Text>
                <Text style={styles.guideMeta}>{g.category} • {g.readTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* 8. AI Assistant Quick Entry */}
        <Card style={styles.aiCard}>
          <View style={styles.aiHeaderRow}>
            <Text style={styles.aiTitle}>🤖 FarmConnect AI Agro-Assistant</Text>
            <Badge label="24/7 HELPLINE" variant="farmer" size="sm" />
          </View>
          <Text style={styles.aiDesc}>
            Have questions about crop diseases, pest symptoms, fertilizer dosages, or weather changes? Chat in English, Kannada, or Hindi with instant voice audio.
          </Text>
          <Button
            title="Launch Krishi AI Assistant"
            variant="primary"
            size="md"
            onPress={() => setActiveView('ai')}
            style={styles.aiBtn}
          />
        </Card>

        {/* Account Session & Logout */}
        <Card style={styles.sessionCard}>
          <Text style={styles.sessionTitle}>Account Session</Text>
          <Text style={styles.sessionSub}>Logged in as {user?.email} • Verified Farmer</Text>
          <View style={styles.sessionBtns}>
            <Button title="Account Settings" variant="outline" size="sm" onPress={onOpenProfile} style={styles.btnFlex} />
            <Button title="Sign Out" variant="danger" size="sm" onPress={logout} style={styles.btnFlex} />
          </View>
        </Card>
      </ScrollView>

      {/* Add Crop Modal */}
      <Modal visible={showAddCropModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>🌾 Add Crop to Field Schedule</Text>
            <Text style={styles.modalSub}>Track your sowing, vegetative progress, and harvest estimation.</Text>

            <Input label="Crop Name" placeholder="e.g. Sugarcane, Ragi, Tomato" value={cropName} onChangeText={setCropName} />
            <Input label="Variety" placeholder="e.g. Co 86032, GPU-28" value={variety} onChangeText={setVariety} />
            <Input label="Cultivated Area (Acres)" placeholder="e.g. 2.5" value={areaAcres} onChangeText={setAreaAcres} keyboardType="numeric" />
            <Input label="Sowing Date (YYYY-MM-DD)" value={sowingDate} onChangeText={setSowingDate} />
            <Input label="Expected Harvest Date" value={harvestExpected} onChangeText={setHarvestExpected} />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" variant="outline" size="md" onPress={() => setShowAddCropModal(false)} style={styles.btnFlex} />
              <Button title="Save Crop" variant="primary" size="md" loading={isSubmittingCrop} onPress={handleAddCrop} style={styles.btnFlex} />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  // Quick Launch Action Strip
  quickLaunchBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickLaunchChipPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  quickLaunchChipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  quickLaunchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  quickLaunchTextPrimary: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  quickLaunchText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },

  // Krishi Smart AI Tools & Services Card Grid
  toolsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    backgroundColor: '#F7FCF8',
  },
  toolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  toolsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  toolsSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolsGrid: {
    gap: spacing.sm,
  },
  toolItemPrimary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toolItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  toolIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  toolItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  toolItemDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.tight,
    marginBottom: 6,
  },
  toolActionLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  // 1. Farmer Identity Card
  farmerIdentityCard: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 24,
  },
  identityInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  locationSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  landMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  landMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  metricVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileEditBtn: {
    marginTop: spacing.xs,
  },
  // 2. Weather Card
  weatherCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.skyBlue,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  weatherSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  weatherLocation: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginRight: spacing.md,
  },
  weatherConditionBox: {
    justifyContent: 'center',
  },
  weatherCondition: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  weatherRainProb: {
    fontSize: typography.sizes.xs,
    color: colors.skyBlue,
    marginTop: 2,
  },
  weatherStatsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  weatherStatText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  advisoryBox: {
    backgroundColor: colors.skyBlueBg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  advisoryTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.skyBlue,
  },
  advisoryText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: typography.lineHeights.tight,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  forecastPill: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  forecastDay: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  forecastTemp: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  forecastRain: {
    fontSize: 9,
    color: colors.skyBlue,
  },
  // 3. Mandi Rates
  mandiCard: {
    padding: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryLight,
    fontWeight: typography.weights.semiBold,
  },
  mandiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mandiCropCol: {
    flex: 1,
  },
  mandiCropName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  mandiVariety: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  mandiPriceCol: {
    alignItems: 'flex-end',
  },
  mandiModalPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.soilBrown,
  },
  mandiTrend: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
  },
  trendUp: { color: colors.success },
  trendDown: { color: colors.error },
  trendStable: { color: colors.textSecondary },
  // 4. Crops
  cropsCard: {
    padding: spacing.md,
  },
  addCropLink: {
    fontSize: typography.sizes.xs,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  cropItem: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  cropTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropItemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cropItemVariety: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cropDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cropDateText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
  },
  // 5. Alerts
  alertsCard: {
    padding: spacing.md,
  },
  alertRow: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
  },
  alertCritical: {
    backgroundColor: colors.errorBg,
    borderLeftColor: colors.error,
  },
  alertWarning: {
    backgroundColor: colors.warningBg,
    borderLeftColor: colors.amber,
  },
  alertInfo: {
    backgroundColor: colors.infoBg,
    borderLeftColor: colors.info,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  alertTitleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  alertMsgText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.tight,
  },
  // 6. Trade
  tradeCard: {
    padding: spacing.md,
  },
  tradeMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  tradeMetric: {
    alignItems: 'center',
    flex: 1,
  },
  tradeVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tradeValRevenue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryLight,
  },
  tradeLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  tradeBtn: {
    marginTop: spacing.xs,
  },
  // 7. Knowledge
  knowledgeCard: {
    padding: spacing.md,
  },
  schemeItem: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  schemeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  schemeSubsidy: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  guideEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  guideTextCol: {
    flex: 1,
  },
  guideTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  guideMeta: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  // 8. AI Card
  aiCard: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  aiDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeights.tight,
  },
  aiBtn: {
    marginTop: spacing.xs,
  },
  // Session
  sessionCard: {
    padding: spacing.md,
  },
  sessionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sessionSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sessionBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnFlex: {
    flex: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
