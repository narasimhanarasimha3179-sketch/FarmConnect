// mobile-android/src/services/aiDiagnosticService.js

const DIAGNOSES_DATABASE = [
  {
    crop: 'Paddy / Rice',
    diseaseName: 'Bacterial Leaf Blight',
    pathogen: 'Xanthomonas oryzae pv. oryzae',
    confidenceScore: '94.2%',
    severity: 'Moderate',
    symptoms: [
      'Water-soaked lesions on leaf margins turning yellow to white',
      'Milky bacterial ooze drops visible on young lesions in morning',
      'Premature drying of leaf canopy',
    ],
    organicRemedy: 'Spray fresh cow dung slurry extract (20g/L) or neem oil at 3ml/L water.',
    chemicalTreatment: 'Streptocycline (1.5g) mixed with Copper Oxychloride (25g) per 10L water.',
    preventativeAction: 'Avoid excess nitrogen fertilizers and maintain field drainage.',
  },
  {
    crop: 'Tomato',
    diseaseName: 'Early Blight',
    pathogen: 'Alternaria solani',
    confidenceScore: '96.8%',
    severity: 'High',
    symptoms: [
      'Concentric target-like rings on older leaves',
      'Yellow halos surrounding brownish dry spots',
      'Stem cankers near the soil surface',
    ],
    organicRemedy: 'Foliar spray of Trichoderma harzianum or Bacillus subtilis biological suspension.',
    chemicalTreatment: 'Mancozeb 75% WP (2.5g/L) or Azoxystrobin 23% SC (1ml/L).',
    preventativeAction: 'Ensure drip irrigation instead of overhead splashing and prune lower foliage.',
  },
  {
    crop: 'Cotton',
    diseaseName: 'Grey Mildew (Dahiya)',
    pathogen: 'Ramularia areola',
    confidenceScore: '91.5%',
    severity: 'Moderate',
    symptoms: [
      'Angular pale translucent spots restricted by veins',
      'White powdery fungal growth on underside of leaves',
      'Premature leaf shedding before boll formation',
    ],
    organicRemedy: 'Spray wettable sulfur at 3g/L or garlic bulb extract fermented solution.',
    chemicalTreatment: 'Propiconazole 25% EC at 1ml/L or Carbendazim 50% WP at 1g/L.',
    preventativeAction: 'Increase plant spacing for aeration and burn infected crop residues.',
  },
  {
    crop: 'Maize / Corn',
    diseaseName: 'Turcicum Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    confidenceScore: '93.7%',
    severity: 'High',
    symptoms: [
      'Long elliptical grayish-green or tan lesions',
      'Coalescing spots creating burnt appearance across foliage',
      'Reduced grain fill at maturity',
    ],
    organicRemedy: 'Pseudomonas fluorescens foliar spray at 5g/L during early vegetative stages.',
    chemicalTreatment: 'Hexaconazole 5% SC at 2ml/L or Mancozeb at 2.5g/L.',
    preventativeAction: 'Rotate with non-host legumes and plant certified resistant seed varieties.',
  },
  {
    crop: 'Paddy / Rice',
    diseaseName: 'Blast Disease (Neck / Leaf Blast)',
    pathogen: 'Magnaporthe oryzae',
    confidenceScore: '95.1%',
    severity: 'Severe',
    symptoms: [
      'Spindle-shaped lesions with grayish centers and brown borders',
      'Rotting or blackened nodes near panicle base',
      'Complete grain shattering or chaffy heads',
    ],
    organicRemedy: 'Foliar application of fermented Panchagavya (3%) at 10-day intervals.',
    chemicalTreatment: 'Tricyclazole 75% WP (0.6g/L) or Isoprothiolane 40% EC (1.5ml/L).',
    preventativeAction: 'Avoid stagnant cold water and top dressing urea under humid conditions.',
  },
];

export const aiDiagnosticService = {
  async diagnoseLeaf(imageUri) {
    // Simulate network delay for AI inference
    await new Promise((res) => setTimeout(res, 1200));

    // Select randomly from diagnostic matrix to reflect varied scanning
    const randomIndex = Math.floor(Math.random() * DIAGNOSES_DATABASE.length);
    const diagnosis = DIAGNOSES_DATABASE[randomIndex];

    return {
      success: true,
      timestamp: new Date().toISOString(),
      imageUri,
      ...diagnosis,
    };
  },
};