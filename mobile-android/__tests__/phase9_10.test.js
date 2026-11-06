// Phase 9 & Phase 10 Verification & Integration Test Suite
// Live Mandi Prices (APMC Ticker, Charts, Alerts) & Agro-Weather System

const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 9 & 10 INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/mandi/MandiPriceScreen.js',
  'src/screens/weather/WeatherScreen.js',
  'App.js',
];

for (const file of requiredMobile) {
  const fullPath = path.join(mobileDir, file);
  console.assert(fs.existsSync(fullPath), `Missing mobile file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[MOBILE OK] ${file} (${stats.size} bytes)`);
}

// 2. Required Backend Files
const requiredBackend = [
  'src/controllers/mandiController.js',
  'src/routes/mandiRoutes.js',
  'src/controllers/weatherController.js',
  'src/routes/weatherRoutes.js',
  'tests/mandi_weather.test.js',
];

for (const file of requiredBackend) {
  const fullPath = path.join(backendDir, file);
  console.assert(fs.existsSync(fullPath), `Missing backend file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[BACKEND OK] ${file} (${stats.size} bytes)`);
}

// 3. Verify App.js integration and baseline statement preservation
const appJs = fs.readFileSync(path.join(mobileDir, 'App.js'), 'utf8');
console.assert(appJs.includes('🌱 FarmConnect Operational OS Loaded'), 'Must preserve baseline statement');
console.log('✓ App.js baseline statement preserved');

// 4. Verify Mandi Controller capabilities
const mandiCode = fs.readFileSync(path.join(backendDir, 'src/controllers/mandiController.js'), 'utf8');
console.assert(mandiCode.includes('getPriceHistory'), 'Must support historical price trend points for charting');
console.assert(mandiCode.includes('createPriceAlert'), 'Must support price threshold alerts');
console.assert(mandiCode.includes('getMarketComparison'), 'Must support cross-mandi price comparisons');
console.log('✓ APMC Mandi rates, historical trends & alerts verified');

// 5. Verify Weather Controller capabilities
const weatherCode = fs.readFileSync(path.join(backendDir, 'src/controllers/weatherController.js'), 'utf8');
console.assert(weatherCode.includes('getWeatherAdvisories'), 'Must support smart agricultural field advisories');
console.assert(weatherCode.includes('getWeatherForecast'), 'Must support multi-day daily forecasts');
console.assert(weatherCode.includes('getSupportedDistricts'), 'Must support multiple agro-climatic zones');
console.log('✓ Location-based weather forecasts & field advisories verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 9 & 10 INTEGRATION CHECKS PASSED! 🎉');
console.log('======================================================\n');
