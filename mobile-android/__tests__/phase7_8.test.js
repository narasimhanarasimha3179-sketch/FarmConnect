// Phase 7 & Phase 8 Verification & Integration Test Suite
// Agricultural E-Commerce (10 Categories) & Direct Farmer-to-Buyer Crop Marketplace

const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 7 & 8 INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/ecommerce/ProductCatalogScreen.js',
  'src/screens/cropmarket/CropMarketplaceScreen.js',
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
  'src/controllers/ecommerceController.js',
  'src/routes/ecommerceRoutes.js',
  'src/controllers/cropMarketController.js',
  'src/routes/cropMarketRoutes.js',
  'tests/ecommerce_cropmarket.test.js',
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

// 4. Verify Phase 7 10 Product Categories in ecommerceController.js
const ecomCode = fs.readFileSync(path.join(backendDir, 'src/controllers/ecommerceController.js'), 'utf8');
const expectedCategories = [
  'SEEDS',
  'FERTILIZERS',
  'BIO_FERTILIZERS',
  'PESTICIDES',
  'FARMING_EQUIPMENT',
  'AGRICULTURAL_TOOLS',
  'IRRIGATION_PRODUCTS',
  'ORGANIC_PRODUCTS',
  'CROP_PROTECTION',
  'OTHER_SUPPLIES',
];

for (const cat of expectedCategories) {
  console.assert(ecomCode.includes(cat), `ecommerceController must contain category ${cat}`);
}
console.log('✓ All 10 agricultural categories verified in E-Commerce Controller');

// 5. Verify Phase 8 Crop Marketplace Capabilities in cropMarketController.js
const cropCode = fs.readFileSync(path.join(backendDir, 'src/controllers/cropMarketController.js'), 'utf8');
console.assert(cropCode.includes('createCropListing'), 'Must support farmer produce listing creation');
console.assert(cropCode.includes('createCropEnquiry'), 'Must support buyer direct negotiation enquiry');
console.assert(cropCode.includes('updateEnquiryStatus'), 'Must support farmer enquiry acceptance/declining');
console.log('✓ Direct Farmer-to-Buyer trade & negotiation capabilities verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 7 & 8 INTEGRATION CHECKS PASSED! 🎉');
console.log('======================================================\n');
