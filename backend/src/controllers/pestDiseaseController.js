// FarmConnect Pest & Crop Disease Assistance Controller (Phase 13)
// Integrated Pest Management (IPM), biological control guidance & symptom diagnostics

const db = require('../config/database');

/**
 * GET /api/pest-disease
 * Searchable repository of crop pests & fungal/viral diseases
 */
function getPestsAndDiseases(req, res) {
  try {
    const { crop_name, category, search } = req.query;

    let query = 'SELECT * FROM pest_diseases WHERE 1=1';
    const params = [];

    if (crop_name && crop_name !== 'ALL') {
      query += ' AND crop_name LIKE ?';
      params.push(`%${crop_name}%`);
    }

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR scientific_name LIKE ? OR symptoms LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY crop_name ASC, category ASC';

    const records = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error('getPestsAndDiseases error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve pest & disease registry.' });
  }
}

/**
 * GET /api/pest-disease/:id
 * Single pest/disease detailed management profile
 */
function getPestDiseaseById(req, res) {
  try {
    const { id } = req.params;
    const record = db.prepare('SELECT * FROM pest_diseases WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Pest/disease profile not found.' });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err) {
    console.error('getPestDiseaseById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load disease profile.' });
  }
}

/**
 * POST /api/pest-disease/diagnose
 * Symptom-matching rule engine for immediate field problem identification
 */
function diagnoseSymptoms(req, res) {
  try {
    const { crop_name, observed_symptoms } = req.body;

    if (!observed_symptoms) {
      return res.status(400).json({ success: false, message: 'Observed symptom description is required.' });
    }

    let query = 'SELECT * FROM pest_diseases WHERE 1=1';
    const params = [];

    if (crop_name && crop_name !== 'ALL') {
      query += ' AND crop_name LIKE ?';
      params.push(`%${crop_name}%`);
    }

    const allRecords = db.prepare(query).all(...params);

    const symptomWords = observed_symptoms.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    // Score matches
    const scoredMatches = allRecords
      .map((item) => {
        let score = 0;
        const targetText = (item.name + ' ' + item.symptoms + ' ' + item.causes).toLowerCase();

        symptomWords.forEach((word) => {
          if (targetText.includes(word)) {
            score += 15;
          }
        });

        // Exact symptom phrase bonus
        if (targetText.includes(observed_symptoms.toLowerCase().trim())) {
          score += 40;
        }

        const confidence = Math.min(95, Math.max(30, score));

        return {
          ...item,
          match_score: score,
          confidence_percentage: confidence,
        };
      })
      .filter((item) => item.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json({
      success: true,
      total_matches: scoredMatches.length,
      top_diagnosis: scoredMatches[0] || null,
      diagnoses: scoredMatches.slice(0, 3),
      disclaimer: 'Verified agricultural recommendations provided by agricultural scientists. Always follow label dosage.',
    });
  } catch (err) {
    console.error('diagnoseSymptoms error:', err);
    return res.status(500).json({ success: false, message: 'Failed to diagnose field symptoms.' });
  }
}

module.exports = {
  getPestsAndDiseases,
  getPestDiseaseById,
  diagnoseSymptoms,
};
