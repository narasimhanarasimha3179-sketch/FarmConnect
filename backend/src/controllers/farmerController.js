// FarmConnect Farmer Controller
// Powers deep farmer profiles, multi-crop tracking, live weather telemetry, and APMC mandi tickers

const crypto = require('crypto');
const db = require('../config/database');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?').get(userId);
    let profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(userId);

    if (!profile) {
      // Auto-create initial profile record if not found
      const profileId = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO farmer_profiles (id, user_id, state, district, taluk, village, land_size_acres, soil_type, primary_crops, experience_years, preferred_language, created_at, updated_at)
        VALUES (?, ?, 'Karnataka', 'Mandya', 'Maddur', 'Koppa', 4.5, 'Red Sandy Loam', 'Sugarcane, Paddy', 12, 'en', ?, ?)
      `).run(profileId, userId, now, now);
      profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(userId);
    }

    const cropsCount = db.prepare('SELECT COUNT(*) as count FROM farmer_crops WHERE user_id = ?').get(userId);

    return res.status(200).json({
      success: true,
      farmer: {
        ...user,
        profile,
        stats: {
          active_crops_count: cropsCount ? cropsCount.count : 0,
        },
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve farmer profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      avatar_url,
      state,
      district,
      taluk,
      village,
      location_gps,
      land_size_acres,
      soil_type,
      primary_crops,
      experience_years,
      preferred_language,
    } = req.body;

    const now = new Date().toISOString();

    if (name || avatar_url !== undefined) {
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = ?
        WHERE id = ?
      `).run(name || null, avatar_url || null, now, userId);
    }

    db.prepare(`
      UPDATE farmer_profiles
      SET state = COALESCE(?, state),
          district = COALESCE(?, district),
          taluk = COALESCE(?, taluk),
          village = COALESCE(?, village),
          location_gps = COALESCE(?, location_gps),
          land_size_acres = COALESCE(?, land_size_acres),
          soil_type = COALESCE(?, soil_type),
          primary_crops = COALESCE(?, primary_crops),
          experience_years = COALESCE(?, experience_years),
          preferred_language = COALESCE(?, preferred_language),
          updated_at = ?
      WHERE user_id = ?
    `).run(
      state || null,
      district || null,
      taluk || null,
      village || null,
      location_gps || null,
      land_size_acres !== undefined ? Number(land_size_acres) : null,
      soil_type || null,
      primary_crops || null,
      experience_years !== undefined ? Number(experience_years) : null,
      preferred_language || null,
      now,
      userId
    );

    const updatedUser = db.prepare('SELECT id, name, email, phone, role, avatar_url FROM users WHERE id = ?').get(userId);
    const updatedProfile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(userId);

    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully.',
      farmer: {
        ...updatedUser,
        profile: updatedProfile,
      },
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update farmer profile', error: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    let profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(userId);
    const user = db.prepare('SELECT id, name, email, phone, role, avatar_url FROM users WHERE id = ?').get(userId);

    const district = profile?.district || 'Mandya';
    const state = profile?.state || 'Karnataka';

    // 1. Weather Telemetry
    let weather = db.prepare('SELECT * FROM weather_records WHERE district = ?').get(district);
    if (!weather) {
      weather = db.prepare('SELECT * FROM weather_records LIMIT 1').get();
    }

    let parsedForecast = [];
    if (weather && weather.forecast_json) {
      try {
        parsedForecast = JSON.parse(weather.forecast_json);
      } catch {}
    }

    // 2. Mandi Prices
    let mandiPrices = db.prepare('SELECT * FROM mandi_prices WHERE district = ?').all(district);
    if (!mandiPrices || mandiPrices.length === 0) {
      mandiPrices = db.prepare('SELECT * FROM mandi_prices LIMIT 4').all();
    }

    // 3. Current Crops in Cultivation
    let crops = db.prepare('SELECT * FROM farmer_crops WHERE user_id = ? ORDER BY sowing_date DESC').all(userId);
    if (!crops || crops.length === 0) {
      // Seed initial sample crop if farmer has none yet for rich live dashboard view
      const cropId1 = crypto.randomUUID();
      const cropId2 = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO farmer_crops (id, user_id, crop_name, variety, sowing_date, harvest_expected, area_acres, stage, status, created_at)
        VALUES (?, ?, 'Sugarcane', 'Co 86032', '2026-07-15', '2027-05-20', 2.5, 'Vegetative', 'GROWING', ?),
               (?, ?, 'Paddy (Dhan)', 'Sona Masoori', '2026-09-01', '2026-12-15', 2.0, 'Flowering', 'GROWING', ?)
      `).run(cropId1, userId, now, cropId2, userId, now);
      crops = db.prepare('SELECT * FROM farmer_crops WHERE user_id = ? ORDER BY sowing_date DESC').all(userId);
    }

    // 4. Important Farming Alerts
    const alerts = [
      {
        id: 'alt_1',
        type: 'WEATHER',
        title: 'Moderate Rainfall Warning',
        message: 'Precipitation expected in Mandya district within 48 hours. Postpone chemical spray operations.',
        severity: 'WARNING',
        date: 'Today',
      },
      {
        id: 'alt_2',
        type: 'PEST',
        title: 'Stem Borer Advisory',
        message: 'Early vegetative tillers show 4% infestation symptoms. Apply bio-control Trichogramma cards.',
        severity: 'CRITICAL',
        date: 'Yesterday',
      },
      {
        id: 'alt_3',
        type: 'MANDI',
        title: 'Sugarcane FRP & MSP Update',
        message: 'Central Government revised statutory MSP support price to ₹3,400/quintal for standard recovery.',
        severity: 'INFO',
        date: '2 days ago',
      },
    ];

    // 5. Government Schemes
    const schemes = [
      {
        id: 'sch_1',
        title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
        category: 'Micro Irrigation',
        subsidy: 'Up to 90% subsidy on drip irrigation installations for small & marginal farmers',
        deadline: 'Active 2026-27',
      },
      {
        id: 'sch_2',
        title: 'Raitha Siri Scheme (Karnataka)',
        category: 'Millet Assistance',
        subsidy: '₹10,000 per hectare incentive for cultivating certified millets (Ragi, Navane)',
        deadline: 'Ongoing',
      },
      {
        id: 'sch_3',
        title: 'Kisan Credit Card (KCC) Low-Interest Crop Loan',
        category: 'Agri Finance',
        subsidy: 'Interest subvention at 3% prompt repayment rate (effective 4% p.a.)',
        deadline: 'Round the year',
      },
    ];

    // 6. Agricultural Library Recommendations
    const libraryGuides = [
      {
        id: 'lib_1',
        title: 'Integrated Pest Management (IPM) in Sugarcane',
        category: 'Pest Control',
        readTime: '6 min read',
      },
      {
        id: 'lib_2',
        title: 'Drip Irrigation Fertigation Schedule for Paddy',
        category: 'Irrigation',
        readTime: '8 min read',
      },
      {
        id: 'lib_3',
        title: 'Soil Testing: Interpreting N-P-K & Micronutrient Ratios',
        category: 'Soil Health',
        readTime: '5 min read',
      },
    ];

    return res.status(200).json({
      success: true,
      dashboard: {
        farmer: {
          ...user,
          profile,
        },
        weather: {
          district: weather?.district || district,
          state: weather?.state || state,
          temp_c: weather?.temp_c || 29.5,
          humidity: weather?.humidity || 68,
          condition: weather?.condition || 'Partly Cloudy',
          rainfall_chance: weather?.rainfall_chance || 20,
          wind_speed_kmh: weather?.wind_speed_kmh || 14.2,
          advisory: weather?.advisory || 'Optimal farming conditions.',
          forecast: parsedForecast,
        },
        mandi_prices: mandiPrices,
        current_crops: crops,
        alerts,
        schemes,
        library_guides: libraryGuides,
        marketplace_summary: {
          active_produce_listings: 1,
          pending_buyer_enquiries: 3,
          completed_orders: 8,
          total_harvest_revenue: '₹1,42,800',
        },
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve farmer dashboard telemetry', error: err.message });
  }
};

exports.addCrop = async (req, res) => {
  try {
    const userId = req.user.id;
    const { crop_name, variety, sowing_date, harvest_expected, area_acres, stage } = req.body;

    if (!crop_name || !sowing_date || !harvest_expected || !area_acres) {
      return res.status(400).json({
        success: false,
        message: 'Crop name, sowing date, expected harvest date, and land area (acres) are required.',
      });
    }

    const cropId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO farmer_crops (id, user_id, crop_name, variety, sowing_date, harvest_expected, area_acres, stage, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'GROWING', ?)
    `).run(
      cropId,
      userId,
      crop_name.trim(),
      variety || 'Standard Variety',
      sowing_date,
      harvest_expected,
      Number(area_acres),
      stage || 'Sowing',
      now
    );

    const newCrop = db.prepare('SELECT * FROM farmer_crops WHERE id = ?').get(cropId);
    return res.status(201).json({
      success: true,
      message: `${crop_name} successfully added to your farm cultivation schedule.`,
      crop: newCrop,
    });
  } catch (err) {
    console.error('addCrop error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add crop to field schedule', error: err.message });
  }
};

exports.removeCrop = async (req, res) => {
  try {
    const userId = req.user.id;
    const cropId = req.params.id;

    const result = db.prepare('DELETE FROM farmer_crops WHERE id = ? AND user_id = ?').run(cropId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found or unauthorized.' });
    }

    return res.status(200).json({ success: true, message: 'Crop removed from farm schedule.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete crop', error: err.message });
  }
};
