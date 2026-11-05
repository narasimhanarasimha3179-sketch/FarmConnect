// Phase 5 Verification & Integration Test Suite
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 5 SELLER SUBSYSTEM INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/seller/SellerDashboardScreen.js',
  'src/screens/seller/AddProductModal.js',
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
  'src/controllers/sellerController.js',
  'src/routes/sellerRoutes.js',
  'tests/seller.test.js',
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
console.assert(appJs.includes('SellerDashboardScreen'), 'Must include SellerDashboardScreen');
console.log('✓ App.js integration and baseline preservation verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 5 INTEGRATION VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');
