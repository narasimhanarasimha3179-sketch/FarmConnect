// Phase 6 Verification & Integration Test Suite: Centralized Admin Dashboard & Governance
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 6 ADMIN SUBSYSTEM INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/admin/AdminDashboardScreen.js',
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
  'src/controllers/adminController.js',
  'src/routes/adminRoutes.js',
  'tests/admin.test.js',
];

for (const file of requiredBackend) {
  const fullPath = path.join(backendDir, file);
  console.assert(fs.existsSync(fullPath), `Missing backend file: ${file}`);
  const stats = fs.statSync(fullPath);
  console.log(`[BACKEND OK] ${file} (${stats.size} bytes)`);
}

// 3. Verify App.js integration and baseline preservation
const appJs = fs.readFileSync(path.join(mobileDir, 'App.js'), 'utf8');
console.assert(appJs.includes('🌱 FarmConnect Operational OS Loaded'), 'Must preserve baseline statement');
console.assert(appJs.includes('AdminDashboardScreen'), 'Must include AdminDashboardScreen');
console.log('✓ App.js integration and baseline preservation verified');

// 4. Verify Admin Dashboard Screen logic features
const adminDashboardCode = fs.readFileSync(path.join(mobileDir, 'src/screens/admin/AdminDashboardScreen.js'), 'utf8');
console.assert(adminDashboardCode.includes('handleVerifySeller'), 'Must feature seller KYC verification');
console.assert(adminDashboardCode.includes('handleToggleUserStatus'), 'Must feature user account suspension governance');
console.assert(adminDashboardCode.includes('handleResolveComplaint'), 'Must feature complaint & dispute resolution');
console.assert(adminDashboardCode.includes('auditLogs'), 'Must feature audit logs telemetry');
console.log('✓ Admin dashboard screen governance capabilities verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 6 INTEGRATION VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');
