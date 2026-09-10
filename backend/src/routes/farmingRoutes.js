const express = require('express');
const router = express.Router();
const FarmFinance = require('../models/FarmFinance');

// Fallback in-memory ledger
let fallbackLedger = [
  {
    _id: 'FIN-101',
    farmerId: 'farmer-primary',
    cropSeason: 'Kharif 2026 - Sona Masoori Paddy',
    acreage: 2.5,
    expenses: [
      { category: 'Seeds', amount: 3500, description: 'Breeder paddy seed foundation lots' },
      { category: 'Fertilizers', amount: 6200, description: 'Basal SSP and neem-coated urea' },
      { category: 'Labor', amount: 8400, description: 'Transplanting labor charges' },
      { category: 'Machinery & Fuel', amount: 4500, description: 'Tractor rotavator field prep' }
    ],
    revenue: [
      { mandiOrBuyer: 'Mandya APMC Yard', quantityQuintals: 55, pricePerQuintal: 2450, totalSaleAmount: 134750 }
    ]
  }
];

// --- 1. SMART IRRIGATION CALCULATOR ---
router.post('/irrigation-calc', (req, res) => {
  try {
    const { cropName, cropStage, soilType, acreage, irrigationMethod } = req.body;

    // Crop coefficient (Kc) approximation
    const cropFactors = {
      paddy: { initial: 1.1, mid: 1.35, late: 0.95 },
      maize: { initial: 0.4, mid: 1.15, late: 0.6 },
      chilli: { initial: 0.6, mid: 1.05, late: 0.8 },
      default: { initial: 0.5, mid: 1.0, late: 0.7 }
    };

    const stageKey = (cropStage || 'mid').toLowerCase();
    const cropKey = (cropName || 'default').toLowerCase().includes('paddy') ? 'paddy' :
                    (cropName || '').toLowerCase().includes('maize') ? 'maize' :
                    (cropName || '').toLowerCase().includes('chilli') ? 'chilli' : 'default';

    const kc = cropFactors[cropKey][stageKey] || 1.0;
    const baseEto = 5.2; // mm/day reference evapotranspiration
    const dailyWaterNeedMm = baseEto * kc;

    // 1 mm water over 1 acre = 4,046.86 Litres
    const litersPerAcre = Math.round(dailyWaterNeedMm * 4046.86);
    const totalDailyLiters = litersPerAcre * (Number(acreage) || 1);

    // Irrigation run time approximation based on method
    let pumpHours = 0;
    let efficiencyNote = '';
    if ((irrigationMethod || '').toLowerCase() === 'drip') {
      pumpHours = +(totalDailyLiters / (15000)).toFixed(1); // 15k L/hr drip emission
      efficiencyNote = 'Drip efficiency rated at ~90%. Minimal evaporation loss.';
    } else {
      pumpHours = +(totalDailyLiters / (10000)).toFixed(1); // Surface / furrow delivery
      efficiencyNote = 'Surface delivery rated at ~60% efficiency. Recommend morning/evening release.';
    }

    res.json({
      success: true,
      cropName: cropName || 'General Crop',
      growthStage: cropStage || 'Mid Season',
      dailyWaterRequirementMm: dailyWaterNeedMm.toFixed(2),
      waterVolumeLitersPerDay: totalDailyLiters,
      recommendedPumpHours: Math.max(1.0, pumpHours),
      efficiencyGuidance: efficiencyNote,
      optimalSchedule: '06:00 AM - 08:30 AM or 05:00 PM - 07:00 PM'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Irrigation calculation failure' });
  }
});

// --- 2. FARM FINANCIAL SUMMARY (P&L) ---
router.get('/finance/summary', (req, res) => {
  const ledger = fallbackLedger[0];
  const totalExpense = ledger.expenses.reduce((acc, item) => acc + item.amount, 0);
  const totalRevenue = ledger.revenue.reduce((acc, item) => acc + item.totalSaleAmount, 0);
  const netProfit = totalRevenue - totalExpense;
  const marginPercent = totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    season: ledger.cropSeason,
    acreage: ledger.acreage,
    totalExpenses: totalExpense,
    totalRevenue: totalRevenue,
    netProfit: netProfit,
    profitMarginPercent: marginPercent,
    status: netProfit >= 0 ? 'Profitable' : 'Deficit',
    expenseBreakdown: ledger.expenses,
    revenueLots: ledger.revenue
  });
});

// Record new operational expense
router.post('/finance/expense', (req, res) => {
  const { category, amount, description } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ success: false, error: 'Category and amount are required' });
  }
  const newExpense = {
    category,
    amount: Number(amount),
    description: description || '',
    date: new Date()
  };
  fallbackLedger[0].expenses.push(newExpense);
  res.status(201).json({ success: true, expense: newExpense, message: 'Expense recorded successfully' });
});

module.exports = router;
