// FarmConnect Database Initialization & Persistent Relational Store
// Powered by Node.js built-in native SQLite engine (ACID compliant, zero native compile failures)

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'farmconnect.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high-performance concurrent reads
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

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
  `);

  // Safe schema migrations for existing SQLite databases
  try { db.exec('ALTER TABLE farmer_profiles ADD COLUMN taluk TEXT;'); } catch {}
  try { db.exec('ALTER TABLE farmer_profiles ADD COLUMN location_gps TEXT;'); } catch {}

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

  // Seed Verified Marketplace Products (Agri Inputs)
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
}

initSchema();

module.exports = db;
