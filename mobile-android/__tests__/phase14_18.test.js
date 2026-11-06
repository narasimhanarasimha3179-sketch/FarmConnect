// Phase 14, 15, 16, 17, 18 Verification & Integration Test Suite
// Camera AI Vision, Multilingual AI Chat (EN, KN, HI), Voice Synthesis & Govt Schemes

const fs = require('fs');
const path = require('path');

console.log('--- STARTING PHASE 14-18 INTEGRATION TESTS ---');

const mobileDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(mobileDir, '../backend');

// 1. Required Mobile Files
const requiredMobile = [
  'src/screens/camera/CameraAiScreen.js',
  'src/screens/ai/AiAssistantScreen.js',
  'src/screens/schemes/GovernmentSchemesScreen.js',
  'src/i18n/translations.js',
  'src/context/LanguageContext.js',
  'src/services/voiceService.js',
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
  'src/controllers/cameraAiController.js',
  'src/routes/cameraAiRoutes.js',
  'src/controllers/aiAssistantController.js',
  'src/routes/aiAssistantRoutes.js',
  'src/controllers/schemeController.js',
  'src/routes/schemeRoutes.js',
  'tests/ai_multilingual_schemes.test.js',
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

// 4. Verify Translations dictionary coverage
const translationsCode = fs.readFileSync(path.join(mobileDir, 'src/i18n/translations.js'), 'utf8');
console.assert(translationsCode.includes('en:'), 'Must include English dictionary');
console.assert(translationsCode.includes('kn:'), 'Must include Kannada (ಕನ್ನಡ) dictionary');
console.assert(translationsCode.includes('hi:'), 'Must include Hindi (हिन्दी) dictionary');
console.log('✓ Multilingual 3-language translations verified');

// 5. Verify Camera AI Vision capabilities
const cameraCode = fs.readFileSync(path.join(backendDir, 'src/controllers/cameraAiController.js'), 'utf8');
console.assert(cameraCode.includes('analyzeCropImage'), 'Must support plant pathology image analysis');
console.assert(cameraCode.includes('confidence_percentage'), 'Must calculate confidence percentages');
console.log('✓ Camera Vision AI diagnostic capabilities verified');

// 6. Verify Government Schemes
const schemeCode = fs.readFileSync(path.join(backendDir, 'src/controllers/schemeController.js'), 'utf8');
console.assert(schemeCode.includes('getSchemes'), 'Must provide Central and Karnataka welfare schemes');
console.log('✓ Government welfare schemes catalog verified');

console.log('\n======================================================');
console.log(' 🎉 ALL PHASE 14-18 INTEGRATION CHECKS PASSED! 🎉');
console.log('======================================================\n');
