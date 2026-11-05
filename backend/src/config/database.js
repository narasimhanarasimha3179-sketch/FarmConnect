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
}

initSchema();

module.exports = db;
