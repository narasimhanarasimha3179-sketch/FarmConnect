// Automated Test Suite for Phase 11 (Crop Assistance), Phase 12 (Soil Health), and Phase 13 (Pest & Disease)
const app = require('../src/app');
const http = require('http');

function invoke(app, { method, url, headers = {}, body = null }) {
  return new Promise((resolve) => {
    const socket = new (require('stream').Duplex)({
      read() {},
      write(chunk, encoding, callback) {
        callback();
      },
    });

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;

    let bodyStr = null;
    if (body) {
      bodyStr = JSON.stringify(body);
    }

    req.headers = {
      'content-type': 'application/json',
      ...(bodyStr ? { 'content-length': Buffer.byteLength(bodyStr).toString() } : {}),
      ...headers,
    };

    const res = new http.ServerResponse(req);
    let responseData = '';

    res.write = function (chunk) {
      if (chunk) responseData += chunk.toString();
      return true;
    };

    res.end = function (chunk) {
      if (chunk) responseData += chunk.toString();
      let parsed = responseData;
      try {
        parsed = JSON.parse(responseData);
      } catch {}
      resolve({ status: res.statusCode, data: parsed, headers: res.getHeaders() });
    };

    app(req, res);

    if (bodyStr) {
      req.push(bodyStr);
    }
    req.push(null);
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 11, 12, 13 (Agri-Science & Knowledge Systems) Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Authenticate Farmer
    let farmerLogin = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { identifier: 'ramesh.farmer@example.com', password: 'NewFarmerPassword456' },
    });
    if (farmerLogin.status !== 200) {
      farmerLogin = await invoke(app, {
        method: 'POST',
        url: '/api/auth/login',
        body: { identifier: 'ramesh.farmer@example.com', password: 'FarmerPassword123' },
      });
    }
    const farmerToken = farmerLogin.data.token || (farmerLogin.data.data && farmerLogin.data.data.token);
    const farmerHeaders = { authorization: `Bearer ${farmerToken}` };

    // --- PHASE 11: CROP & FARMING ASSISTANCE ---
    console.log('\n--- Testing Phase 11: Crop Cultivation Roadmap ---');

    // 1. List Cultivation Guides
    const guidesRes = await invoke(app, {
      method: 'GET',
      url: '/api/crop-assistance/guides',
    });
    assert(guidesRes.status === 200, 'GET /api/crop-assistance/guides returns 200');
    assert(guidesRes.data.data.length >= 2, 'Returns verified crop cultivation guides');

    // 2. Full Guide Details by ID
    const guideDetailRes = await invoke(app, {
      method: 'GET',
      url: '/api/crop-assistance/guides/guide_sugarcane',
    });
    assert(guideDetailRes.status === 200, 'GET /api/crop-assistance/guides/:id returns 200');
    assert(Array.isArray(guideDetailRes.data.data.irrigation_stages), 'Guide includes stage-wise irrigation schedule');
    assert(guideDetailRes.data.data.fertilizer_schedule !== undefined, 'Guide includes split-dose fertilizer timings');

    // 3. Seasonal Farming Calendar
    const calendarRes = await invoke(app, {
      method: 'GET',
      url: '/api/crop-assistance/calendar',
    });
    assert(calendarRes.status === 200, 'GET /api/crop-assistance/calendar returns 200');
    assert(calendarRes.data.data.key_activities.length >= 2, 'Calendar includes seasonal field operations');

    // --- PHASE 12: SOIL HEALTH SYSTEM ---
    console.log('\n--- Testing Phase 12: Soil Health & NPK Calculator ---');

    // 4. View Soil Reports
    const soilRes = await invoke(app, {
      method: 'GET',
      url: '/api/soil/reports',
      headers: farmerHeaders,
    });
    assert(soilRes.status === 200, 'GET /api/soil/reports returns 200');
    assert(soilRes.data.data.length >= 1, 'Farmer retrieves lab soil test cards');

    // 5. Create New Soil Health Test
    const newSoilRes = await invoke(app, {
      method: 'POST',
      url: '/api/soil/reports',
      headers: farmerHeaders,
      body: {
        farm_name: 'South Well Plot',
        ph: 6.5,
        nitrogen_kg_ha: 210,
        phosphorus_kg_ha: 18,
        potassium_kg_ha: 240,
        organic_carbon_percent: 0.58,
        soil_type: 'Clay Loam',
      },
    });
    assert(newSoilRes.status === 201, 'POST /api/soil/reports analyzes and stores test report');
    assert(newSoilRes.data.data.fertility_rating !== undefined, 'Computes fertility rating based on NPK metrics');

    // 6. Precision N-P-K Fertilizer Calculator
    const calcRes = await invoke(app, {
      method: 'POST',
      url: '/api/soil/npk-calculator',
      body: {
        crop_name: 'Paddy',
        acres: 2,
        soil_n: 210,
        soil_p: 18,
        soil_k: 240,
      },
    });
    assert(calcRes.status === 200, 'POST /api/soil/npk-calculator computes fertilizer dosage');
    assert(calcRes.data.commercial_fertilizer_requirement.urea_50kg_bags > 0, 'Recommends exact Urea 50kg bags');
    assert(calcRes.data.commercial_fertilizer_requirement.dap_50kg_bags > 0, 'Recommends exact DAP 50kg bags');

    // --- PHASE 13: PEST & DISEASE ASSISTANCE ---
    console.log('\n--- Testing Phase 13: Pest, Disease & IPM Diagnostics ---');

    // 7. Search Pest & Disease Registry
    const pestRes = await invoke(app, {
      method: 'GET',
      url: '/api/pest-disease?crop_name=Paddy',
    });
    assert(pestRes.status === 200, 'GET /api/pest-disease returns 200');
    assert(pestRes.data.data.length >= 2, 'Returns matching paddy pests and diseases');

    // 8. Pest Details with Biological Controls
    const pestDetailRes = await invoke(app, {
      method: 'GET',
      url: '/api/pest-disease/pest_1',
    });
    assert(pestDetailRes.status === 200, 'GET /api/pest-disease/:id returns 200');
    assert(pestDetailRes.data.data.biological_control.length > 0, 'Profile includes verified biological parasitoid controls');
    assert(pestDetailRes.data.data.chemical_treatment.length > 0, 'Profile specifies CIBRC approved chemical treatments');

    // 9. Symptom-Matching Rule Engine Diagnostic
    const diagRes = await invoke(app, {
      method: 'POST',
      url: '/api/pest-disease/diagnose',
      body: {
        crop_name: 'Paddy',
        observed_symptoms: 'dead heart in central shoot with borer damage',
      },
    });
    assert(diagRes.status === 200, 'POST /api/pest-disease/diagnose runs symptom rule engine');
    assert(diagRes.data.top_diagnosis && diagRes.data.top_diagnosis.name.includes('Stem Borer'), 'Accurately diagnoses Yellow Stem Borer from field symptoms');
    assert(diagRes.data.top_diagnosis.confidence_percentage >= 50, 'Confidence score exceeds 50% threshold');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Phase 11, 12, 13 Tests: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
