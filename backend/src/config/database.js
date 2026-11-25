// FarmConnect Database Initialization & Persistent Relational Store
// Powered by Node.js built-in native SQLite engine (ACID compliant, zero native compile failures)

const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'farmconnect.db');
console.log(`[Database] Initializing FarmConnect SQLite engine on Node ${process.version}...`);

let db;
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  // Enable WAL mode & foreign keys for high-performance concurrent reads
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  console.log('[Database] Native SQLite engine loaded and initialized successfully.');
} catch (err) {
  console.error(`[Database CRITICAL] node:sqlite is not supported on Node ${process.version}:`, err.message);
  console.error('[Database CRITICAL] Fix: Ensure NODE_VERSION=22 is set in Render Environment Variables.');
  throw err;
}

// Initialize Tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('FARMER', 'BUYER', 'SELLER', 'ADMIN')),
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS farmer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      state TEXT,
      district TEXT,
      taluk TEXT,
      village TEXT,
      location_gps TEXT,
      land_size_acres REAL DEFAULT 0,
      soil_type TEXT,
      primary_crops TEXT,
      experience_years INTEGER DEFAULT 0,
      preferred_language TEXT DEFAULT 'en',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS buyer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT,
      buyer_type TEXT DEFAULT 'Individual',
      delivery_address TEXT,
      gst_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seller_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shop_name TEXT,
      license_number TEXT,
      is_verified INTEGER DEFAULT 0,
      store_address TEXT,
      rating REAL DEFAULT 5.0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS farmer_crops (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      crop_name TEXT NOT NULL,
      variety TEXT,
      sowing_date TEXT NOT NULL,
      harvest_expected TEXT NOT NULL,
      area_acres REAL NOT NULL,
      stage TEXT NOT NULL, -- 'Sowing', 'Vegetative', 'Flowering', 'Maturity', 'Harvested'
      status TEXT NOT NULL DEFAULT 'GROWING',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS farmer_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'WEATHER', 'MANDI', 'PEST', 'SCHEME'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mandi_prices (
      id TEXT PRIMARY KEY,
      commodity TEXT NOT NULL,
      variety TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      market_mandi TEXT NOT NULL,
      min_price REAL NOT NULL,
      max_price REAL NOT NULL,
      modal_price REAL NOT NULL,
      trend TEXT NOT NULL DEFAULT 'STABLE', -- 'UP', 'DOWN', 'STABLE'
      arrival_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weather_records (
      id TEXT PRIMARY KEY,
      district TEXT UNIQUE NOT NULL,
      state TEXT NOT NULL,
      temp_c REAL NOT NULL,
      humidity INTEGER NOT NULL,
      condition TEXT NOT NULL,
      rainfall_chance INTEGER NOT NULL,
      wind_speed_kmh REAL NOT NULL,
      advisory TEXT NOT NULL,
      forecast_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reset_code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED', 'REJECTED'
      resolution_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'Karnataka',
      category TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      benefits TEXT NOT NULL,
      required_documents TEXT,
      application_url TEXT,
      deadline TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crop_enquiries (
      id TEXT PRIMARY KEY,
      crop_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT NOT NULL,
      offered_price REAL NOT NULL,
      quantity_requested REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'Quintal',
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DECLINED'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      commodity TEXT NOT NULL,
      market_mandi TEXT,
      target_price REAL NOT NULL,
      condition TEXT NOT NULL DEFAULT 'ABOVE', -- 'ABOVE', 'BELOW'
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIGGERED', 'CANCELLED'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crop_guides (
      id TEXT PRIMARY KEY,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL, -- 'Kharif', 'Rabi', 'Zaid', 'All Season'
      soil_type TEXT NOT NULL,
      climate TEXT NOT NULL,
      land_preparation TEXT NOT NULL,
      seed_selection TEXT NOT NULL,
      sowing_guide TEXT NOT NULL,
      irrigation_stages_json TEXT NOT NULL,
      fertilizer_schedule_json TEXT NOT NULL,
      weed_control TEXT NOT NULL,
      harvesting_tips TEXT NOT NULL,
      post_harvest TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS soil_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      farm_name TEXT,
      ph REAL NOT NULL,
      nitrogen_kg_ha REAL NOT NULL,
      phosphorus_kg_ha REAL NOT NULL,
      potassium_kg_ha REAL NOT NULL,
      organic_carbon_percent REAL NOT NULL,
      soil_type TEXT NOT NULL,
      fertility_rating TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'OPTIMAL', 'HIGH'
      recommendations_json TEXT NOT NULL,
      tested_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pest_diseases (
      id TEXT PRIMARY KEY,
      crop_name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'PEST', 'DISEASE'
      name TEXT NOT NULL,
      scientific_name TEXT,
      symptoms TEXT NOT NULL,
      causes TEXT NOT NULL,
      prevention TEXT NOT NULL,
      chemical_treatment TEXT NOT NULL,
      biological_control TEXT NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS camera_scans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      crop_type TEXT,
      plant_part TEXT,
      image_preview TEXT,
      diagnosis_name TEXT NOT NULL,
      confidence_percentage REAL NOT NULL,
      severity TEXT NOT NULL,
      treatment_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'UPI', -- 'UPI', 'NETBANKING', 'CARD', 'COD'
      payment_status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
      transaction_ref TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      tracking_number TEXT UNIQUE NOT NULL,
      courier_partner TEXT NOT NULL DEFAULT 'K-Agri Express Logistics',
      vehicle_number TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      current_location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'IN_TRANSIT', -- 'ORDER_CONFIRMED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'
      estimated_delivery TEXT NOT NULL,
      checkpoints_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'SYSTEM', -- 'ORDER', 'WEATHER', 'MANDI', 'SYSTEM'
      is_read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL DEFAULT 'FARMER',
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS library_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'AGRONOMY', 'IRRIGATION', 'SOIL_SCIENCE', 'ORGANIC', 'POST_HARVEST'
      read_time_mins INTEGER DEFAULT 5,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      author TEXT NOT NULL,
      published_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_farmer_crops_user ON farmer_crops(user_id);
    CREATE INDEX IF NOT EXISTS idx_mandi_prices_commodity ON mandi_prices(commodity);
    CREATE INDEX IF NOT EXISTS idx_mandi_prices_district ON mandi_prices(district);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT,
      category TEXT NOT NULL, -- 'SEEDS', 'FERTILIZERS', 'EQUIPMENT', 'TOOLS', 'PESTICIDES'
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      unit TEXT NOT NULL, -- 'kg', 'bag', 'bottle', 'quintal', 'pack'
      stock_quantity INTEGER NOT NULL DEFAULT 50,
      image_url TEXT,
      rating REAL DEFAULT 4.8,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crops_market (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      variety TEXT NOT NULL,
      quantity_available REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'Quintal',
      expected_price REAL NOT NULL,
      mandi_location TEXT NOT NULL,
      quality_grade TEXT NOT NULL DEFAULT 'Grade A',
      harvest_date TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL, -- 'PRODUCT', 'CROP'
      item_id TEXT NOT NULL,
      title TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'kg',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      title TEXT NOT NULL,
      unit_price REAL NOT NULL,
      unit TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_amount REAL NOT NULL,
      shipping_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_phone TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      payment_status TEXT NOT NULL DEFAULT 'PAID',
      order_status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
      tracking_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      title TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      target_type TEXT NOT NULL, -- 'PRODUCT', 'CROP', 'SELLER', 'FARMER'
      target_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_crops_market_name ON crops_market(crop_name);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_library_category ON library_articles(category);
    CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state);
    CREATE INDEX IF NOT EXISTS idx_crop_enquiries_crop ON crop_enquiries(crop_id);
    CREATE INDEX IF NOT EXISTS idx_soil_reports_user ON soil_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_pest_crop ON pest_diseases(crop_name);
  `);

  // Safe schema migrations for existing SQLite databases
  try { db.exec('ALTER TABLE farmer_profiles ADD COLUMN taluk TEXT;'); } catch {}
  try { db.exec('ALTER TABLE farmer_profiles ADD COLUMN location_gps TEXT;'); } catch {}
  try { db.exec("ALTER TABLE seller_profiles ADD COLUMN verification_status TEXT DEFAULT 'PENDING';"); } catch {}
  try { db.exec("ALTER TABLE seller_profiles ADD COLUMN business_name TEXT;"); } catch {}
  try { db.exec("ALTER TABLE seller_profiles ADD COLUMN gstin TEXT;"); } catch {}
  try { db.exec("ALTER TABLE seller_profiles ADD COLUMN total_orders INTEGER DEFAULT 0;"); } catch {}
  try { db.exec("ALTER TABLE seller_profiles ADD COLUMN total_revenue REAL DEFAULT 0.0;"); } catch {}
  try { db.exec("ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;"); } catch {}
  try { db.exec('ALTER TABLE audit_logs ADD COLUMN target_type TEXT;'); } catch {}
  try { db.exec('ALTER TABLE audit_logs ADD COLUMN target_id TEXT;'); } catch {}
  try { db.exec("UPDATE seller_profiles SET business_name = shop_name WHERE business_name IS NULL;"); } catch {}
  try { db.exec("UPDATE seller_profiles SET verification_status = 'VERIFIED' WHERE is_verified = 1;"); } catch {}
  try { db.exec("UPDATE notifications SET user_id = 'farmer_ramesh' WHERE id IN ('notif_1', 'notif_2');"); } catch {}
  try {
    const bcrypt = require('bcryptjs');
    const fHash = bcrypt.hashSync('FarmerPassword123', 8);
    const bHash = bcrypt.hashSync('BuyerPassword123', 8);
    const sHash = bcrypt.hashSync('SellerPassword123', 8);
    const aHash = bcrypt.hashSync('AdminSuperPassword123', 8);
    db.prepare("UPDATE users SET password_hash = ? WHERE email = 'ramesh.farmer@example.com' OR phone = '9845012345'").run(fHash);
    db.prepare("UPDATE users SET password_hash = ? WHERE email = 'kiran.buyer@example.com' OR phone = '9845012346'").run(bHash);
    db.prepare("UPDATE users SET password_hash = ? WHERE email = 'cauvery.seller@example.com' OR phone = '9845012347'").run(sHash);
    db.prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@farmconnect.org' OR phone = '9845012348'").run(aHash);
  } catch {}

  // Seed Initial Verified Mandi Data & Weather Data for testing and real reference
  seedInitialData();
}

function seedInitialData() {
  const existingMandi = db.prepare('SELECT COUNT(*) as count FROM mandi_prices').get();
  if (existingMandi.count === 0) {
    const today = new Date().toISOString().split('T')[0];
    const mandis = [
      ['m1', 'Sugarcane', 'Co 86032', 'Karnataka', 'Mandya', 'Mandya APMC', 3150, 3400, 3280, 'UP', today],
      ['m2', 'Paddy (Dhan)', 'Sona Masoori', 'Karnataka', 'Mandya', 'Maddur Mandi', 2150, 2450, 2350, 'UP', today],
      ['m3', 'Ragi (Finger Millet)', 'GPU-28', 'Karnataka', 'Mandya', 'Mandya APMC', 3800, 4200, 4050, 'STABLE', today],
      ['m4', 'Tomato', 'Hybrid Local', 'Karnataka', 'Kolar', 'Kolar APMC', 1400, 2200, 1850, 'DOWN', today],
      ['m5', 'Onion', 'Bellary Red', 'Karnataka', 'Hubli', 'Hubli APMC', 1600, 2300, 2000, 'UP', today],
      ['m6', 'Cotton', 'DCH-32', 'Karnataka', 'Raichur', 'Raichur APMC', 6800, 7500, 7200, 'STABLE', today],
    ];

    const insertMandi = db.prepare(`
      INSERT INTO mandi_prices (id, commodity, variety, state, district, market_mandi, min_price, max_price, modal_price, trend, arrival_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of mandis) {
      insertMandi.run(...row);
    }
  }

  const existingWeather = db.prepare('SELECT COUNT(*) as count FROM weather_records').get();
  if (existingWeather.count === 0) {
    const now = new Date().toISOString();
    const weather = [
      [
        'w_mandya',
        'Mandya',
        'Karnataka',
        29.5,
        68,
        'Partly Cloudy',
        20,
        14.2,
        'Optimal conditions for sugarcane vegetative stage. Moderate moisture; plan light furrow irrigation tomorrow morning.',
        JSON.stringify([
          { day: 'Today', temp: 29, condition: 'Partly Cloudy', rain: 20 },
          { day: 'Tomorrow', temp: 31, condition: 'Sunny', rain: 10 },
          { day: 'Friday', temp: 28, condition: 'Light Rain', rain: 60 },
          { day: 'Saturday', temp: 27, condition: 'Scattered Showers', rain: 70 },
        ]),
        now,
      ],
      [
        'w_mysuru',
        'Mysuru',
        'Karnataka',
        28.0,
        72,
        'Humid',
        35,
        12.0,
        'Good humidity for paddy tillering. Monitor field bunds and check for early stem borer signs.',
        JSON.stringify([
          { day: 'Today', temp: 28, condition: 'Humid', rain: 35 },
          { day: 'Tomorrow', temp: 29, condition: 'Overcast', rain: 45 },
          { day: 'Friday', temp: 26, condition: 'Rain', rain: 80 },
          { day: 'Saturday', temp: 27, condition: 'Scattered Rain', rain: 50 },
        ]),
        now,
      ],
    ];

    const insertWeather = db.prepare(`
      INSERT INTO weather_records (id, district, state, temp_c, humidity, condition, rainfall_chance, wind_speed_kmh, advisory, forecast_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of weather) {
      insertWeather.run(...row);
    }
  }

  // Seed Multi-District Weather Records if needed
  const additionalDistricts = [
    [
      'w_kolar',
      'Kolar',
      'Karnataka',
      27.2,
      64,
      'Clear & Sunny',
      10,
      11.5,
      'Ideal dry climate for tomato and vegetable picking. Ensure evening drip irrigation for newly transplanted seedlings.',
      JSON.stringify([
        { day: 'Today', temp: 27, condition: 'Clear', rain: 10 },
        { day: 'Tomorrow', temp: 28, condition: 'Sunny', rain: 5 },
        { day: 'Friday', temp: 29, condition: 'Partly Cloudy', rain: 15 },
        { day: 'Saturday', temp: 27, condition: 'Clear', rain: 10 },
      ]),
    ],
    [
      'w_hubli',
      'Hubli',
      'Karnataka',
      30.5,
      55,
      'Sunny & Dry',
      5,
      16.0,
      'Dry weather favorable for red onion bulb curing in field rows. Avoid surface irrigation 7 days before harvesting.',
      JSON.stringify([
        { day: 'Today', temp: 31, condition: 'Sunny', rain: 5 },
        { day: 'Tomorrow', temp: 32, condition: 'Sunny', rain: 5 },
        { day: 'Friday', temp: 30, condition: 'Sunny', rain: 10 },
        { day: 'Saturday', temp: 29, condition: 'Partly Cloudy', rain: 20 },
      ]),
    ],
    [
      'w_raichur',
      'Raichur',
      'Karnataka',
      32.0,
      50,
      'High Heat',
      0,
      18.5,
      'High daytime heat in cotton belt. Watch out for whitefly stress. Spray 2% neem oil extract in late afternoon.',
      JSON.stringify([
        { day: 'Today', temp: 32, condition: 'High Heat', rain: 0 },
        { day: 'Tomorrow', temp: 33, condition: 'Sunny', rain: 0 },
        { day: 'Friday', temp: 32, condition: 'Clear', rain: 5 },
        { day: 'Saturday', temp: 31, condition: 'Sunny', rain: 5 },
      ]),
    ],
  ];

  const nowW = new Date().toISOString();
  for (const w of additionalDistricts) {
    const exists = db.prepare('SELECT id FROM weather_records WHERE id = ?').get(w[0]);
    if (!exists) {
      db.prepare(`
        INSERT INTO weather_records (id, district, state, temp_c, humidity, condition, rainfall_chance, wind_speed_kmh, advisory, forecast_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...w, nowW);
    }
  }

  // Seed Historical Mandi Data Points for Trend Visualizations
  const baseMandiHistory = [
    // Sugarcane at Mandya (Past 5 days)
    ['m_hist_1', 'Sugarcane', 'Co 86032', 'Karnataka', 'Mandya', 'Mandya APMC', 3100, 3350, 3210, 'UP', '2026-11-01'],
    ['m_hist_2', 'Sugarcane', 'Co 86032', 'Karnataka', 'Mandya', 'Mandya APMC', 3120, 3380, 3230, 'UP', '2026-11-02'],
    ['m_hist_3', 'Sugarcane', 'Co 86032', 'Karnataka', 'Mandya', 'Mandya APMC', 3140, 3400, 3250, 'UP', '2026-11-03'],
    ['m_hist_4', 'Sugarcane', 'Co 86032', 'Karnataka', 'Mandya', 'Mandya APMC', 3150, 3400, 3280, 'STABLE', '2026-11-04'],
    // Paddy at Maddur (Past 5 days)
    ['m_hist_5', 'Paddy (Dhan)', 'Sona Masoori', 'Karnataka', 'Mandya', 'Maddur Mandi', 2100, 2400, 2300, 'UP', '2026-11-01'],
    ['m_hist_6', 'Paddy (Dhan)', 'Sona Masoori', 'Karnataka', 'Mandya', 'Maddur Mandi', 2120, 2420, 2320, 'UP', '2026-11-02'],
    ['m_hist_7', 'Paddy (Dhan)', 'Sona Masoori', 'Karnataka', 'Mandya', 'Maddur Mandi', 2150, 2450, 2350, 'UP', '2026-11-03'],
    ['m_hist_8', 'Paddy (Dhan)', 'Sona Masoori', 'Karnataka', 'Mandya', 'Maddur Mandi', 2140, 2430, 2340, 'DOWN', '2026-11-04'],
  ];

  for (const row of baseMandiHistory) {
    const exists = db.prepare('SELECT id FROM mandi_prices WHERE id = ?').get(row[0]);
    if (!exists) {
      db.prepare(`
        INSERT INTO mandi_prices (id, commodity, variety, state, district, market_mandi, min_price, max_price, modal_price, trend, arrival_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...row);
    }
  }
  const existingProd = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (existingProd.count === 0) {
    const now = new Date().toISOString();
    const products = [
      ['prod_1', 'seller_cauvery', 'SEEDS', 'Hybrid Paddy Seeds (Sona Masoori)', 'Certified disease-resistant high-tillering variety with 135-day maturity.', 850, 'bag (10kg)', 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 4.9, now],
      ['prod_2', 'seller_cauvery', 'SEEDS', 'Ragi Seeds GPU-28 (Drought Hardy)', 'High-yield drought-tolerant finger millet seed stock certified by UAS Bengaluru.', 420, 'bag (5kg)', 85, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 4.8, now],
      ['prod_3', 'seller_cauvery', 'FERTILIZERS', 'Organic Neem Cake Fertilizer', '100% pure cold-pressed neem cake. Natural nematicide and slow-release nitrogen.', 650, 'bag (25kg)', 200, 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d', 4.7, now],
      ['prod_4', 'seller_cauvery', 'FERTILIZERS', 'Water Soluble NPK 19-19-19', '100% water-soluble foliar spray fertilizer for balanced vegetative and reproductive growth.', 1250, 'bag (25kg)', 150, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b', 4.9, now],
      ['prod_5', 'seller_cauvery', 'TOOLS', 'Ergonomic Hand Weeder & Cultivator', 'Hardened forged steel twin-tine weeder with rust-resistant grip.', 350, 'unit', 60, 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea', 4.6, now],
      ['prod_6', 'seller_cauvery', 'EQUIPMENT', 'Battery Operated Knapsack Sprayer 16L', '12V 8Ah lithium battery with adjustable brass nozzle and dual pressure regulator.', 2800, 'unit', 40, 'https://images.unsplash.com/photo-1589923188900-85dae523342b', 4.8, now],
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (id, seller_id, category, title, description, price, unit, stock_quantity, image_url, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of products) {
      insertProduct.run(...p);
    }
  }

  // Ensure All 10 Agriculture E-Commerce Categories are Present
  const additionalCategories = [
    ['prod_7', 'seller_cauvery', 'BIO_FERTILIZERS', 'Trichoderma Viride Bio-Fungicide (1% WP)', 'Ecofriendly fungal antagonist for root rot, wilt, and damping-off seed treatment.', 280, 'packet (1kg)', 90, 'https://images.unsplash.com/photo-1589923188900-85dae523342b', 4.9],
    ['prod_8', 'seller_cauvery', 'PESTICIDES', 'Neemazal 10,000 PPM Bio-Pesticide', 'Cold-pressed azadirachtin botanical pesticide for whiteflies, aphids, and borers.', 450, 'bottle (500ml)', 110, 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d', 4.7],
    ['prod_9', 'seller_cauvery', 'IRRIGATION_PRODUCTS', 'Inline Drip Lateral Pipe 16mm (Class 2)', 'UV-stabilized drip tube with 40cm emitter spacing delivering 2.2 LPH flow rate.', 1850, 'bundle (400m)', 35, 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0', 4.8],
    ['prod_10', 'seller_cauvery', 'ORGANIC_PRODUCTS', 'Pure Vermicompost Enriched with Cow Dung', 'Laboratory-tested earthworm casting compost high in organic carbon and micro-flora.', 550, 'bag (50kg)', 140, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b', 4.9],
    ['prod_11', 'seller_cauvery', 'CROP_PROTECTION', 'UV Stabilized Silver-Black Mulch Film (25 Micron)', 'Prevents weed growth, retains soil moisture and minimizes water evaporation.', 1600, 'roll (400m)', 50, 'https://images.unsplash.com/photo-1589923188900-85dae523342b', 4.8],
    ['prod_12', 'seller_cauvery', 'OTHER_SUPPLIES', 'Heavy Duty Waterproof Tarpaulin Sheet (250 GSM)', '18 x 24 ft reinforced multi-layer sheet for grain storage and threshing floor.', 2100, 'sheet', 45, 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea', 4.7],
  ];

  const nowTime = new Date().toISOString();
  for (const extra of additionalCategories) {
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(extra[0]);
    if (!exists) {
      db.prepare(`
        INSERT INTO products (id, seller_id, category, title, description, price, unit, stock_quantity, image_url, rating, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...extra, nowTime);
    }
  }

  // Ensure Rich Crop Marketplace Listings
  const extraCrops = [
    ['crop_m4', 'farmer_ramesh', 'Ramesh Patil', 'Red Onion', 'Bellary Premium Red', 150, 'Quintal', 1950, 'Hubli Mandi Yard', 'Grade A', '2026-11-25', 'Medium-to-large pungent red onions cured for long shelf storage.', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'AVAILABLE'],
    ['crop_m5', 'farmer_ramesh', 'Ramesh Patil', 'Hybrid Tomato', 'Shivaji F1 Firm Skin', 90, 'Crate (25kg)', 480, 'Kolar APMC Market', 'Grade A', '2026-11-18', 'Grade A field-plucked table tomatoes with thick pericarp suitable for long distance freight.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', 'AVAILABLE'],
    ['crop_m6', 'farmer_shankar', 'Shankar Gowda', 'Bt Cotton', 'DCH-32 Long Staple', 60, 'Quintal', 7100, 'Raichur Cotton Yard', 'Grade A', '2026-12-02', 'First picking high-strength long-staple seed cotton with minimal trash content.', 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f', 'AVAILABLE'],
  ];

  for (const cr of extraCrops) {
    const exists = db.prepare('SELECT id FROM crops_market WHERE id = ?').get(cr[0]);
    if (!exists) {
      db.prepare(`
        INSERT INTO crops_market (id, farmer_id, farmer_name, crop_name, variety, quantity_available, unit, expected_price, mandi_location, quality_grade, harvest_date, description, image_url, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...cr, nowTime);
    }
  }

  // Seed Crop Enquiries
  const existingEnq = db.prepare('SELECT COUNT(*) as count FROM crop_enquiries').get();
  if (existingEnq.count === 0) {
    const enquiries = [
      ['enq_1', 'crop_m1', 'farmer_ramesh', 'buyer_kiran', 'Kiran Wholesales', '9845012346', 3250, 100, 'Quintal', 'Can you deliver 100 quintals to our Mandya processing facility next Monday?', 'PENDING', nowTime],
      ['enq_2', 'crop_m2', 'farmer_ramesh', 'buyer_kiran', 'Kiran Wholesales', '9845012346', 2350, 50, 'Quintal', 'Interested in full batch if moisture level is under 14%. Please confirm.', 'ACCEPTED', nowTime],
    ];
    for (const e of enquiries) {
      db.prepare(`
        INSERT INTO crop_enquiries (id, crop_id, farmer_id, buyer_id, buyer_name, buyer_phone, offered_price, quantity_requested, unit, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...e);
    }
  }

  // Seed Verified Market Crops (Direct Farmer Produce)
  const existingCrops = db.prepare('SELECT COUNT(*) as count FROM crops_market').get();
  if (existingCrops.count === 0) {
    const now = new Date().toISOString();
    const crops = [
      ['crop_m1', 'farmer_ramesh', 'Ramesh Patil', 'Sugarcane', 'Co 86032 (High Sugar Recovery)', 250, 'Quintal', 3350, 'Mandya APMC Hub', 'Grade A', '2026-11-20', 'Freshly matured crop with high brix sweetness. Ready for direct mill or jaggery procurement.', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31', 'AVAILABLE', now],
      ['crop_m2', 'farmer_ramesh', 'Ramesh Patil', 'Sona Masoori Paddy', 'Paddy Raw Grain (Fine)', 120, 'Quintal', 2400, 'Maddur APMC Yard', 'Grade A', '2026-12-05', 'Single-origin unpolished paddy grain harvested from canal-fed fields in Maddur.', 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 'AVAILABLE', now],
      ['crop_m3', 'farmer_shankar', 'Shankar Gowda', 'Finger Millet (Ragi)', 'GPU-28 Organic Grade', 80, 'Quintal', 4150, 'Mandya Market', 'Grade A', '2026-11-15', 'Naturally cultivated rainfed organic ragi rich in calcium and dietary fiber.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'AVAILABLE', now],
    ];

    const insertCrop = db.prepare(`
      INSERT INTO crops_market (id, farmer_id, farmer_name, crop_name, variety, quantity_available, unit, expected_price, mandi_location, quality_grade, harvest_date, description, image_url, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of crops) {
      insertCrop.run(...c);
    }
  }

  // Seed Initial Complaints / Disputes
  const existingComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  if (existingComplaints.count === 0) {
    const now = new Date().toISOString();
    const complaints = [
      ['cmp_1', 'buyer_kiran', 'Kiran Wholesales', 'BUYER', 'Consignment moisture verification', 'Requested moisture certificate for paddy shipment #FC-ORD-2026-48679.', 'OPEN', null, now, now],
      ['cmp_2', 'farmer_ramesh', 'Ramesh Patil', 'FARMER', 'Mandi arrival weighing report', 'Maddur APMC weighbridge sync delayed by 2 hours.', 'RESOLVED', 'Resolved with APMC digital slip integration.', now, now],
    ];

    const insertCmp = db.prepare(`
      INSERT INTO complaints (id, user_id, user_name, user_role, subject, description, status, resolution_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of complaints) {
      insertCmp.run(...c);
    }
  }

  // Seed Crop Cultivation Guides (Phase 11)
  const existingGuides = db.prepare('SELECT COUNT(*) as count FROM crop_guides').get();
  if (existingGuides.count === 0) {
    const guides = [
      [
        'guide_sugarcane',
        'Sugarcane',
        'All Season',
        'Deep fertile well-drained loamy soil, pH 6.5 to 7.5',
        'Tropical climate with 28-35°C, high sunshine hours',
        'Deep plowing with mould board plow up to 45cm followed by 2 cross-harrowings and furrows spaced at 120-150cm.',
        'Choose disease-free three-budded setts of Co 86032 or Co 0238 treated with Carbendazim (0.1%).',
        'End-to-end trench planting in furrows; cover with 5cm soil and perform light irrigation immediately.',
        JSON.stringify([
          { stage: 'Germination (0-35 days)', days: 'Every 7-8 days', note: 'Ensure wet soil without waterlogging' },
          { stage: 'Tillering (36-100 days)', days: 'Every 10-12 days', note: 'Critical water requirement' },
          { stage: 'Grand Growth (101-250 days)', days: 'Every 8-10 days', note: 'Peak vegetative water demand' },
          { stage: 'Ripening (251-360 days)', days: 'Stop 15 days before harvest', note: 'Facilitates sugar accumulation' },
        ]),
        JSON.stringify({
          basal: 'Urea: 50 kg/acre, SSP: 125 kg/acre, MOP: 40 kg/acre + 10 tonnes FYM',
          day45: 'Urea: 50 kg/acre at first earthing up',
          day90: 'Urea: 75 kg/acre, MOP: 40 kg/acre at final earthing up',
        }),
        'Apply Atrazine @ 1.0 kg/acre within 3 days of planting followed by 2 manual hoeings at 30 & 60 days.',
        'Harvest at 11-12 months when lower leaves dry and brix reading reaches 18-20% using hand refractometer.',
        'Crush harvested cane within 24 hours to prevent inversion of sucrose into non-crystallizable sugars.',
      ],
      [
        'guide_paddy',
        'Paddy (Rice)',
        'Kharif',
        'Clay or clay-loamy soils with high water holding capacity',
        'Warm humid climate, 22-32°C during vegetative phase',
        'Wet tillage (puddling) 2-3 times to create an impermeable hardpan for ponding water.',
        'Certified Sona Masoori (BPT 5204) seeds treated with Trichoderma or salt water floatation.',
        'Transplant 21-25 day old seedlings at 20x15cm spacing with 2-3 seedlings per hill.',
        JSON.stringify([
          { stage: 'Transplanting to Tillering', days: 'Keep 2-3cm standing water', note: 'Prevents weed flush' },
          { stage: 'Panicle Initiation to Flowering', days: 'Keep 5cm standing water', note: 'Most sensitive to drought' },
          { stage: 'Grain Filling to Maturity', days: 'Drain field 10 days before harvest', note: 'Even ripening' },
        ]),
        JSON.stringify({
          basal: 'DAP: 50 kg/acre, Potash: 25 kg/acre, Zinc Sulphate: 10 kg/acre',
          tillering: 'Urea: 35 kg/acre top dress',
          panicle: 'Urea: 25 kg/acre + Potash: 15 kg/acre',
        }),
        'Apply Pretilachlor 50 EC @ 500 ml/acre at 3-5 days after transplanting in shallow water.',
        'Harvest when 80-85% grains in panicles turn golden straw color.',
        'Dry threshed paddy grains to 12-14% moisture content before bagging in jute gunny sacks.',
      ],
    ];

    const insertGuide = db.prepare(`
      INSERT INTO crop_guides (
        id, crop_name, season, soil_type, climate, land_preparation, seed_selection,
        sowing_guide, irrigation_stages_json, fertilizer_schedule_json, weed_control, harvesting_tips, post_harvest
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const g of guides) {
      insertGuide.run(...g);
    }
  }

  // Seed Soil Health Reports (Phase 12)
  const existingSoil = db.prepare('SELECT COUNT(*) as count FROM soil_reports').get();
  if (existingSoil.count === 0) {
    const soilReports = [
      [
        'soil_1',
        'farmer_ramesh',
        'East Canal Plot (Survey #142)',
        6.8,
        240.0, // Low Nitrogen (< 280)
        24.5,  // Medium Phosphorus (23-56)
        290.0, // High Potassium (> 280)
        0.65,  // Medium Organic Carbon (0.5 - 0.75%)
        'Red Sandy Loam',
        'OPTIMAL',
        JSON.stringify({
          dosage_nitrogen: '+15% Urea supplementation required for target tillering',
          dosage_phosphorus: 'Standard DAP application recommended at basal stage',
          dosage_potassium: 'Adequate soil reserve; reduce MOP top dressing by 20%',
          soil_amendments: 'Apply 2 tonnes/acre farmyard manure or vermicompost to elevate organic carbon above 0.75%',
          suitable_crops: ['Sugarcane', 'Paddy', 'Finger Millet (Ragi)', 'Groundnut'],
        }),
        '2026-10-15',
      ],
    ];

    const insertSoil = db.prepare(`
      INSERT INTO soil_reports (
        id, user_id, farm_name, ph, nitrogen_kg_ha, phosphorus_kg_ha, potassium_kg_ha,
        organic_carbon_percent, soil_type, fertility_rating, recommendations_json, tested_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of soilReports) {
      insertSoil.run(...s);
    }
  }

  // Seed Pest & Disease Knowledge Base (Phase 13)
  const existingPests = db.prepare('SELECT COUNT(*) as count FROM pest_diseases').get();
  if (existingPests.count === 0) {
    const pests = [
      [
        'pest_1',
        'Paddy (Rice)',
        'PEST',
        'Yellow Stem Borer',
        'Scirpophaga incertulas',
        'Dead heart in vegetative stage (central shoot dries); white earhead at heading stage with chaffy empty grains.',
        'Adult moths lay egg masses covered with buff hairs on leaf tips; caterpillars bore into tillers.',
        'Clip seedling tips before transplanting; avoid excess nitrogen fertilizer; set up pheromone traps @ 8 traps/acre.',
        'Chlorantraniliprole 18.5% SC @ 60 ml/acre or Cartap Hydrochloride 50% SP @ 400 g/acre.',
        'Release egg parasitoid Trichogramma japonicum @ 40,000/acre at weekly intervals starting 30 days after transplanting.',
        'https://images.unsplash.com/photo-1590682680695-43b964a3ae17',
      ],
      [
        'pest_2',
        'Paddy (Rice)',
        'DISEASE',
        'Rice Blast',
        'Magnaporthe oryzae',
        'Spindle-shaped lesions with grey/ash center and brownish-red border on leaves; black nodal necrosis; neck rot.',
        'High air humidity (>90%), prolonged leaf wetness, cloudy drizzling days and high doses of nitrogenous fertilizers.',
        'Seed treatment with Tricyclazole 75% WP @ 2g/kg seed; balanced NPK application; avoid late planting.',
        'Foliar spray of Tricyclazole 75% WP @ 120 g/acre or Isoprothiolane 40% EC @ 300 ml/acre at initial symptom appearance.',
        'Foliar spray of Pseudomonas fluorescens @ 1 kg/acre in 200 liters of water.',
        'https://images.unsplash.com/photo-1589923188900-85dae523342b',
      ],
      [
        'pest_3',
        'Tomato',
        'DISEASE',
        'Early Blight',
        'Alternaria solani',
        'Concentric dark rings (target board pattern) on older lower leaves, stems, and fruits; leaf yellowing and drop.',
        'Warm temperatures (24-29°C) accompanied by frequent rains or heavy dews; infected crop residue in soil.',
        'Crop rotation with non-solanaceous crops; drip irrigation instead of sprinkler; mulch beds with silver-black film.',
        'Spray Mancozeb 75% WP @ 400 g/acre or Azoxystrobin 23% SC @ 200 ml/acre.',
        'Biological spray of Trichoderma harzianum or Bacillus subtilis @ 5g/liter water.',
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      ],
      [
        'pest_4',
        'Sugarcane',
        'PEST',
        'Early Shoot Borer',
        'Chilo infuscatellus',
        'Dead heart in young shoots (1-3 months); emitting foul odor when pulled out; pinholes on stem bases.',
        'High temperature with low humidity during pre-monsoon summer months; late planting.',
        'Trash mulching @ 3 tonnes/acre at 30 days after planting; light furrow irrigation during hot spells.',
        'Soil application of Fipronil 0.3% GR @ 10 kg/acre along cane rows or Chlorantraniliprole 18.5% SC @ 150 ml/acre.',
        'Release of Trichogramma chilonis @ 20,000/acre starting 30 days after cane planting.',
        'https://images.unsplash.com/photo-1596704017254-9b121068fb31',
      ],
    ];

    const insertPest = db.prepare(`
      INSERT INTO pest_diseases (
        id, crop_name, category, name, scientific_name, symptoms, causes,
        prevention, chemical_treatment, biological_control, image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of pests) {
      insertPest.run(...p);
    }
  }

  // Seed Government Agricultural Schemes (Phase 18)
  const existingSchemes = db.prepare('SELECT COUNT(*) as count FROM schemes').get();
  if (existingSchemes.count === 0) {
    const nowS = new Date().toISOString();
    const schemes = [
      [
        'sch_pmkisan',
        'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        'Central',
        'FINANCIAL',
        'All landholding farmer families with cultivable land in their names.',
        'Direct financial benefit of ₹6,000 per year payable in three equal four-monthly installments of ₹2,000.',
        'Aadhaar Card, Land Record (Pahani / RTC), Bank Account linked with Aadhaar.',
        'https://pmkisan.gov.in',
        'Open Throughout Year',
        'ACTIVE',
        nowS,
      ],
      [
        'sch_pmfby',
        'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        'Central',
        'INSURANCE',
        'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
        'Comprehensive crop insurance covering yield loss due to non-preventable natural risks (drought, flood, pests) at low premium (1.5% - 2%).',
        'Proposal Form, Land Record (RTC / Saguvali Chit), Sowing Certificate, Bank Passbook.',
        'https://pmfby.gov.in',
        'Before Cut-off date per crop season',
        'ACTIVE',
        nowS,
      ],
      [
        'sch_raitha_siri',
        'Raitha Siri Scheme (ರೈತ ಸಿರಿ ಯೋಜನೆ)',
        'Karnataka',
        'SUBSIDY',
        'Farmers cultivating minor millets (Ragi, Foxtail, Little, Kodo, Barnyard, Proso millet) in Karnataka.',
        'Direct benefit incentive of ₹10,000 per hectare (up to a maximum of 2 hectares) credited to farmer bank account.',
        'FRUITS ID (FID), RTC Land Record, Aadhaar linked bank account.',
        'https://fruits.karnataka.gov.in',
        'Post-sowing verification window',
        'ACTIVE',
        nowS,
      ],
      [
        'sch_krishi_bhagya',
        'Krishi Bhagya Scheme (ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ)',
        'Karnataka',
        'IRRIGATION',
        'Rainfed dryland agricultural farmers in drought-prone taluks across Karnataka.',
        '80% to 90% subsidy for construction of farm ponds (Krishi Honda), polythene lining, diesel/solar pump sets, and shade net nurseries.',
        'Land RTC, Caste Certificate (for SC/ST higher subsidy), Bank Passbook, Field GPS photo.',
        'https://raitamitra.karnataka.gov.in',
        'Subject to annual district budget allocations',
        'ACTIVE',
        nowS,
      ],
    ];

    const insertScheme = db.prepare(`
      INSERT INTO schemes (
        id, title, state, category, eligibility, benefits, required_documents,
        application_url, deadline, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const sch of schemes) {
      insertScheme.run(...sch);
    }
  }

  // Seed Community Posts (Phase 22)
  const existingPosts = db.prepare('SELECT COUNT(*) as count FROM community_posts').get();
  if (existingPosts.count === 0) {
    const nowC = new Date().toISOString();
    const posts = [
      [
        'post_1',
        'farmer_ramesh',
        'Ramesh Patil',
        'FARMER',
        'Remarkable tillering in Co 86032 Sugarcane with trash mulching!',
        'Fellow farmers, we applied 3 tonnes of cane trash mulch between rows at 35 days after planting. Soil moisture is preserved even during hot spells, and weed emergence dropped by almost 80%. Highly recommended for Mandya canal belt.',
        'https://images.unsplash.com/photo-1596704017254-9b121068fb31',
        14,
        2,
        nowC,
      ],
      [
        'post_2',
        'farmer_shankar',
        'Shankar Gowda',
        'FARMER',
        'Direct drilling of GPU-28 Ragi gave uniform emergence',
        'Used UAS Bengaluru seed drill at 22.5cm row spacing with 5kg seed/acre. Emergence is 95% uniform without gap filling needed. Anyone else trying seed drills this season?',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
        9,
        1,
        nowC,
      ],
    ];

    const insertPost = db.prepare(`
      INSERT INTO community_posts (
        id, user_id, author_name, author_role, title, content, image_url,
        likes_count, comments_count, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of posts) {
      insertPost.run(...p);
    }
  }

  // Seed Agricultural Library Articles (Phase 23)
  const existingArticles = db.prepare('SELECT COUNT(*) as count FROM library_articles').get();
  if (existingArticles.count === 0) {
    const nowL = new Date().toISOString();
    const articles = [
      [
        'art_1',
        'Precision Furrow Irrigation Scheduling for Cash Crops',
        'IRRIGATION',
        6,
        'Scientific guide on crop water requirements, critical moisture stress periods, and furrow discharge control.',
        'Sugarcane, paddy, and vegetable cash crops require strict irrigation scheduling tailored to soil evapotranspiration rates. Over-irrigation leaches nitrate nitrogen and fosters root rots, while moisture stress at critical tillering and panicle development cuts yield by up to 35%. Always practice alternate furrow irrigation when water supply is restricted.',
        'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0',
        'Dr. H. M. Mallikarjuna (Agronomist, UAS Bengaluru)',
        nowL,
      ],
      [
        'art_2',
        'Soil Organic Carbon Restoration Through Vermicomposting',
        'SOIL_SCIENCE',
        5,
        'How earthworm casting compost improves soil cation exchange capacity (CEC) and fertilizer efficiency.',
        'Tropical Indian agricultural soils typically suffer from depleted organic carbon (<0.5%). Applying 2.5 tonnes of enriched vermicompost per acre annually introduces mycorrhizal fungi and micro-flora, revitalizing soil microbial biomass and enhancing nutrient availability from commercial fertilizers by over 25%.',
        'https://images.unsplash.com/photo-1592417817098-8f3d6910985b',
        'Agricultural Research Station, Mandya',
        nowL,
      ],
    ];

    const insertArt = db.prepare(`
      INSERT INTO library_articles (
        id, title, category, read_time_mins, summary, content, image_url, author, published_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of articles) {
      insertArt.run(...a);
    }
  }

  // Ensure Seed Users exist for Referential Integrity (Phases 1-32)
  let buyerUser = db.prepare("SELECT id FROM users WHERE id = 'buyer_kiran' OR email = 'kiran.buyer@example.com' OR phone = '9845012346'").get();
  if (!buyerUser) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('BuyerPassword123', 8);
    const nowB = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
      VALUES ('buyer_kiran', 'Kiran Wholesales', 'kiran.buyer@example.com', '9845012346', ?, 'BUYER', 'ACTIVE', ?, ?)
    `).run(hash, nowB, nowB);

    db.prepare(`
      INSERT INTO buyer_profiles (id, user_id, business_name, buyer_type, delivery_address, gst_number, created_at, updated_at)
      VALUES ('prof_buyer_kiran', 'buyer_kiran', 'Kiran Wholesales Mandya', 'Wholesaler', 'Shop #12, APMC Market Yard, Maddur Road, Mandya, Karnataka - 571401', '29ABCDE1234F1Z5', ?, ?)
    `).run(nowB, nowB);
    buyerUser = { id: 'buyer_kiran' };
  }

  let farmerUser = db.prepare("SELECT id FROM users WHERE id = 'farmer_ramesh' OR email = 'ramesh.farmer@example.com' OR phone = '9845012345'").get();
  if (!farmerUser) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('FarmerPassword123', 8);
    const nowF = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
      VALUES ('farmer_ramesh', 'Ramesh Patil', 'ramesh.farmer@example.com', '9845012345', ?, 'FARMER', 'ACTIVE', ?, ?)
    `).run(hash, nowF, nowF);

    db.prepare(`
      INSERT INTO farmer_profiles (id, user_id, state, district, village, land_size_acres, soil_type, primary_crops, experience_years, preferred_language, created_at, updated_at)
      VALUES ('prof_farmer_ramesh', 'farmer_ramesh', 'Karnataka', 'Mandya', 'Kyathumgere', 8.5, 'Red Sandy Loam', 'Sugarcane, Paddy', 15, 'kn', ?, ?)
    `).run(nowF, nowF);
    farmerUser = { id: 'farmer_ramesh' };
  }

  // Seed Initial Order & Shipment Tracking Record (Phase 20)
  const existingOrder = db.prepare("SELECT COUNT(*) as count FROM orders WHERE id = 'ord_seed_1'").get();
  if (existingOrder.count === 0) {
    const nowO = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO orders (
        id, order_number, buyer_id, total_amount, shipping_name, shipping_address,
        shipping_phone, payment_method, payment_status, order_status, tracking_note, created_at, updated_at
      )
      VALUES (
        'ord_seed_1', 'FC-ORD-2026-48679', ?, 2550.0, 'Kiran Wholesales',
        'Shop #12, APMC Market Yard, Maddur Road, Mandya, Karnataka - 571401', '9845012346',
        'UPI', 'PAID', 'SHIPPED', 'Dispatched via K-Agri Express', ?, ?
      )
    `).run(buyerUser.id, nowO, nowO);

    db.prepare(`
      INSERT OR IGNORE INTO order_items (id, order_id, item_type, item_id, title, unit_price, quantity, unit, total_price)
      VALUES ('item_seed_1', 'ord_seed_1', 'PRODUCT', 'prod_1', 'Hybrid Paddy Seeds (Sona Masoori)', 850.0, 3, 'bag (10kg)', 2550.0)
    `).run();

    db.prepare(`
      INSERT OR IGNORE INTO payments (id, order_id, user_id, amount, payment_method, payment_status, transaction_ref, created_at)
      VALUES ('pay_seed_1', 'ord_seed_1', ?, 2550.0, 'UPI', 'COMPLETED', 'TXN_FC_SEED_48679', ?)
    `).run(buyerUser.id, nowO);

    const checkpoints = [
      {
        timestamp: '2026-11-05T08:30:00.000Z',
        location: 'Cauvery Agri Input Depot, Mandya',
        title: 'Dispatched from Hub',
        description: 'Consignment packaged, sealed and handed over to K-Agri Express Logistics. Assigned vehicle KA-11-EA-4821.',
      },
      {
        timestamp: '2026-11-05T13:45:00.000Z',
        location: 'Maddur Highway Transit Point',
        title: 'In Transit',
        description: 'Passed automated transit weighbridge checkpoint. On schedule for arrival.',
      },
    ];

    db.prepare(`
      INSERT OR IGNORE INTO shipments (
        id, order_id, tracking_number, courier_partner, vehicle_number, driver_name,
        driver_phone, current_location, status, estimated_delivery, checkpoints_json, created_at
      )
      VALUES (
        'ship_seed_1', 'ord_seed_1', 'FC-TRK-882104-A1', 'K-Agri Express Logistics',
        'KA-11-EA-4821', 'Basavaraj M.', '9844011223', 'Maddur Highway Transit Point',
        'IN_TRANSIT', '2026-11-07', ?, ?
      )
    `).run(JSON.stringify(checkpoints), nowO);
  }

  // Seed Initial Notifications (Phase 21)
  const existingNotif = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
  if (existingNotif.count === 0) {
    const nowN = new Date().toISOString();
    const notifications = [
      ['notif_1', 'farmer_ramesh', 'Mandi Price Alert: Sugarcane Surge', 'Mandya APMC modal rate increased to ₹3,280/Quintal (+₹70). High demand recorded.', 'MANDI', 0, '/mandi/sugarcane', nowN],
      ['notif_2', 'farmer_ramesh', 'Weather Advisory: Clear Skies', 'Next 48 hours show optimal dry weather in Mandya. Perfect window for field spraying.', 'WEATHER', 0, '/weather', nowN],
      ['notif_3', buyerUser.id, 'Order #FC-ORD-2026-48679 In Transit', 'Your agricultural inputs package is en route with driver Basavaraj (KA-11-EA-4821).', 'ORDER', 0, '/orders/FC-ORD-2026-48679', nowN],
    ];

    const insertN = db.prepare(`
      INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, is_read, action_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of notifications) {
      insertN.run(...n);
    }
  }

  // Seed Post Comments (Phase 22)
  const existingComments = db.prepare('SELECT COUNT(*) as count FROM community_comments').get();
  if (existingComments.count === 0) {
    const nowCom = new Date().toISOString();
    db.prepare(`
      INSERT INTO community_comments (id, post_id, user_id, author_name, content, created_at)
      VALUES (
        'com_seed_1', 'post_1', 'farmer_shankar', 'Shankar Gowda',
        'Great tip Ramesh! We also noticed reduced stem borer incidence after trash mulching in our block.', ?
      )
    `).run(nowCom);
  }
}

initSchema();

db.getDb = () => db;

module.exports = db;
