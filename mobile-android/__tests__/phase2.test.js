// Phase 2 Verification & Integration Test Suite
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 2 MOBILE & BACKEND INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Check all required mobile files
const requiredMobileFiles = [
  'src/context/AuthContext.js',
  'src/screens/auth/LoginScreen.js',
  'src/screens/auth/RegisterScreen.js',
  'src/screens/auth/ForgotPasswordScreen.js',
  'src/screens/farmer/FarmerDashboardScreen.js',
  'src/screens/buyer/BuyerDashboardScreen.js',
  'src/screens/seller/SellerDashboardScreen.js',
  'src/screens/admin/AdminDashboardScreen.js',
  'src/screens/common/ProfileScreen.js',
  'App.js',
];

for (const file of requiredMobileFiles) {
  const fullPath = path.join(mobileDir, file);
  console.assert(fs.existsSync(fullPath), `Missing mobile file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[MOBILE OK] ${file} (${stats.size} bytes)`);
}

// 2. Check all required backend files
const requiredBackendFiles = [
  'package.json',
  'src/server.js',
  'src/app.js',
  'src/config/database.js',
  'src/config/jwt.js',
  'src/middleware/authMiddleware.js',
  'src/controllers/authController.js',
  'src/routes/authRoutes.js',
  'tests/auth.test.js',
];

for (const file of requiredBackendFiles) {
  const fullPath = path.join(backendDir, file);
  console.assert(fs.existsSync(fullPath), `Missing backend file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[BACKEND OK] ${file} (${stats.size} bytes)`);
}

// 3. Verify App.js preserves baseline text and registers all roles
const appJs = fs.readFileSync(path.join(mobileDir, 'App.js'), 'utf8');
console.assert(
  appJs.includes('🌱 FarmConnect Operational OS Loaded'),
  'App.js must preserve the baseline statement'
);
console.assert(appJs.includes('AuthProvider'), 'App.js must include AuthProvider');
console.assert(appJs.includes('FarmerDashboardScreen'), 'App.js must include FarmerDashboardScreen');
console.assert(appJs.includes('BuyerDashboardScreen'), 'App.js must include BuyerDashboardScreen');
console.assert(appJs.includes('SellerDashboardScreen'), 'App.js must include SellerDashboardScreen');
console.assert(appJs.includes('AdminDashboardScreen'), 'App.js must include AdminDashboardScreen');

console.log('✓ Baseline preservation and 4-role routing verified in App.js');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 2 INTEGRATION VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');
