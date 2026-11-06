// FarmConnect Crop & Cultivation Guidance Controller (Phase 11)
// Comprehensive agronomic lifecycle from land prep to storage

const db = require('../config/database');

/**
 * GET /api/crop-assistance/guides
 * List all crop guides with season/soil filters
 */
function getCropGuides(req, res) {
  try {
    const { season, soil_type, crop_name } = req.query;

    let query = 'SELECT id, crop_name, season, soil_type, climate FROM crop_guides WHERE 1=1';
    const params = [];

    if (season && season !== 'ALL') {
      query += ' AND (season = ? OR season = "All Season")';
      params.push(season);
    }

    if (soil_type) {
      query += ' AND soil_type LIKE ?';
      params.push(`%${soil_type}%`);
    }

    if (crop_name) {
      query += ' AND crop_name LIKE ?';
      params.push(`%${crop_name}%`);
    }

    query += ' ORDER BY crop_name ASC';

    const guides = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (err) {
    console.error('getCropGuides error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cultivation guides.' });
  }
}

/**
 * GET /api/crop-assistance/guides/:id
 * Full cultivation roadmap by growth stages
 */
function getCropGuideById(req, res) {
  try {
    const { id } = req.params;
    const guide = db.prepare('SELECT * FROM crop_guides WHERE id = ? OR LOWER(crop_name) = LOWER(?)').get(id, id);

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Cultivation guide not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...guide,
        irrigation_stages: JSON.parse(guide.irrigation_stages_json),
        fertilizer_schedule: JSON.parse(guide.fertilizer_schedule_json),
      },
    });
  } catch (err) {
    console.error('getCropGuideById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve crop roadmap.' });
  }
}

/**
 * GET /api/crop-assistance/calendar
 * Monthly seasonal farming guidance
 */
function getSeasonalCalendar(req, res) {
  try {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    const seasonalAdvice = {
      month: currentMonth,
      current_season: 'Rabi / Post-Monsoon',
      key_activities: [
        'Complete sowing of Rabi pulses (Bengal gram), oilseeds and ragi before mid-month.',
        'Plan light furrow irrigation for early sugarcane plantings in canal command areas.',
        'Apply weed management sprays within 3 days of sowing to prevent early canopy competition.',
        'Scout paddy fields for stem borer dead hearts and yellowing leaf tips.',
      ],
      recommended_crops: ['Paddy (Rabi)', 'Sugarcane (Autumn)', 'Finger Millet', 'Bengal Gram', 'Tomato', 'Sunflower'],
    };

    return res.status(200).json({
      success: true,
      data: seasonalAdvice,
    });
  } catch (err) {
    console.error('getSeasonalCalendar error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load seasonal calendar.' });
  }
}

module.exports = {
  getCropGuides,
  getCropGuideById,
  getSeasonalCalendar,
};
