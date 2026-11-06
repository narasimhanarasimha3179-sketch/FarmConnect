// FarmConnect Soil Health & N-P-K Recommendation Controller (Phase 12)
// Lab report management, fertility ratings & precision fertilizer dosage calculator

const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/soil/reports
 * Retrieve farmer's soil health cards
 */
function getSoilReports(req, res) {
  try {
    const reports = db.prepare(`
      SELECT * FROM soil_reports
      WHERE user_id = ? OR user_id = 'farmer_ramesh'
      ORDER BY tested_date DESC
    `).all(req.user.id);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports.map((r) => ({
        ...r,
        recommendations: JSON.parse(r.recommendations_json),
      })),
    });
  } catch (err) {
    console.error('getSoilReports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve soil reports.' });
  }
}

/**
 * GET /api/soil/reports/:id
 * Single soil health report
 */
function getSoilReportById(req, res) {
  try {
    const { id } = req.params;
    const report = db.prepare('SELECT * FROM soil_reports WHERE id = ?').get(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Soil report not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...report,
        recommendations: JSON.parse(report.recommendations_json),
      },
    });
  } catch (err) {
    console.error('getSoilReportById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load soil report.' });
  }
}

/**
 * POST /api/soil/reports
 * Submit new soil test report
 */
function createSoilReport(req, res) {
  try {
    const {
      farm_name,
      ph,
      nitrogen_kg_ha,
      phosphorus_kg_ha,
      potassium_kg_ha,
      organic_carbon_percent,
      soil_type = 'Red Loam',
      tested_date,
    } = req.body;

    if (!ph || nitrogen_kg_ha === undefined || phosphorus_kg_ha === undefined || potassium_kg_ha === undefined) {
      return res.status(400).json({
        success: false,
        message: 'pH, Nitrogen, Phosphorus, and Potassium values are required.',
      });
    }

    const n = parseFloat(nitrogen_kg_ha);
    const p = parseFloat(phosphorus_kg_ha);
    const k = parseFloat(potassium_kg_ha);
    const phVal = parseFloat(ph);
    const oc = organic_carbon_percent ? parseFloat(organic_carbon_percent) : 0.6;

    // Fertility Rating
    let fertilityRating = 'OPTIMAL';
    if (n < 200 || p < 15 || k < 150) fertilityRating = 'LOW';
    else if (n > 350 && p > 35 && k > 350) fertilityRating = 'HIGH';
    else if (n < 280) fertilityRating = 'MEDIUM';

    // Tailored Recommendations
    const recommendations = {
      ph_status: phVal < 6.0 ? 'Acidic - Apply Agricultural Lime @ 200 kg/acre' : phVal > 7.8 ? 'Alkaline - Apply Gypsum @ 150 kg/acre' : 'Neutral & Ideal for nutrient uptake',
      nitrogen_action: n < 280 ? 'Nitrogen deficient; add 20% extra Urea at vegetative stage' : 'Nitrogen adequate; apply standard recommended dose',
      phosphorus_action: p < 23 ? 'Low available phosphorus; apply SSP or DAP at basal sowing' : 'Phosphorus in optimal range',
      potassium_action: k < 180 ? 'Low potassium; supplement MOP (Muriate of Potash) @ 30 kg/acre' : 'Potassium reserve sufficient',
      organic_matter: oc < 0.5 ? 'Apply 4 tonnes/acre compost or vermicompost to improve CEC' : 'Good organic carbon level',
      suitable_crops: phVal >= 6.0 && phVal <= 7.5 ? ['Sugarcane', 'Paddy', 'Ragi', 'Tomato', 'Maize'] : ['Cotton', 'Pulses'],
    };

    const id = 'soil_' + crypto.randomBytes(4).toString('hex');
    const tDate = tested_date || new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO soil_reports (
        id, user_id, farm_name, ph, nitrogen_kg_ha, phosphorus_kg_ha, potassium_kg_ha,
        organic_carbon_percent, soil_type, fertility_rating, recommendations_json, tested_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      farm_name || 'Main Farm Field',
      phVal,
      n,
      p,
      k,
      oc,
      soil_type,
      fertilityRating,
      JSON.stringify(recommendations),
      tDate
    );

    return res.status(201).json({
      success: true,
      message: 'Soil health report recorded and analyzed successfully.',
      data: {
        id,
        fertility_rating: fertilityRating,
        recommendations,
      },
    });
  } catch (err) {
    console.error('createSoilReport error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record soil report.' });
  }
}

/**
 * POST /api/soil/npk-calculator
 * Precision N-P-K fertilizer dosage calculation based on target crop & acreage
 */
function calculateNpkDosage(req, res) {
  try {
    const { crop_name = 'Paddy', acres = 1, soil_n = 240, soil_p = 22, soil_k = 280 } = req.body;

    const acreNum = parseFloat(acres) || 1;
    const n = parseFloat(soil_n);
    const p = parseFloat(soil_p);
    const k = parseFloat(soil_k);

    // Standard Recommended Fertilizer Doses (RDF kg/acre):
    const cropRdf = {
      Paddy: { N: 40, P: 20, K: 20 },
      Sugarcane: { N: 100, P: 40, K: 50 },
      Ragi: { N: 25, P: 15, K: 15 },
      Tomato: { N: 60, P: 50, K: 50 },
      Cotton: { N: 50, P: 25, K: 25 },
    };

    const base = cropRdf[crop_name] || cropRdf['Paddy'];

    // Soil test adjustments:
    // Low soil N (<280) -> +25% N; Medium -> normal; High (>560) -> -25% N
    const nFactor = n < 280 ? 1.25 : n > 560 ? 0.75 : 1.0;
    const pFactor = p < 23 ? 1.25 : p > 56 ? 0.75 : 1.0;
    const kFactor = k < 180 ? 1.25 : k > 350 ? 0.8 : 1.0;

    const reqN = base.N * nFactor * acreNum;
    const reqP = base.P * pFactor * acreNum;
    const reqK = base.K * kFactor * acreNum;

    // Convert into commercial fertilizers:
    // DAP (18% N, 46% P2O5)
    const dapBags = Math.round((reqP / 0.46) / 50 * 10) / 10;
    const nSuppliedByDap = (dapBags * 50) * 0.18;

    // Remaining N supplied by Urea (46% N)
    const remainingN = Math.max(0, reqN - nSuppliedByDap);
    const ureaBags = Math.round((remainingN / 0.46) / 50 * 10) / 10;

    // MOP (60% K2O)
    const mopBags = Math.round((reqK / 0.60) / 50 * 10) / 10;

    return res.status(200).json({
      success: true,
      crop: crop_name,
      acres: acreNum,
      target_nutrient_demand: {
        nitrogen_kg: Math.round(reqN),
        phosphorus_kg: Math.round(reqP),
        potassium_kg: Math.round(reqK),
      },
      commercial_fertilizer_requirement: {
        urea_50kg_bags: ureaBags,
        dap_50kg_bags: dapBags,
        mop_50kg_bags: mopBags,
      },
      application_timeline: {
        basal_sowing: `Apply full DAP (${dapBags} bags) + 1/3rd MOP (${Math.round(mopBags * 0.33 * 10) / 10} bags) at field prep.`,
        tillering_stage: `Apply 1/2 Urea (${Math.round(ureaBags * 0.5 * 10) / 10} bags) at 25-30 days.`,
        panicle_initiation: `Apply remaining Urea (${Math.round(ureaBags * 0.5 * 10) / 10} bags) + remaining MOP at 55-60 days.`,
      },
    });
  } catch (err) {
    console.error('calculateNpkDosage error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate fertilizer dosage.' });
  }
}

module.exports = {
  getSoilReports,
  getSoilReportById,
  createSoilReport,
  calculateNpkDosage,
};
