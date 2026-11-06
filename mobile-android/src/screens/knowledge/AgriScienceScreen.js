// FarmConnect Agricultural Science & Knowledge Center
// Phase 11 (Cultivation Guides), Phase 12 (Soil Health & NPK Calculator), Phase 13 (Pest & Disease Diagnosis)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header, LoadingIndicator, EmptyState } from '../../components/common';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '../../services/apiClient';

export default function AgriScienceScreen({ onBack, initialTab = 'guides' }) {
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState(initialTab); // 'guides' | 'soil' | 'pests'
  const [loading, setLoading] = useState(false);

  // Tab 1: Cultivation Guides
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [seasonalCalendar, setSeasonalCalendar] = useState(null);

  // Tab 2: Soil Health & NPK Calculator
  const [soilReports, setSoilReports] = useState([]);
  const [calcCrop, setCalcCrop] = useState('Paddy');
  const [calcAcres, setCalcAcres] = useState('2');
  const [calcN, setCalcN] = useState('220');
  const [calcP, setCalcP] = useState('18');
  const [calcK, setCalcK] = useState('250');
  const [npkResult, setNpkResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Tab 3: Pest & Disease Diagnostics
  const [pests, setPests] = useState([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedPest, setSelectedPest] = useState(null);
  const [diagResults, setDiagResults] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);

  useEffect(() => {
    loadGuides();
    loadSoilReports();
    loadPests();
  }, []);

  async function loadGuides() {
    try {
      const [gRes, cRes] = await Promise.all([
        apiClient.get('/crop-assistance/guides'),
        apiClient.get('/crop-assistance/calendar'),
      ]);
      if (gRes.data?.success) setGuides(gRes.data.data);
      if (cRes.data?.success) setSeasonalCalendar(cRes.data.data);
    } catch (err) {
      console.log('Guides load err:', err);
    }
  }

  async function loadSoilReports() {
    try {
      const res = await apiClient.get('/soil/reports');
      if (res.data?.success) setSoilReports(res.data.data);
    } catch (err) {
      console.log('Soil reports err:', err);
    }
  }

  async function loadPests() {
    try {
      const res = await apiClient.get('/pest-disease');
      if (res.data?.success) setPests(res.data.data);
    } catch (err) {
      console.log('Pests load err:', err);
    }
  }

  async function handleOpenGuide(id) {
    try {
      setLoading(true);
      const res = await apiClient.get(`/crop-assistance/guides/${id}`);
      if (res.data?.success) {
        setSelectedGuide(res.data.data);
      }
    } catch (err) {
      showError('Failed to load crop cultivation roadmap.', 'Guide Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculateNpk() {
    setCalculating(true);
    try {
      const res = await apiClient.post('/soil/npk-calculator', {
        crop_name: calcCrop,
        acres: parseFloat(calcAcres),
        soil_n: parseFloat(calcN),
        soil_p: parseFloat(calcP),
        soil_k: parseFloat(calcK),
      });
      if (res.data?.success) {
        setNpkResult(res.data);
        showSuccess('Precision fertilizer dosage calculated!', 'NPK Calculated');
      }
    } catch (err) {
      showError('Failed to calculate fertilizer requirements.', 'Calculation Error');
    } finally {
      setCalculating(false);
    }
  }

  async function handleDiagnoseSymptoms() {
    if (!symptomSearch.trim()) {
      showError('Please describe the observed symptoms.', 'Diagnostics');
      return;
    }
    setDiagnosing(true);
    try {
      const res = await apiClient.post('/pest-disease/diagnose', {
        observed_symptoms: symptomSearch.trim(),
      });
      if (res.data?.success) {
        setDiagResults(res.data);
      }
    } catch (err) {
      showError('Failed to diagnose symptoms.', 'Diagnosis Error');
    } finally {
      setDiagnosing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title="Agri-Science Knowledge Hub"
        subtitle="Crop roadmaps, soil nutrition & pest diagnostics"
        onBack={onBack}
        rightAction={<Badge label="ICAR / UAS CERTIFIED" variant="success" />}
      />

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'guides' && styles.activeTabItem]}
          onPress={() => setActiveTab('guides')}
        >
          <Text style={[styles.tabLabel, activeTab === 'guides' && styles.activeTabLabel]}>
            🌾 Crop Guides
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'soil' && styles.activeTabItem]}
          onPress={() => setActiveTab('soil')}
        >
          <Text style={[styles.tabLabel, activeTab === 'soil' && styles.activeTabLabel]}>
            🧪 Soil & NPK
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pests' && styles.activeTabItem]}
          onPress={() => setActiveTab('pests')}
        >
          <Text style={[styles.tabLabel, activeTab === 'pests' && styles.activeTabLabel]}>
            🛡 Pest & IPM
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* TAB 1: CROP CULTIVATION GUIDES (PHASE 11) */}
        {activeTab === 'guides' && (
          <View>
            {/* Seasonal Calendar Card */}
            {seasonalCalendar && (
              <Card style={styles.calendarCard}>
                <View style={styles.calHeader}>
                  <Text style={styles.calMonth}>📅 {seasonalCalendar.month} Activities ({seasonalCalendar.current_season})</Text>
                  <Badge label="ACTIVE SEASON" variant="success" />
                </View>
                {seasonalCalendar.key_activities.map((act, i) => (
                  <Text key={i} style={styles.calActivity}>• {act}</Text>
                ))}
              </Card>
            )}

            <Text style={styles.sectionHeading}>Crop Cultivation Roadmaps</Text>
            {guides.map((g) => (
              <Card key={g.id} style={styles.guideCard}>
                <View style={styles.guideHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guideTitle}>{g.crop_name}</Text>
                    <Text style={styles.guideSub}>Season: {g.season} • Soil: {g.soil_type}</Text>
                  </View>
                  <Button
                    title="View Roadmap"
                    size="sm"
                    variant="primary"
                    onPress={() => handleOpenGuide(g.id)}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 2: SOIL HEALTH & NPK CALCULATOR (PHASE 12) */}
        {activeTab === 'soil' && (
          <View>
            {/* Soil Health Card Summary */}
            <Text style={styles.sectionHeading}>📄 Your Field Soil Health Cards</Text>
            {soilReports.map((r) => (
              <Card key={r.id} style={styles.soilCard}>
                <View style={styles.soilHeader}>
                  <Text style={styles.farmTitle}>{r.farm_name}</Text>
                  <Badge label={r.fertility_rating} variant={r.fertility_rating === 'OPTIMAL' ? 'success' : 'warning'} />
                </View>

                <View style={styles.soilMetricsGrid}>
                  <View style={styles.soilCol}><Text style={styles.metricVal}>{r.ph}</Text><Text style={styles.metricLbl}>Soil pH</Text></View>
                  <View style={styles.soilCol}><Text style={styles.metricVal}>{r.nitrogen_kg_ha}</Text><Text style={styles.metricLbl}>Nitrogen (kg/ha)</Text></View>
                  <View style={styles.soilCol}><Text style={styles.metricVal}>{r.phosphorus_kg_ha}</Text><Text style={styles.metricLbl}>Phosphorus (kg/ha)</Text></View>
                  <View style={styles.soilCol}><Text style={styles.metricVal}>{r.potassium_kg_ha}</Text><Text style={styles.metricLbl}>Potassium (kg/ha)</Text></View>
                </View>

                <Text style={styles.testedDate}>Tested on: {r.tested_date} • Soil Type: {r.soil_type}</Text>
              </Card>
            ))}

            {/* Precision NPK Dosage Calculator */}
            <Card style={styles.calcCard}>
              <Text style={styles.calcTitle}>🧮 Precision Fertilizer Dosage Calculator</Text>
              <Text style={styles.calcSub}>Compute exact 50kg bags of Urea, DAP and MOP based on field soil test</Text>

              <View style={styles.calcFormRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLbl}>Target Crop</Text>
                  <TextInput style={styles.calcInput} value={calcCrop} onChangeText={setCalcCrop} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLbl}>Field Acres</Text>
                  <TextInput style={styles.calcInput} keyboardType="numeric" value={calcAcres} onChangeText={setCalcAcres} />
                </View>
              </View>

              <View style={styles.calcFormRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLbl}>Soil N (kg/ha)</Text>
                  <TextInput style={styles.calcInput} keyboardType="numeric" value={calcN} onChangeText={setCalcN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLbl}>Soil P (kg/ha)</Text>
                  <TextInput style={styles.calcInput} keyboardType="numeric" value={calcP} onChangeText={setCalcP} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLbl}>Soil K (kg/ha)</Text>
                  <TextInput style={styles.calcInput} keyboardType="numeric" value={calcK} onChangeText={setCalcK} />
                </View>
              </View>

              <Button
                title={calculating ? 'Computing...' : 'Calculate Fertilizer Dosage'}
                variant="primary"
                size="md"
                disabled={calculating}
                onPress={handleCalculateNpk}
                style={{ marginTop: spacing.sm }}
              />

              {npkResult && (
                <View style={styles.calcResultsBox}>
                  <Text style={styles.resultsHeading}>Required Commercial Fertilizer:</Text>
                  <View style={styles.bagRow}>
                    <View style={styles.bagBox}>
                      <Text style={styles.bagVal}>{npkResult.commercial_fertilizer_requirement.urea_50kg_bags} Bags</Text>
                      <Text style={styles.bagLbl}>Urea (46% N)</Text>
                    </View>
                    <View style={styles.bagBox}>
                      <Text style={styles.bagVal}>{npkResult.commercial_fertilizer_requirement.dap_50kg_bags} Bags</Text>
                      <Text style={styles.bagLbl}>DAP (18-46-0)</Text>
                    </View>
                    <View style={styles.bagBox}>
                      <Text style={styles.bagVal}>{npkResult.commercial_fertilizer_requirement.mop_50kg_bags} Bags</Text>
                      <Text style={styles.bagLbl}>MOP (60% K)</Text>
                    </View>
                  </View>
                  <Text style={styles.scheduleText}><Text style={styles.bold}>Basal: </Text>{npkResult.application_timeline.basal_sowing}</Text>
                  <Text style={styles.scheduleText}><Text style={styles.bold}>Tillering: </Text>{npkResult.application_timeline.tillering_stage}</Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* TAB 3: PEST & DISEASE DIAGNOSTICS (PHASE 13) */}
        {activeTab === 'pests' && (
          <View>
            <Card style={styles.diagCard}>
              <Text style={styles.diagTitle}>🔍 Immediate Symptom Diagnostic Engine</Text>
              <Text style={styles.diagSub}>Describe what you observe on leaves, shoots or grains (e.g. "dead heart", "concentric rings", "leaf blast")</Text>

              <TextInput
                style={styles.diagInput}
                placeholder="Enter field symptoms..."
                value={symptomSearch}
                onChangeText={setSymptomSearch}
                placeholderTextColor="#9ca3af"
              />

              <Button
                title={diagnosing ? 'Analyzing...' : 'Diagnose Symptoms'}
                variant="primary"
                size="sm"
                disabled={diagnosing}
                onPress={handleDiagnoseSymptoms}
              />

              {diagResults && (
                <View style={styles.diagResultsBox}>
                  <Text style={styles.diagResultTitle}>
                    Top Diagnosis: {diagResults.top_diagnosis?.name} ({diagResults.top_diagnosis?.confidence_percentage}% Match)
                  </Text>
                  <Text style={styles.diagScientific}>Scientific name: {diagResults.top_diagnosis?.scientific_name}</Text>
                  <Text style={styles.diagSymptoms}>Observed pattern: {diagResults.top_diagnosis?.symptoms}</Text>
                  <View style={styles.remedyBox}>
                    <Text style={styles.remedyLabel}>🌿 Biological Control (Zero Residue):</Text>
                    <Text style={styles.remedyVal}>{diagResults.top_diagnosis?.biological_control}</Text>
                    <Text style={[styles.remedyLabel, { marginTop: 4 }]}>🧪 Chemical Treatment (CIBRC Approved):</Text>
                    <Text style={styles.remedyVal}>{diagResults.top_diagnosis?.chemical_treatment}</Text>
                  </View>
                </View>
              )}
            </Card>

            <Text style={styles.sectionHeading}>Known Pest & Disease Profiles</Text>
            {pests.map((p) => (
              <Card key={p.id} style={styles.pestCard}>
                <View style={styles.pestHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pestName}>{p.name}</Text>
                    <Text style={styles.pestCrop}>Crop: {p.crop_name} • {p.scientific_name}</Text>
                  </View>
                  <Badge label={p.category} variant={p.category === 'PEST' ? 'warning' : 'danger'} />
                </View>
                <Text style={styles.pestSymptoms} numberOfLines={2}>Symptoms: {p.symptoms}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CROP GUIDE DETAIL MODAL */}
      <Modal visible={!!selectedGuide} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.guideModalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedGuide?.crop_name} Cultivation Guide</Text>
                <TouchableOpacity onPress={() => setSelectedGuide(null)}>
                  <Text style={styles.closeBtn}>✕ Close</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>Season: {selectedGuide?.season} • Climate: {selectedGuide?.climate}</Text>

              <Text style={styles.guideSectionHeading}>1. Land Preparation & Soil</Text>
              <Text style={styles.guideText}>{selectedGuide?.land_preparation}</Text>

              <Text style={styles.guideSectionHeading}>2. Seed Selection & Sowing</Text>
              <Text style={styles.guideText}>{selectedGuide?.seed_selection}</Text>
              <Text style={styles.guideText}>{selectedGuide?.sowing_guide}</Text>

              <Text style={styles.guideSectionHeading}>3. Stage-wise Irrigation Schedule</Text>
              {selectedGuide?.irrigation_stages?.map((stg, i) => (
                <View key={i} style={styles.stgItem}>
                  <Text style={styles.stgName}>• {stg.stage} ({stg.days})</Text>
                  <Text style={styles.stgNote}>{stg.note}</Text>
                </View>
              ))}

              <Text style={styles.guideSectionHeading}>4. Weed Management & Harvest</Text>
              <Text style={styles.guideText}>{selectedGuide?.weed_control}</Text>
              <Text style={styles.guideText}>{selectedGuide?.harvesting_tips}</Text>
              <Text style={styles.guideText}><Text style={styles.bold}>Post-Harvest: </Text>{selectedGuide?.post_harvest}</Text>
            </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    fontWeight: typography.weights.medium,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  scroll: {
    padding: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  calendarCard: {
    padding: spacing.md,
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  calMonth: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#166534',
  },
  calActivity: {
    fontSize: typography.sizes.xs,
    color: '#15803d',
    marginVertical: 2,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  guideCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  guideSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  soilCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  soilHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  farmTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  soilMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: spacing.xs,
    borderRadius: 6,
    marginVertical: spacing.xs,
  },
  soilCol: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  metricLbl: {
    fontSize: 9,
    color: '#6b7280',
  },
  testedDate: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  calcCard: {
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  calcTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  calcSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  calcFormRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputLbl: {
    fontSize: 10,
    color: '#374151',
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  calcInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    fontSize: typography.sizes.xs,
    color: '#111827',
  },
  calcResultsBox: {
    marginTop: spacing.md,
    backgroundColor: '#f0fdf4',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  resultsHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#166534',
    marginBottom: spacing.xs,
  },
  bagRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  bagBox: {
    alignItems: 'center',
  },
  bagVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#166534',
  },
  bagLbl: {
    fontSize: 10,
    color: '#15803d',
  },
  scheduleText: {
    fontSize: 10,
    color: '#166534',
    marginVertical: 2,
  },
  bold: {
    fontWeight: typography.weights.bold,
  },
  diagCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  diagTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  diagSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  diagInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.sm,
    color: '#111827',
    marginBottom: spacing.sm,
  },
  diagResultsBox: {
    marginTop: spacing.md,
    backgroundColor: '#fffbeb',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  diagResultTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#92400e',
  },
  diagScientific: {
    fontSize: typography.sizes.xs,
    color: '#b45309',
    fontStyle: 'italic',
    marginTop: 2,
  },
  diagSymptoms: {
    fontSize: typography.sizes.xs,
    color: '#78350f',
    marginVertical: 4,
  },
  remedyBox: {
    backgroundColor: '#ffffff',
    padding: spacing.xs,
    borderRadius: 4,
    marginTop: 4,
  },
  remedyLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#374151',
  },
  remedyVal: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 14,
  },
  pestCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  pestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pestName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  pestCrop: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  pestSymptoms: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  guideModalCard: {
    maxHeight: '90%',
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#111827',
  },
  closeBtn: {
    fontSize: typography.sizes.sm,
    color: '#ef4444',
    fontWeight: typography.weights.bold,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  guideSectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  guideText: {
    fontSize: typography.sizes.xs,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  stgItem: {
    marginVertical: 2,
  },
  stgName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#1f2937',
  },
  stgNote: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
});
