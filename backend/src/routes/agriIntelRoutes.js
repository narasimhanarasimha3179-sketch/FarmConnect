const express = require('express');
const router = express.Router();
const SoilReport = require('../models/SoilReport');

// Agronomic Knowledge Base
const CROP_DATABASE = [
  {
    name: 'Sona Masoori Paddy',
    soilTypes: ['Clayey', 'Alluvial', 'Black Soil'],
    minPh: 5.5, maxPh: 7.2,
    season: 'Kharif',
    waterRequirement: 'High',
    durationDays: 135,
    expectedYieldQuintalPerAcre: 24,
    bestDistricts: ['Mandya', 'Raichur', 'Shimoga', 'Bellary']
  },
  {
    name: 'Hybrid Maize',
    soilTypes: ['Red Loamy', 'Sandy Loam', 'Alluvial'],
    minPh: 5.8, maxPh: 7.8,
    season: 'Kharif / Rabi',
    waterRequirement: 'Medium',
    durationDays: 110,
    expectedYieldQuintalPerAcre: 30,
    bestDistricts: ['Davanagere', 'Haveri', 'Belagavi']
  },
  {
    name: 'Ragi (Finger Millet)',
    soilTypes: ['Red Loamy', 'Laterite', 'Sandy Loam'],
    minPh: 4.8, maxPh: 7.5,
    season: 'Kharif',
    waterRequirement: 'Low',
    durationDays: 105,
    expectedYieldQuintalPerAcre: 14,
    bestDistricts: ['Tumakuru', 'Kolar', 'Hassan', 'Mandya']
  },
  {
    name: 'Byadagi Chilli',
    soilTypes: ['Black Soil', 'Red Loamy'],
    minPh: 6.0, maxPh: 7.5,
    season: 'Kharif',
    waterRequirement: 'Medium',
    durationDays: 150,
    expectedYieldQuintalPerAcre: 10,
    bestDistricts: ['Haveri', 'Dharwad', 'Gadag']
  },
  {
    name: 'Groundnut (Peanut)',
    soilTypes: ['Sandy Loam', 'Red Loamy'],
    minPh: 6.0, maxPh: 7.0,
    season: 'Kharif / Summer',
    waterRequirement: 'Low to Medium',
    durationDays: 115,
    expectedYieldQuintalPerAcre: 12,
    bestDistricts: ['Chitradurga', 'Tumakuru', 'Kolar']
  }
];

// In-memory fallback array for reports
let fallbackReports = [];

// POST: Analyze Soil Parameters & Produce Diagnostic Action Card
router.post('/soil-analysis', async (req, res) => {
  try {
    const { farmerName, farmLocation, soilType, phLevel, nitrogen, phosphorus, potassium, organicCarbon } = req.body;

    const ph = parseFloat(phLevel);
    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);

    const deficiencies = [];
    const fertilizerRecs = [];

    // NPK standard benchmarks for arable land (kg/ha)
    // Nitrogen: Low < 280, Medium 280-560, High > 560
    if (n < 280) {
      deficiencies.push('Nitrogen Deficiency (Stunted foliage & pale chlorosis)');
      fertilizerRecs.push('Apply Urea @ 55 kg/acre in 2 split doses or enriched vermicompost');
    } else if (n > 560) {
      fertilizerRecs.push('Avoid excess nitrogen; prevent excessive vegetative growth and pest vulnerability');
    }

    // Phosphorus: Low < 23, Medium 23-56, High > 56
    if (p < 23) {
      deficiencies.push('Phosphorus Deficiency (Weak root structure & purple leaf margins)');
      fertilizerRecs.push('Apply Single Super Phosphate (SSP) @ 75 kg/acre during basal soil preparation');
    }

    // Potassium: Low < 140, Medium 140-280, High > 280
    if (k < 140) {
      deficiencies.push('Potassium Deficiency (Marginal leaf scorch & reduced drought resilience)');
      fertilizerRecs.push('Apply Muriate of Potash (MOP) @ 30 kg/acre');
    }

    // pH diagnostics
    if (ph < 6.0) {
      deficiencies.push('Acidic Soil Condition (Impedes micronutrient uptake)');
      fertilizerRecs.push('Incorporate Agricultural Lime (Dolomite) @ 200 kg/acre to restore pH balance');
    } else if (ph > 8.0) {
      deficiencies.push('Alkaline Soil Condition');
      fertilizerRecs.push('Incorporate Agricultural Gypsum @ 150 kg/acre and maximize organic mulching');
    }

    // Calculate dynamic soil health index
    let healthScore = 100 - (deficiencies.length * 15);
    if (healthScore < 40) healthScore = 40;

    // Filter suitable crops based on soil conditions
    const matchedCrops = CROP_DATABASE.filter(crop => {
      const matchesSoil = !soilType || crop.soilTypes.includes(soilType);
      const matchesPh = ph >= (crop.minPh - 0.5) && ph <= (crop.maxPh + 0.5);
      return matchesSoil && matchesPh;
    }).map(c => c.name);

    const reportData = {
      farmerName: farmerName || 'Kisan User',
      farmLocation: farmLocation || 'Karnataka',
      soilType: soilType || 'Red Loamy',
      phLevel: ph,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      organicCarbon: parseFloat(organicCarbon) || 0.5,
      healthScore,
      deficiencies: deficiencies.length > 0 ? deficiencies : ['Soil nutrient parameters balanced'],
      fertilizerRecommendations: fertilizerRecs.length > 0 ? fertilizerRecs : ['Standard maintenance organic compost @ 2 tonnes/acre'],
      suggestedCrops: matchedCrops.length > 0 ? matchedCrops : ['Ragi (Finger Millet)', 'Hybrid Maize']
    };

    try {
      const savedReport = new SoilReport(reportData);
      await savedReport.save();
      res.status(201).json({ success: true, report: savedReport });
    } catch (e) {
      const fallback = { _id: 'SOIL-' + Date.now(), ...reportData, createdAt: new Date() };
      fallbackReports.unshift(fallback);
      res.status(201).json({ success: true, report: fallback });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Soil intelligence diagnosis failed' });
  }
});

// GET: Filter Crops by Season, Soil Type & District
router.get('/crop-recommendations', (req, res) => {
  const { soilType, season, district } = req.query;

  let results = CROP_DATABASE;
  if (soilType) {
    results = results.filter(c => c.soilTypes.some(s => s.toLowerCase().includes(soilType.toLowerCase())));
  }
  if (season) {
    results = results.filter(c => c.season.toLowerCase().includes(season.toLowerCase()));
  }
  if (district) {
    results = results.filter(c => c.bestDistricts.some(d => d.toLowerCase().includes(district.toLowerCase())));
  }

  res.json({
    success: true,
    totalRecommendations: results.length,
    crops: results.length > 0 ? results : CROP_DATABASE
  });
});

module.exports = router;
