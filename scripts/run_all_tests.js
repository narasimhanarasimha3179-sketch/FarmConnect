// FarmConnect Master Regression & Full Phase QA Test Runner (Phases 0 to 32)
const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const testSuites = [
  // Backend Suites
  { name: 'Backend: Phase 2 Authentication & RBAC', cmd: 'node backend/tests/auth.test.js' },
  { name: 'Backend: Phase 3 Farmer Cockpit & Telemetry', cmd: 'node backend/tests/farmer.test.js' },
  { name: 'Backend: Phase 4 Buyer Orders & Cart', cmd: 'node backend/tests/buyer.test.js' },
  { name: 'Backend: Phase 5 Seller Merchant Cockpit', cmd: 'node backend/tests/seller.test.js' },
  { name: 'Backend: Phase 6 Admin Governance & Audit', cmd: 'node backend/tests/admin.test.js' },
  { name: 'Backend: Phase 7 & 8 E-Commerce & Crop Market', cmd: 'node backend/tests/ecommerce_cropmarket.test.js' },
  { name: 'Backend: Phase 9 & 10 Mandi Rates & Weather', cmd: 'node backend/tests/mandi_weather.test.js' },
  { name: 'Backend: Phase 11, 12, 13 Agronomic Science', cmd: 'node backend/tests/agri_science.test.js' },
  { name: 'Backend: Phase 14-18 AI, Vision & Schemes', cmd: 'node backend/tests/ai_multilingual_schemes.test.js' },
  { name: 'Backend: Phase 19-27 Payments, Logistics, Search', cmd: 'node backend/tests/phase19_27_master.test.js' },

  // Mobile Android Suites
  { name: 'Mobile: Phase 1 Foundation & Design Tokens', cmd: 'node mobile-android/__tests__/phase1.test.js' },
  { name: 'Mobile: Phase 2 Auth Screens & Role Routing', cmd: 'node mobile-android/__tests__/phase2.test.js' },
  { name: 'Mobile: Phase 3 Farmer Dashboard & Modal', cmd: 'node mobile-android/__tests__/phase3.test.js' },
  { name: 'Mobile: Phase 4 Buyer Dashboard & Catalog', cmd: 'node mobile-android/__tests__/phase4.test.js' },
  { name: 'Mobile: Phase 5 Seller Dashboard & Inventory', cmd: 'node mobile-android/__tests__/phase5.test.js' },
  { name: 'Mobile: Phase 6 Admin Panel & Governance', cmd: 'node mobile-android/__tests__/phase6.test.js' },
  { name: 'Mobile: Phase 7 & 8 E-Commerce & Crop Market', cmd: 'node mobile-android/__tests__/phase7_8.test.js' },
  { name: 'Mobile: Phase 9 & 10 Mandi Prices & Weather', cmd: 'node mobile-android/__tests__/phase9_10.test.js' },
  { name: 'Mobile: Phase 11-13 Agronomic Science Guides', cmd: 'node mobile-android/__tests__/phase11_13.test.js' },
  { name: 'Mobile: Phase 14-18 AI Assistant & Multilingual', cmd: 'node mobile-android/__tests__/phase14_18.test.js' },
  { name: 'Mobile: Phase 19-28 Logistics, Payments & A11y', cmd: 'node mobile-android/__tests__/phase19_28.test.js' },
];

console.log('🌱 ========================================================');
console.log('   FARMCONNECT MASTER REGRESSION QA RUNNER (PHASES 0-32)    ');
console.log('🌱 ========================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

for (const suite of testSuites) {
  process.stdout.write(`⏳ Running: ${suite.name}... `);
  try {
    execSync(suite.cmd, { cwd: rootDir, stdio: 'pipe' });
    console.log('✅ PASSED');
    totalPassed++;
  } catch (err) {
    console.log('❌ FAILED');
    totalFailed++;
    failures.push({ name: suite.name, output: err.stdout?.toString() || err.stderr?.toString() || err.message });
  }
}

console.log('\n========================================================');
console.log(`TOTAL SUITES EXECUTED: ${testSuites.length}`);
console.log(`SUITES PASSED:         ${totalPassed}`);
console.log(`SUITES FAILED:         ${totalFailed}`);
console.log('========================================================\n');

if (totalFailed > 0) {
  console.error('FAILURES SUMMARY:');
  for (const f of failures) {
    console.error(`\n--- [${f.name}] ---`);
    console.error(f.output);
  }
  process.exit(1);
} else {
  console.log('🎉 ALL 21 MASTER REGRESSION TEST SUITES PASSED FLAWLESSLY WITH 100% SUCCESS!');
  process.exit(0);
}
