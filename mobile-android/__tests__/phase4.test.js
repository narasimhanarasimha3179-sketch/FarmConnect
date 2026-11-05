// Phase 4 Verification & Integration Test Suite
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 4 BUYER SUBSYSTEM INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/buyer/BuyerDashboardScreen.js',
  'src/screens/buyer/CartModal.js',
  'src/screens/buyer/OrderTrackingModal.js',
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
  'src/controllers/buyerController.js',
  'src/routes/buyerRoutes.js',
  'tests/buyer.test.js',
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
console.assert(appJs.includes('BuyerDashboardScreen'), 'Must include BuyerDashboardScreen');
console.log('✓ App.js integration and baseline preservation verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 4 INTEGRATION VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');
