// Verification test for Phase 1 modules
const fs = require('fs');
const path = require('path');

console.log('--- Verifying Phase 1 Files Exist ---');
const baseDir = path.resolve(__dirname, '..');
const requiredFiles = [
  'src/config/env.js',
  'src/theme/colors.js',
  'src/theme/typography.js',
  'src/theme/spacing.js',
  'src/theme/index.js',
  'src/services/logger.js',
  'src/services/apiClient.js',
  'src/utils/validation.js',
  'src/context/NotificationContext.js',
  'src/components/common/Button.js',
  'src/components/common/Input.js',
  'src/components/common/Card.js',
  'src/components/common/LoadingIndicator.js',
  'src/components/common/EmptyState.js',
  'src/components/common/Badge.js',
  'src/components/common/Header.js',
  'src/components/common/index.js',
  'App.js',
];

let allExist = true;
for (const file of requiredFiles) {
  const fullPath = path.join(baseDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING: ${file}`);
    allExist = false;
  } else {
    const stats = fs.statSync(fullPath);
    console.log(`[OK] ${file} (${stats.size} bytes)`);
  }
}

if (!allExist) {
  process.exit(1);
}

console.log('--- Checking Code Content of App.js ---');
const appContent = fs.readFileSync(path.join(baseDir, 'App.js'), 'utf8');
const baselineTextPreserved = appContent.includes('🌱 FarmConnect Operational OS Loaded');
console.log('Baseline statement preserved:', baselineTextPreserved);
if (!baselineTextPreserved) {
  console.error('ERROR: Baseline text was not preserved!');
  process.exit(1);
}

console.log('--- All Phase 1 Verification Checks Passed ---');
