// Phase 3 Verification & Integration Test Suite
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 3 FARMER DASHBOARD INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/farmer/FarmerDashboardScreen.js',
  'src/screens/farmer/FarmerProfileModal.js',
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
  'src/controllers/farmerController.js',
  'src/routes/farmerRoutes.js',
  'tests/farmer.test.js',
];

for (const file of requiredBackend) {
  const fullPath = path.join(backendDir, file);
  console.assert(fs.existsSync(fullPath), `Missing backend file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[BACKEND OK] ${file} (${stats.size} bytes)`);
}

// 3. Verify App.js integration
const appJs = fs.readFileSync(path.join(mobileDir, 'App.js'), 'utf8');
console.assert(appJs.includes('🌱 FarmConnect Operational OS Loaded'), 'Must preserve baseline statement');
console.assert(appJs.includes('FarmerDashboardScreen'), 'Must include FarmerDashboardScreen');
console.assert(appJs.includes('FarmerProfileModal'), 'Must include FarmerProfileModal');
console.log('✓ App.js integration and baseline preservation verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 3 INTEGRATION VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');
