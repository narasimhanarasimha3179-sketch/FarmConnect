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
import { useLanguage } from '../../context/LanguageContext';
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
import CartModal from '../buyer/CartModal';

export default function FarmerDashboardScreen({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const { t } = useLanguage();

  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  // Add Crop Form State
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState('2026-08-01');
  const [harvestExpected, setHarvestExpected] = useState('2026-12-20');
  const [areaAcres, setAreaAcres] = useState('');
  const [stage, setStage] = useState('Vegetative');
  const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

  // Publish Harvest Modal State
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [hCropName, setHCropName] = useState('Sugarcane');
  const [hVariety, setHVariety] = useState('Co 86032');
  const [hQty, setHQty] = useState('45');
  const [hPrice, setHPrice] = useState('3200');
  const [hMandiLoc, setHMandiLoc] = useState('Mandya APMC Market Yard');
  const [hGrade, setHGrade] = useState('Grade A');
  const [isSubmittingHarvest, setIsSubmittingHarvest] = useState(false);

  // My Published Harvest & Buyer Bids
  const [myHarvestListings, setMyHarvestListings] = useState([]);
  const [incomingOffers, setIncomingOffers] = useState([]);

  // Farm Accounting Ledger State
  const [finSeedCost, setFinSeedCost] = useState('4500');
  const [finFertCost, setFinFertCost] = useState('8200');
  const [finLaborCost, setFinLaborCost] = useState('11000');
  const [finPowerCost, setFinPowerCost] = useState('3500');
  const [finYieldQtl, setFinYieldQtl] = useState('45');
  const [finSalePrice, setFinSalePrice] = useState('3200');

  // Precision Irrigation State
  const [irrigCrop, setIrrigCrop] = useState('Sugarcane');
  const [irrigSoil, setIrrigSoil] = useState('Red Loam');
  const [irrigAcres, setIrrigAcres] = useState('2.5');

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

  const loadFarmerMarketData = async () => {
    try {
      const [listRes, enqRes] = await Promise.all([
        apiClient.get('/crop-market/farmer/my-listings'),
        apiClient.get('/crop-market/farmer/enquiries'),
      ]);
      const lData = listRes.data || listRes;
      if (lData?.success && lData.data) {
        setMyHarvestListings(lData.data);
      }
      const eData = enqRes.data || enqRes;
      if (eData?.success && eData.data) {
        setIncomingOffers(eData.data);
      }
    } catch (err) {
      console.log('Error loading farmer market data:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadFarmerMarketData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadDashboard(), loadFarmerMarketData()]);
    setIsRefreshing(false);
    showSuccess('Refreshed live telemetry, market listings & bids', 'Data Updated');
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

  const handlePublishHarvest = async () => {
    if (!hCropName || !hQty || !hPrice || !hMandiLoc) {
      showError('Crop name, quantity, price, and location are required.', 'Missing Info');
      return;
    }
    setIsSubmittingHarvest(true);
    try {
      const res = await apiClient.post('/crop-market/listings', {
        crop_name: hCropName,
        variety: hVariety || 'Local Hybrid',
        quantity_available: Number(hQty),
        unit: 'Quintal',
        expected_price: Number(hPrice),
        mandi_location: hMandiLoc,
        quality_grade: hGrade,
        harvest_date: new Date().toISOString().split('T')[0],
        description: `Direct farm lot of ${hCropName} (${hVariety}) from Mandya. Ready for APMC wholesale delivery.`,
      });
      const data = res.data || res;
      if (data?.success || res.success) {
        showSuccess(`Harvest listing for ${hCropName} published to live APMC market!`, 'Listing Live');
        setShowHarvestModal(false);
        await Promise.all([loadDashboard(), loadFarmerMarketData()]);
      } else {
        showError(data?.message || res.message || 'Failed to publish harvest', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Network Error');
    } finally {
      setIsSubmittingHarvest(false);
    }
  };

  const handleRespondOffer = async (enquiryId, status) => {
    try {
      const res = await apiClient.put(`/crop-market/enquiries/${enquiryId}/status`, { status });
      const data = res.data || res;
      if (data?.success || res.success) {
        showSuccess(`Buyer counter-offer marked as ${status}!`, 'Offer Updated');
        await loadFarmerMarketData();
      } else {
        showError(data?.message || res.message || 'Failed to update offer', 'Error');
      }
    } catch (err) {
      showError(err.message, 'Error');
    }
  };

  // Financial Ledger Computations
  const totalExpenses = (Number(finSeedCost) || 0) + (Number(finFertCost) || 0) + (Number(finLaborCost) || 0) + (Number(finPowerCost) || 0);
  const totalGrossRev = (Number(finYieldQtl) || 0) * (Number(finSalePrice) || 0);
  const netFarmProfit = totalGrossRev - totalExpenses;
  const farmRoiPercent = totalExpenses > 0 ? Math.round((netFarmProfit / totalExpenses) * 100) : 0;

  // Precision Irrigation Computations
  const cropWaterCoeff = irrigCrop === 'Sugarcane' ? 7000 : irrigCrop === 'Paddy' ? 8500 : irrigCrop === 'Tomato' ? 4200 : 3200;
  const soilFactor = irrigSoil === 'Sandy Loam' ? 1.2 : irrigSoil === 'Black Clay' ? 0.85 : 1.0;
  const totalWaterLitresDay = Math.round((Number(irrigAcres) || 1) * cropWaterCoeff * soilFactor);
  const pumpHoursDay = (totalWaterLitresDay / 18000).toFixed(1);

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
            <Text style={styles.quickLaunchTextPrimary}>{t('scan_leaf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setShowCartModal(true)}>
            <Text style={styles.quickLaunchIcon}>🛒</Text>
            <Text style={styles.quickLaunchText}>{t('cart')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('ai')}>
            <Text style={styles.quickLaunchIcon}>🤖</Text>
            <Text style={styles.quickLaunchText}>{t('ai_assistant')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('soil')}>
            <Text style={styles.quickLaunchIcon}>🧪</Text>
            <Text style={styles.quickLaunchText}>{t('soil_health')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLaunchChipSecondary} onPress={() => setActiveView('schemes')}>
            <Text style={styles.quickLaunchIcon}>🏛️</Text>
            <Text style={styles.quickLaunchText}>{t('schemes')}</Text>
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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>💰 Produce Marketplace & Orders</Text>
            <Badge label="DIRECT APMC TRADE" variant="success" size="sm" />
          </View>
          <View style={styles.tradeMetricsRow}>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeVal}>{myHarvestListings.length || summary.active_produce_listings}</Text>
              <Text style={styles.tradeLbl}>Active Listings</Text>
            </View>
            <View style={styles.tradeMetric}>
              <Text style={styles.tradeVal}>{incomingOffers.length || summary.pending_buyer_enquiries}</Text>
              <Text style={styles.tradeLbl}>Buyer Offers</Text>
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
            title="+ List New Harvest on Mandi Market"
            variant="primary"
            size="sm"
            onPress={() => setShowHarvestModal(true)}
            style={styles.tradeBtn}
          />

          {/* Incoming Buyer Counter-Offers */}
          {incomingOffers.length > 0 ? (
            <View style={styles.offersSection}>
              <Text style={styles.subSectionTitle}>📨 Incoming Buyer Price Offers & Bids:</Text>
              {incomingOffers.map((enq) => (
                <View key={enq.id} style={styles.offerItem}>
                  <View style={styles.offerHeader}>
                    <Text style={styles.offerBuyer}>{enq.buyer_name || 'Wholesale Buyer'} ({enq.buyer_phone || 'Verified'})</Text>
                    <Badge
                      label={enq.status}
                      variant={enq.status === 'ACCEPTED' ? 'success' : enq.status === 'DECLINED' ? 'error' : 'warning'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.offerCrop}>
                    Crop: <Text style={{ fontWeight: 'bold' }}>{enq.crop_name}</Text> • Offr: <Text style={{ fontWeight: 'bold', color: colors.primary }}>₹{enq.offered_price}/qtl</Text> for {enq.quantity_requested} {enq.unit || 'Quintals'}
                  </Text>
                  {enq.message ? <Text style={styles.offerMsg}>"{enq.message}"</Text> : null}
                  {enq.status === 'PENDING' ? (
                    <View style={styles.offerActionRow}>
                      <TouchableOpacity
                        style={styles.offerAcceptBtn}
                        onPress={() => handleRespondOffer(enq.id, 'ACCEPTED')}
                      >
                        <Text style={styles.offerAcceptTxt}>✓ Accept Bid</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.offerDeclineBtn}
                        onPress={() => handleRespondOffer(enq.id, 'DECLINED')}
                      >
                        <Text style={styles.offerDeclineTxt}>✕ Decline</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Farmer's Active Listings */}
          {myHarvestListings.length > 0 ? (
            <View style={styles.myListingsBox}>
              <Text style={styles.subSectionTitle}>🌾 Your Active Market Lots:</Text>
              {myHarvestListings.map((lot) => (
                <View key={lot.id} style={styles.lotRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lotCropName}>{lot.crop_name} ({lot.variety})</Text>
                    <Text style={styles.lotMeta}>{lot.quantity_available} Quintals • {lot.mandi_location}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.lotPrice}>₹{lot.expected_price}/qtl</Text>
                    <Badge label={lot.quality_grade || 'Grade A'} variant="neutral" size="sm" />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {/* 6B. Farm Financial Ledger & Profit/Acre Calculator */}
        <Card style={styles.financeCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📊 Farm Cost & Net Profit Ledger</Text>
            <Badge label="ROI CALCULATOR" variant="primary" size="sm" />
          </View>
          <Text style={styles.financeSub}>Track production inputs vs harvest yield to compute exact net profit per acre.</Text>

          <View style={styles.financeInputsGrid}>
            <View style={styles.financeInputCol}>
              <Input label="Seed / Seedling Cost (₹)" value={finSeedCost} onChangeText={setFinSeedCost} keyboardType="numeric" />
              <Input label="Fertilizer & Sprays (₹)" value={finFertCost} onChangeText={setFinFertCost} keyboardType="numeric" />
            </View>
            <View style={styles.financeInputCol}>
              <Input label="Labor & Tractor Rent (₹)" value={finLaborCost} onChangeText={setFinLaborCost} keyboardType="numeric" />
              <Input label="Diesel / Power / Irrig (₹)" value={finPowerCost} onChangeText={setFinPowerCost} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.financeInputsGrid}>
            <View style={styles.financeInputCol}>
              <Input label="Harvest Yield (Quintals)" value={finYieldQtl} onChangeText={setFinYieldQtl} keyboardType="numeric" />
            </View>
            <View style={styles.financeInputCol}>
              <Input label="Selling Price (₹/Quintal)" value={finSalePrice} onChangeText={setFinSalePrice} keyboardType="numeric" />
            </View>
          </View>

          {/* Ledger Output Box */}
          <View style={styles.financeOutputBox}>
            <View style={styles.financeMetricRow}>
              <Text style={styles.finMetricLbl}>Total Input Expenses:</Text>
              <Text style={styles.finMetricVal}>₹{totalExpenses.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.financeMetricRow}>
              <Text style={styles.finMetricLbl}>Gross Harvest Revenue:</Text>
              <Text style={styles.finMetricVal}>₹{totalGrossRev.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.financeDivider} />
            <View style={styles.financeMetricRow}>
              <Text style={[styles.finMetricLbl, { fontWeight: 'bold', fontSize: typography.sizes.sm }]}>Estimated Net Profit:</Text>
              <Text style={[styles.finMetricVal, { color: netFarmProfit >= 0 ? colors.success : colors.error, fontSize: typography.sizes.md, fontWeight: 'bold' }]}>
                ₹{netFarmProfit.toLocaleString('en-IN')} ({farmRoiPercent}% ROI)
              </Text>
            </View>
          </View>
        </Card>

        {/* 6C. Precision Drip & Borewell Irrigation Scheduler */}
        <Card style={styles.irrigationCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>💧 Precision Drip & Borewell Scheduler</Text>
            <Badge label="WATER MANAGEMENT" variant="info" size="sm" />
          </View>
          <Text style={styles.financeSub}>Calculate daily crop evapotranspiration & pump runtime for a 5 HP borewell (300 LPM).</Text>

          <View style={styles.pillRow}>
            {['Sugarcane', 'Paddy', 'Tomato', 'Ragi'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.smallPill, irrigCrop === c && styles.smallPillActive]}
                onPress={() => setIrrigCrop(c)}
              >
                <Text style={[styles.smallPillTxt, irrigCrop === c && styles.smallPillTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.pillRow, { marginTop: 6 }]}>
            {['Red Loam', 'Black Clay', 'Sandy Loam'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.smallPill, irrigSoil === s && styles.smallPillActive]}
                onPress={() => setIrrigSoil(s)}
              >
                <Text style={[styles.smallPillTxt, irrigSoil === s && styles.smallPillTxtActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: spacing.xs }}>
            <Input label="Land Cultivation Area (Acres)" value={irrigAcres} onChangeText={setIrrigAcres} keyboardType="numeric" />
          </View>

          <View style={styles.irrigationResultBox}>
            <View style={styles.irrigStat}>
              <Text style={styles.irrigVal}>{totalWaterLitresDay.toLocaleString('en-IN')} L</Text>
              <Text style={styles.irrigLbl}>Daily Water Requirement</Text>
            </View>
            <View style={styles.irrigStat}>
              <Text style={[styles.irrigVal, { color: colors.skyBlue }]}>{pumpHoursDay} Hours</Text>
              <Text style={styles.irrigLbl}>5 HP Borewell Runtime</Text>
            </View>
          </View>
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

      {/* Publish Harvest on Mandi Modal */}
      <Modal visible={showHarvestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>💰 List Harvest on Mandi Market</Text>
            <Text style={styles.modalSub}>Publish your produce to licensed APMC buyers & food processing stockists.</Text>

            <Input label="Crop Name" placeholder="e.g. Sugarcane, Paddy, Tomato" value={hCropName} onChangeText={setHCropName} />
            <Input label="Variety" placeholder="e.g. Co 86032, Sona Masoori BPT 5204" value={hVariety} onChangeText={setHVariety} />
            <Input label="Quantity (Quintals)" placeholder="e.g. 50" value={hQty} onChangeText={setHQty} keyboardType="numeric" />
            <Input label="Expected Modal Price (₹/Quintal)" placeholder="e.g. 3200" value={hPrice} onChangeText={setHPrice} keyboardType="numeric" />
            <Input label="APMC Yard Location" placeholder="e.g. Mandya APMC Yard" value={hMandiLoc} onChangeText={setHMandiLoc} />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" variant="outline" size="md" onPress={() => setShowHarvestModal(false)} style={styles.btnFlex} />
              <Button title="Publish Lot" variant="primary" size="md" loading={isSubmittingHarvest} onPress={handlePublishHarvest} style={styles.btnFlex} />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Farmer Agri Input Cart & Multi-Payment Checkout Modal */}
      <CartModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onOrderPlaced={() => {
          showSuccess('Order confirmed! Input supplies will be dispatched.', 'Order Placed');
          setShowCartModal(false);
        }}
      />
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
  // Incoming Offers & My Listings
  offersSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  subSectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  offerItem: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  offerBuyer: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  offerCrop: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  offerMsg: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  offerActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  offerAcceptBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  offerAcceptTxt: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  offerDeclineBtn: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  offerDeclineTxt: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  myListingsBox: {
    marginTop: spacing.sm,
  },
  lotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lotCropName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  lotMeta: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  lotPrice: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  // Financial Ledger
  financeCard: {
    padding: spacing.md,
    backgroundColor: '#F9FDF9',
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  financeSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  financeInputsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  financeInputCol: {
    flex: 1,
  },
  financeOutputBox: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  financeMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  finMetricLbl: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  finMetricVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  financeDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  // Irrigation Scheduler
  irrigationCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.skyBlue,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  smallPill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
  },
  smallPillActive: {
    backgroundColor: colors.primary,
  },
  smallPillTxt: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  smallPillTxtActive: {
    color: '#ffffff',
  },
  irrigationResultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.skyBlueBg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  irrigStat: {
    alignItems: 'center',
    flex: 1,
  },
  irrigVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  irrigLbl: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
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
