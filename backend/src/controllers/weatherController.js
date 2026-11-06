// FarmConnect Weather & Agro-Meteorology Controller (Phase 10)
// Location-based forecasts, rainfall alerts, irrigation recommendations & field advisories

const db = require('../config/database');

const DISTRICT_COORDS = {
  'mandya': { lat: 12.52, lon: 76.89 },
  'maddur': { lat: 12.58, lon: 77.04 },
  'mysuru': { lat: 12.29, lon: 76.63 },
  'bengaluru': { lat: 12.97, lon: 77.59 },
  'kolar': { lat: 13.13, lon: 78.13 },
  'hubli': { lat: 15.36, lon: 75.12 },
  'raichur': { lat: 16.20, lon: 77.35 },
};

async function tryFetchLiveWeather(district) {
  try {
    const coords = DISTRICT_COORDS[district.toLowerCase()] || DISTRICT_COORDS['mandya'];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return;
    const json = await res.json();
    if (json && json.current) {
      const temp_c = json.current.temperature_2m;
      const humidity = json.current.relative_humidity_2m;
      const wind = json.current.wind_speed_10m;
      const code = json.current.weather_code;
      const condition = code <= 3 ? (code === 0 ? 'Clear Sky' : 'Partly Cloudy') : (code >= 51 && code <= 67 ? 'Light Rain' : 'Overcast');
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE weather_records
        SET temp_c = ?, humidity = ?, wind_speed_kmh = ?, condition = ?, updated_at = ?
        WHERE LOWER(district) = LOWER(?)
      `).run(temp_c, humidity, wind, condition, now, district.toLowerCase());
    }
  } catch (err) {
    // Offline resilience fallback
  }
}

/**
 * GET /api/weather/current
 * Live agricultural weather telemetry for a district
 */
function getCurrentWeather(req, res) {
  try {
    const { district = 'Mandya' } = req.query;

    // Trigger live background fetch for real Open-Meteo satellite data
    tryFetchLiveWeather(district.trim());

    const weather = db.prepare(`
      SELECT * FROM weather_records
      WHERE LOWER(district) = LOWER(?)
    `).get(district.trim());

    if (!weather) {
      // Fallback to Mandya if district not found
      const fallback = db.prepare('SELECT * FROM weather_records LIMIT 1').get();
      return res.status(200).json({
        success: true,
        district,
        is_fallback: true,
        data: {
          ...fallback,
          forecast: JSON.parse(fallback.forecast_json),
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...weather,
        forecast: JSON.parse(weather.forecast_json),
      },
    });
  } catch (err) {
    console.error('getCurrentWeather error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve weather telemetry.' });
  }
}

/**
 * GET /api/weather/forecast
 * Multi-day detailed forecast with precipitation & wind speeds
 */
function getWeatherForecast(req, res) {
  try {
    const { district = 'Mandya' } = req.query;

    const weather = db.prepare(`
      SELECT district, state, temp_c, humidity, condition, rainfall_chance, wind_speed_kmh, forecast_json, updated_at
      FROM weather_records
      WHERE LOWER(district) = LOWER(?)
    `).get(district.trim());

    if (!weather) {
      return res.status(404).json({ success: false, message: `No weather telemetry found for district ${district}` });
    }

    const forecastArray = JSON.parse(weather.forecast_json);

    return res.status(200).json({
      success: true,
      district: weather.district,
      state: weather.state,
      current_temp: weather.temp_c,
      rain_probability: weather.rainfall_chance,
      forecast: forecastArray,
    });
  } catch (err) {
    console.error('getWeatherForecast error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve weather forecast.' });
  }
}

/**
 * GET /api/weather/advisories
 * Smart agricultural advice and irrigation schedules based on real weather metrics
 */
function getWeatherAdvisories(req, res) {
  try {
    const { district = 'Mandya' } = req.query;

    const weather = db.prepare(`
      SELECT * FROM weather_records
      WHERE LOWER(district) = LOWER(?)
    `).get(district.trim());

    const record = weather || db.prepare('SELECT * FROM weather_records LIMIT 1').get();

    // Compute smart irrigation and farming advisory based on rainfall and heat
    let irrigationAction = 'Normal Furrow/Drip Irrigation';
    let urgency = 'NORMAL';
    if (record.rainfall_chance >= 60) {
      irrigationAction = 'Suspend all surface irrigation; high probability of rain showers.';
      urgency = 'HOLD';
    } else if (record.temp_c >= 32) {
      irrigationAction = 'High evapotranspiration rate. Schedule evening or early morning irrigation to avoid water loss.';
      urgency = 'HIGH_PRIORITY';
    }

    const advisories = [
      {
        title: 'Irrigation Guidance',
        recommendation: irrigationAction,
        urgency,
        rainfall_chance: record.rainfall_chance,
      },
      {
        title: 'Pest & Fungal Risk',
        recommendation: record.humidity > 70
          ? 'High humidity creates favorable conditions for fungal blast and downy mildew. Inspect crop leaves.'
          : 'Low to moderate humidity; standard preventative scouting recommended.',
        urgency: record.humidity > 70 ? 'WARNING' : 'NORMAL',
      },
      {
        title: 'Spraying Schedule',
        recommendation: record.wind_speed_kmh > 15
          ? `Wind speeds are high (${record.wind_speed_kmh} km/h). Postpone foliar pesticide spraying to prevent droplet drift.`
          : 'Calm winds suitable for morning foliar spray application.',
        urgency: record.wind_speed_kmh > 15 ? 'CAUTION' : 'OPTIMAL',
      },
    ];

    return res.status(200).json({
      success: true,
      district: record.district,
      current_condition: record.condition,
      temperature: record.temp_c,
      humidity: record.humidity,
      field_advisory: record.advisory,
      advisories,
    });
  } catch (err) {
    console.error('getWeatherAdvisories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate agricultural advisories.' });
  }
}

/**
 * GET /api/weather/districts
 * Summary of all supported districts across Karnataka
 */
function getSupportedDistricts(req, res) {
  try {
    const districts = db.prepare(`
      SELECT district, state, temp_c, condition, rainfall_chance, updated_at
      FROM weather_records
      ORDER BY district ASC
    `).all();

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (err) {
    console.error('getSupportedDistricts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load weather districts.' });
  }
}

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAdvisories,
  getSupportedDistricts,
};
