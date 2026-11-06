// Automated Test Suite for Phase 9 (Live Mandi Prices) & Phase 10 (Weather System)
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
  console.log('🧪 Starting Phase 9 (Mandi Prices) & Phase 10 (Weather System) Tests...\n');
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

    // --- PHASE 9: MANDI MARKET TELEMETRY ---
    console.log('\n--- Testing Phase 9: Live APMC Mandi Rates & Trends ---');

    // 1. Live Mandi Rates
    const ratesRes = await invoke(app, {
      method: 'GET',
      url: '/api/mandi/rates?district=Mandya',
    });
    assert(ratesRes.status === 200, 'GET /api/mandi/rates returns 200');
    assert(Array.isArray(ratesRes.data.data) && ratesRes.data.data.length >= 1, 'Mandi rates returned for Mandya district');

    // 2. Distinct Commodities
    const commRes = await invoke(app, {
      method: 'GET',
      url: '/api/mandi/commodities',
    });
    assert(commRes.status === 200, 'GET /api/mandi/commodities returns 200');
    assert(commRes.data.data.length >= 3, 'Commodities summary aggregates reporting mandis and average prices');

    // 3. Price History Trend Points
    const histRes = await invoke(app, {
      method: 'GET',
      url: '/api/mandi/history?commodity=Sugarcane',
    });
    assert(histRes.status === 200, 'GET /api/mandi/history returns 200');
    assert(histRes.data.data.length >= 3, 'Returns multiple chronological price history points for chart rendering');
    assert(['UP', 'DOWN', 'STABLE'].includes(histRes.data.overall_trend), 'Calculates market price direction trend');

    // 4. Mandi Price Comparison Across APMCs
    const compRes = await invoke(app, {
      method: 'GET',
      url: '/api/mandi/comparison?commodity=Sugarcane',
    });
    assert(compRes.status === 200, 'GET /api/mandi/comparison returns 200');
    assert(compRes.data.markets_compared >= 1, 'Compares commodity across markets');

    // 5. Create Price Alert
    const alertRes = await invoke(app, {
      method: 'POST',
      url: '/api/mandi/alerts',
      headers: farmerHeaders,
      body: {
        commodity: 'Sugarcane',
        market_mandi: 'Mandya APMC',
        target_price: 3400,
        condition: 'ABOVE',
      },
    });
    assert(alertRes.status === 201, 'POST /api/mandi/alerts activates target price alert');
    const createdAlertId = alertRes.data.data ? alertRes.data.data.id : null;

    // 6. View User Price Alerts
    const userAlertsRes = await invoke(app, {
      method: 'GET',
      url: '/api/mandi/alerts',
      headers: farmerHeaders,
    });
    assert(userAlertsRes.status === 200, 'GET /api/mandi/alerts returns active alerts');
    assert(userAlertsRes.data.data.some((a) => a.id === createdAlertId), 'Alert queue includes newly created alert');

    // 7. Delete Price Alert
    const delAlertRes = await invoke(app, {
      method: 'DELETE',
      url: `/api/mandi/alerts/${createdAlertId}`,
      headers: farmerHeaders,
    });
    assert(delAlertRes.status === 200, 'DELETE /api/mandi/alerts/:id cancels price alert');

    // --- PHASE 10: WEATHER SYSTEM TESTS ---
    console.log('\n--- Testing Phase 10: Agricultural Weather System ---');

    // 8. Current Weather
    const weatherRes = await invoke(app, {
      method: 'GET',
      url: '/api/weather/current?district=Mandya',
    });
    assert(weatherRes.status === 200, 'GET /api/weather/current returns 200');
    assert(weatherRes.data.data.district === 'Mandya', 'Weather matches requested district');
    assert(typeof weatherRes.data.data.temp_c === 'number', 'Reports accurate temperature metric in Celsius');
    assert(typeof weatherRes.data.data.humidity === 'number', 'Reports relative humidity percentage');

    // 9. Weather Forecast
    const forecastRes = await invoke(app, {
      method: 'GET',
      url: '/api/weather/forecast?district=Mandya',
    });
    assert(forecastRes.status === 200, 'GET /api/weather/forecast returns 200');
    assert(Array.isArray(forecastRes.data.forecast) && forecastRes.data.forecast.length >= 4, 'Provides multi-day daily forecast breakdown');

    // 10. Agricultural Advisories
    const advRes = await invoke(app, {
      method: 'GET',
      url: '/api/weather/advisories?district=Mandya',
    });
    assert(advRes.status === 200, 'GET /api/weather/advisories returns 200');
    assert(Array.isArray(advRes.data.advisories) && advRes.data.advisories.length >= 3, 'Generates smart irrigation, pest risk and spraying advisories');
    const irrigationAdv = advRes.data.advisories.find((a) => a.title === 'Irrigation Guidance');
    assert(irrigationAdv !== undefined, 'Irrigation recommendation generated based on rainfall & evapotranspiration');

    // 11. Supported Districts
    const distRes = await invoke(app, {
      method: 'GET',
      url: '/api/weather/districts',
    });
    assert(distRes.status === 200, 'GET /api/weather/districts returns 200');
    assert(distRes.data.data.length >= 3, 'Covers multiple agricultural districts across Karnataka');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Phase 9 & 10 Tests: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
