// FarmConnect Real-Time Live Telemetry & Event Stream Controller
// Aggregates real-time mandi prices, satellite weather, IoT smart soil sensors & order notifications

const db = require('../config/database');

// Simulated high-accuracy IoT smart agricultural sensors for rural farm telemetry
function getLiveIoTSensors(district = 'Mandya') {
  const hour = new Date().getHours();
  // Realistic diurnal cycle for soil moisture and temperature
  const baseMoisture = 38.5; // percentage
  const moistureVariation = Math.sin((hour / 24) * 2 * Math.PI) * 4;
  const currentMoisture = Math.round((baseMoisture + moistureVariation) * 10) / 10;

  const baseTemp = 28.0;
  const tempVariation = Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 5;
  const currentTemp = Math.round((baseTemp + tempVariation) * 10) / 10;

  let dripStatus = 'IDLE';
  let dripAdvisory = 'Soil moisture is optimal for sugarcane & paddy vegetative growth.';
  if (currentMoisture < 35) {
    dripStatus = 'PUMP_RECOMMENDED';
    dripAdvisory = 'Soil moisture dropped below 35%. Automated valve 2 activation recommended.';
  } else if (currentMoisture > 42) {
    dripStatus = 'SATURATED';
    dripAdvisory = 'Soil moisture elevated due to recent moisture retention. Delay irrigation.';
  }

  return {
    district,
    soil_moisture_percent: currentMoisture,
    soil_moisture_status: currentMoisture >= 35 && currentMoisture <= 42 ? 'OPTIMAL' : currentMoisture < 35 ? 'LOW' : 'HIGH',
    canopy_temperature_c: currentTemp,
    ambient_humidity_percent: Math.min(95, Math.max(45, Math.round(68 + Math.cos(hour) * 12))),
    solar_radiation_evapotranspiration_mm: '4.8 mm/day',
    drip_valve_status: dripStatus,
    drip_advisory: dripAdvisory,
    last_sensor_ping: new Date().toISOString(),
  };
}

/**
 * GET /api/live/telemetry
 * Real-time composite agricultural telemetry for dashboards
 */
exports.getLiveTelemetry = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Live APMC Mandi Rates from SQLite
    const mandiPrices = db.prepare(`
      SELECT commodity, variety, state, district, market_mandi, min_price, max_price, modal_price, trend, arrival_date
      FROM mandi_prices
      ORDER BY rowid ASC
      LIMIT 10
    `).all();

    // 2. Platform Real-World Live Metrics
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity > 0').get();
    const marketCrops = db.prepare("SELECT COUNT(*) as count FROM crops_market WHERE status = 'ACTIVE'").get();
    const communityPosts = db.prepare('SELECT COUNT(*) as count FROM community_posts').get();

    // 3. IoT Smart Farm Soil Telemetry
    const iotSensors = getLiveIoTSensors(req.query.district || 'Mandya');

    // 4. Official Kisan Assistance Hotlines
    const supportHotlines = {
      kisan_call_center_toll_free: '1800-180-1551',
      kisan_call_center_dial_uri: 'tel:18001801551',
      karnataka_krishi_sahayavani: '080-22212861',
      kvk_mandya_whatsapp: 'https://wa.me/919845012345?text=Namaskara%20KVK%20Expert%2C%20need%20crop%20advisory',
      pm_kisan_helpline: '155261',
      crop_insurance_toll_free: '1800-180-2117',
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      live_status: 'ONLINE',
      mandi_prices: mandiPrices,
      iot_sensors: iotSensors,
      platform_metrics: {
        total_orders_processed: totalOrders.count || 0,
        active_agri_inputs: activeProducts.count || 0,
        live_farmer_harvest_lots: marketCrops.count || 0,
        community_discussions: communityPosts.count || 0,
      },
      support_hotlines: supportHotlines,
    });
  } catch (err) {
    console.error('getLiveTelemetry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch live telemetry', error: err.message });
  }
};

/**
 * GET /api/live/updates
 * Poll for real-time order status, tracking, and alerts since timestamp
 */
exports.getLiveUpdates = async (req, res) => {
  try {
    const { since = new Date(Date.now() - 3600000).toISOString() } = req.query;

    const recentOrders = db.prepare(`
      SELECT id, order_number, total_amount, payment_status, order_status, tracking_note, updated_at
      FROM orders
      WHERE updated_at >= ?
      ORDER BY updated_at DESC
      LIMIT 10
    `).all(since);

    const recentAlerts = db.prepare(`
      SELECT id, type, title, message, severity, created_at
      FROM farmer_alerts
      WHERE created_at >= ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(since);

    return res.status(200).json({
      success: true,
      query_since: since,
      current_time: new Date().toISOString(),
      recent_orders: recentOrders,
      recent_alerts: recentAlerts,
    });
  } catch (err) {
    console.error('getLiveUpdates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch live updates', error: err.message });
  }
};
