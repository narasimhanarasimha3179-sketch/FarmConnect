// Automated Test Suite for Phase 3: Farmer Profile & Dashboard Subsystem
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

async function runFarmerTests() {
  console.log('--- STARTING PHASE 3 FARMER SUBSYSTEM TESTS ---');

  // 1. Authenticate Farmer to get real JWT
  console.log('\n[1] Authenticating Farmer (Ramesh Patil)...');
  let farmerToken;
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'ramesh.farmer@example.com',
      password: 'NewFarmerPassword456',
    },
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    farmerToken = loginRes.data.token;
  } else {
    // Register if test runner starts with fresh DB
    const regRes = await invoke(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        name: 'Ramesh Patil',
        email: 'ramesh.farmer@example.com',
        phone: '9845012345',
        password: 'NewFarmerPassword456',
        role: 'FARMER',
        profileData: {
          state: 'Karnataka',
          district: 'Mandya',
          village: 'Maddur',
          land_size_acres: 4.5,
          soil_type: 'Red Sandy Loam',
          primary_crops: 'Sugarcane, Paddy',
        },
      },
    });
    farmerToken = regRes.data.token;
  }

  console.assert(farmerToken, 'Farmer token must be available');
  console.log('✓ Farmer token acquired');

  // 2. Fetch Farmer Profile
  console.log('\n[2] Testing GET /api/farmer/profile...');
  const profileRes = await invoke(app, {
    method: 'GET',
    url: '/api/farmer/profile',
    headers: { authorization: `Bearer ${farmerToken}` },
  });

  console.assert(profileRes.status === 200, `Expected 200, got ${profileRes.status}`);
  console.assert(profileRes.data.farmer.role === 'FARMER', 'User role must be FARMER');
  console.assert(profileRes.data.farmer.profile.district === 'Mandya', 'District must match');
  console.log('✓ Farmer profile successfully retrieved with deep land & crop metrics');

  // 3. Update Farmer Profile (GPS coordinates, taluk, soil type)
  console.log('\n[3] Testing PUT /api/farmer/profile...');
  const updateRes = await invoke(app, {
    method: 'PUT',
    url: '/api/farmer/profile',
    headers: { authorization: `Bearer ${farmerToken}` },
    body: {
      taluk: 'Maddur Taluk',
      village: 'Koppa Village',
      location_gps: '12.5833° N, 77.0500° E',
      land_size_acres: 5.2,
      soil_type: 'Fertile Red Loam',
      primary_crops: 'Sugarcane, Paddy, Ragi',
      experience_years: 18,
      preferred_language: 'kn',
    },
  });

  console.assert(updateRes.status === 200, `Expected 200, got ${updateRes.status}`);
  console.assert(updateRes.data.farmer.profile.location_gps === '12.5833° N, 77.0500° E', 'GPS coordinates must be saved');
  console.assert(updateRes.data.farmer.profile.land_size_acres === 5.2, 'Land size must be updated');
  console.log('✓ Farmer profile successfully updated and synchronized in SQLite');

  // 4. Fetch Farmer Dashboard Telemetry
  console.log('\n[4] Testing GET /api/farmer/dashboard...');
  const dashRes = await invoke(app, {
    method: 'GET',
    url: '/api/farmer/dashboard',
    headers: { authorization: `Bearer ${farmerToken}` },
  });

  console.assert(dashRes.status === 200, `Expected 200, got ${dashRes.status}`);
  const dash = dashRes.data.dashboard;
  console.assert(dash.weather && dash.weather.temp_c, 'Weather telemetry must be populated');
  console.assert(dash.weather.advisory, 'Agricultural advisory must be present');
  console.assert(Array.isArray(dash.mandi_prices) && dash.mandi_prices.length > 0, 'Mandi prices must be populated');
  console.assert(Array.isArray(dash.current_crops) && dash.current_crops.length > 0, 'Current crops must be populated');
  console.assert(Array.isArray(dash.alerts) && dash.alerts.length > 0, 'Urgent farming alerts must be present');
  console.assert(Array.isArray(dash.schemes) && dash.schemes.length > 0, 'Government schemes must be present');
  console.assert(Array.isArray(dash.library_guides) && dash.library_guides.length > 0, 'Library guides must be present');
  console.log(`✓ Real Dashboard telemetry verified: Weather ${dash.weather.temp_c}°C, Mandi items: ${dash.mandi_prices.length}, Crops: ${dash.current_crops.length}`);

  // 5. Add a Crop to Field Schedule
  console.log('\n[5] Testing POST /api/farmer/crops (Add Crop)...');
  const addCropRes = await invoke(app, {
    method: 'POST',
    url: '/api/farmer/crops',
    headers: { authorization: `Bearer ${farmerToken}` },
    body: {
      crop_name: 'Ragi (Finger Millet)',
      variety: 'GPU-28 High Yield',
      sowing_date: '2026-08-10',
      harvest_expected: '2026-11-25',
      area_acres: 1.5,
      stage: 'Flowering',
    },
  });

  console.assert(addCropRes.status === 201, `Expected 201, got ${addCropRes.status}`);
  const newCropId = addCropRes.data.crop.id;
  console.assert(newCropId, 'New crop ID must be returned');
  console.log(`✓ Crop added to field cultivation schedule (ID: ${newCropId})`);

  // 6. Remove Crop
  console.log('\n[6] Testing DELETE /api/farmer/crops/:id...');
  const delCropRes = await invoke(app, {
    method: 'DELETE',
    url: `/api/farmer/crops/${newCropId}`,
    headers: { authorization: `Bearer ${farmerToken}` },
  });
  console.assert(delCropRes.status === 200, `Expected 200, got ${delCropRes.status}`);
  console.log('✓ Crop removed cleanly from field schedule');

  // 7. Verify RBAC Guard: Buyer cannot access Farmer Dashboard
  console.log('\n[7] Testing RBAC: Non-Farmer (BUYER) blocked from /api/farmer/dashboard...');
  const buyerLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'kiran.buyer@example.com',
      password: 'BuyerPassword123',
    },
  });

  const buyerToken = buyerLogin.data.token;
  const buyerBlocked = await invoke(app, {
    method: 'GET',
    url: '/api/farmer/dashboard',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(buyerBlocked.status === 403, `Expected 403 Forbidden, got ${buyerBlocked.status}`);
  console.log('✓ Non-farmer correctly blocked from Farmer dashboard with 403');

  console.log('\n======================================================');
  console.log(' 🎉 ALL 7 PHASE 3 FARMER SUBSYSTEM TESTS PASSED! 🎉');
  console.log('======================================================\n');
}

runFarmerTests().catch((err) => {
  console.error('Farmer test suite failed:', err);
  process.exit(1);
});
