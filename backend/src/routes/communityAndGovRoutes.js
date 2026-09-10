const express = require('express');
const router = express.Router();

// 1. COMMUNITY IN-MEMORY DATA
let communityPosts = [
  {
    postId: 'POST-101',
    author: 'Basavaraj Patil',
    district: 'Haveri',
    crop: 'Byadagi Chilli',
    title: 'Controlled yellow leaf curl using neem oil + yellow sticky traps',
    content: 'Sprayed 10,000 PPM cold-pressed neem oil mixed with mild soap water. Installed 25 yellow sticky sheets per acre. Whitefly count dropped dramatically in 48 hours.',
    likes: 24,
    commentsCount: 7,
    createdAt: new Date()
  },
  {
    postId: 'POST-102',
    author: 'Suresh Gowda',
    district: 'Mandya',
    crop: 'Sugarcane',
    title: 'Intercropping pulse crops in wide-row sugarcane',
    content: 'Planted black gram between 5-foot sugarcane furrows. Harvested extra yield and observed soil nitrogen enrichment.',
    likes: 38,
    commentsCount: 12,
    createdAt: new Date()
  }
];

// 2. KNOWLEDGE TUTORIALS
const KNOWLEDGE_BASE = [
  {
    guideId: 'GUIDE-01',
    category: 'Pest Management',
    crop: 'Paddy / Rice',
    title: 'Integrated Pest Management for Stem Borer & Leaf Folder',
    keySteps: [
      'Install 8 pheromone traps per acre at 20 days after transplanting.',
      'Release Trichogramma chilonis egg parasitoids @ 40,000/acre.',
      'If ETL threshold exceeds 10% dead hearts, apply Chlorantraniliprole 18.5 SC @ 0.3 ml/L.'
    ],
    videoUrl: 'https://farmconnect.gov.in/tutorials/paddy-ipm'
  },
  {
    guideId: 'GUIDE-02',
    category: 'Soil Fertility',
    crop: 'All Field Crops',
    title: 'On-Farm Jeevamrutha Preparation Guide',
    keySteps: [
      'Mix 10 kg native cow dung with 10 liters cow urine in a 200L drum.',
      'Add 2 kg jaggery, 2 kg pulse flour, and a handful of fertile undisturbed farm bund soil.',
      'Stir clockwise twice daily for 7 days under shade; apply via drip or furrow irrigation.'
    ],
    videoUrl: 'https://farmconnect.gov.in/tutorials/jeevamrutha'
  }
];

// 3. GOVERNMENT WELFARE SCHEMES
const GOV_SCHEMES = [
  {
    schemeCode: 'PM-KISAN',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi',
    benefit: '₹6,000 per year directly credited in 3 equal installments of ₹2,000.',
    targetBeneficiary: 'Small and Marginal Landholding Farmer Families',
    eligibility: 'Must hold valid land records (RTC/Pahani). Institutional landholders excluded.',
    documentsRequired: ['Aadhaar Card', 'Land Ownership Record (RTC/Pahani)', 'Bank Passbook with Active NPCI Linking'],
    officialPortal: 'https://pmkisan.gov.in'
  },
  {
    schemeCode: 'PMFBY',
    schemeName: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance)',
    benefit: 'Comprehensive risk insurance covering post-harvest losses, drought, pests, and localized calamities.',
    targetBeneficiary: 'All farmers growing notified crops in notified areas',
    eligibility: 'Kharif premium 2%, Rabi premium 1.5%, Commercial/Horticultural crops 5%.',
    documentsRequired: ['Aadhaar Card', 'Sowing Certificate', 'Land Title Document', 'Bank Account Details'],
    officialPortal: 'https://pmfby.gov.in'
  },
  {
    schemeCode: 'KS-DRIP',
    schemeName: 'Pradhan Mantri Krishi Sinchayee Yojana (Micro Irrigation Subsidy)',
    benefit: 'Up to 90% subsidy for SC/ST and small/marginal farmers on Drip & Sprinkler irrigation kits.',
    targetBeneficiary: 'Farmers with verified agricultural water source (Borewell/Well/Canal)',
    eligibility: 'Minimum land holding of 0.5 acres up to maximum limit of 5 acres.',
    documentsRequired: ['Aadhaar Card', 'RTC with water source entry', 'Soil & Water Test Certificate'],
    officialPortal: 'https://raitamitra.karnataka.gov.in'
  }
];

// --- 1. COMMUNITY FEED ENDPOINTS ---
router.get('/community/feed', (req, res) => {
  res.json({ success: true, count: communityPosts.length, posts: communityPosts });
});

router.post('/community/post', (req, res) => {
  const { author, district, crop, title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Post title and description are required' });
  }

  const newPost = {
    postId: 'POST-' + Date.now(),
    author: author || 'Progressive Farmer',
    district: district || 'Karnataka',
    crop: crop || 'General Agriculture',
    title,
    content,
    likes: 0,
    commentsCount: 0,
    createdAt: new Date()
  };

  communityPosts.unshift(newPost);
  res.status(201).json({ success: true, post: newPost });
});

// --- 2. KNOWLEDGE CENTER ENDPOINTS ---
router.get('/knowledge/guides', (req, res) => {
  const { crop, category } = req.query;
  let results = KNOWLEDGE_BASE;
  if (crop) results = results.filter(g => g.crop.toLowerCase().includes(crop.toLowerCase()));
  if (category) results = results.filter(g => g.category.toLowerCase() === category.toLowerCase());
  res.json({ success: true, guides: results });
});

// --- 3. GOVERNMENT SCHEMES ENDPOINTS ---
router.get('/schemes/list', (req, res) => {
  res.json({ success: true, count: GOV_SCHEMES.length, schemes: GOV_SCHEMES });
});

router.post('/schemes/check-eligibility', (req, res) => {
  const { schemeCode, landAcreage, hasAadhaar, hasActiveBankLink } = req.body;
  const scheme = GOV_SCHEMES.find(s => s.schemeCode.toUpperCase() === (schemeCode || '').toUpperCase());

  if (!scheme) {
    return res.status(404).json({ success: false, error: 'Scheme code not recognized' });
  }

  const eligible = hasAadhaar && hasActiveBankLink;

  res.json({
    success: true,
    schemeName: scheme.schemeName,
    eligible,
    benefit: scheme.benefit,
    statusNote: eligible
      ? 'Criteria satisfied. Ready for direct portal or Grama One center application submission.'
      : 'Incomplete prerequisite: Ensure Aadhaar is linked with NPCI DB on your primary savings account.',
    requiredDocuments: scheme.documentsRequired,
    applicationUrl: scheme.officialPortal
  });
});

module.exports = router;
