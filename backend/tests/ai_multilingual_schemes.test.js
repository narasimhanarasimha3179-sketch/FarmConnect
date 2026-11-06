// Automated Test Suite for Phase 14 (Camera AI), Phase 15/16/17 (AI Assistant & Voice), and Phase 18 (Govt Schemes)
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
  console.log('🧪 Starting Phase 14, 15, 16, 17, 18 (AI, Vision, i18n, Schemes) Tests...\n');
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

    // --- PHASE 14: CAMERA & IMAGE-BASED AGRICULTURAL AI ---
    console.log('\n--- Testing Phase 14: Camera & Vision AI Analysis ---');

    // 1. Analyze Crop Leaf Photo
    const scanRes = await invoke(app, {
      method: 'POST',
      url: '/api/camera-ai/analyze',
      headers: farmerHeaders,
      body: {
        crop_type: 'Paddy (Rice)',
        plant_part: 'LEAF',
        image_url: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17',
        visual_notes: 'spindle shaped lesions with grey center',
      },
    });
    assert(scanRes.status === 200, 'POST /api/camera-ai/analyze analyzes crop leaf photo');
    assert(scanRes.data.diagnosis && scanRes.data.diagnosis.confidence_percentage >= 80, 'Returns confidence score exceeding 80%');
    assert(scanRes.data.diagnosis.biological_remedy.length > 0, 'Includes biological non-chemical remedy');
    assert(scanRes.data.diagnosis.chemical_remedy.length > 0, 'Includes approved chemical fungicide/pesticide dosage');

    // 2. Scan History
    const historyRes = await invoke(app, {
      method: 'GET',
      url: '/api/camera-ai/history',
      headers: farmerHeaders,
    });
    assert(historyRes.status === 200, 'GET /api/camera-ai/history returns scan log');
    assert(historyRes.data.data.length >= 1, 'Previous photo diagnosis saved to history');

    // --- PHASES 15, 16, 17: AI ASSISTANT, MULTILINGUAL & VOICE ---
    console.log('\n--- Testing Phases 15, 16, 17: Multilingual AI Chat & Voice Metadata ---');

    // 3. English Weather Inquiry
    const enChatRes = await invoke(app, {
      method: 'POST',
      url: '/api/ai/chat',
      body: { message: 'Will it rain today in Mandya?', preferred_language: 'en' },
    });
    assert(enChatRes.status === 200, 'POST /api/ai/chat handles English weather inquiry');
    assert(enChatRes.data.intent === 'WEATHER', 'Correctly routes to WEATHER intent');
    assert(enChatRes.data.speech_synthesis && enChatRes.data.speech_synthesis.language_code === 'en-IN', 'Generates voice speech synthesis metadata');

    // 4. Kannada Language Conversation (ಕನ್ನಡ)
    const knChatRes = await invoke(app, {
      method: 'POST',
      url: '/api/ai/chat',
      body: { message: 'ಇಂದು ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬಿನ ಮಂಡಿ ದರ ಎಷ್ಟು?' },
    });
    assert(knChatRes.status === 200, 'POST /api/ai/chat automatically detects Kannada script');
    assert(knChatRes.data.language === 'kn', 'Detected language is Kannada (kn)');
    assert(/[\u0C80-\u0CFF]/.test(knChatRes.data.reply), 'Responds with authentic Kannada text');

    // 5. Hindi Language Conversation (हिन्दी)
    const hiChatRes = await invoke(app, {
      method: 'POST',
      url: '/api/ai/chat',
      body: { message: 'धान में खाद की मात्रा कितनी देनी चाहिए?' },
    });
    assert(hiChatRes.status === 200, 'POST /api/ai/chat automatically detects Devanagari Hindi');
    assert(hiChatRes.data.language === 'hi', 'Detected language is Hindi (hi)');
    assert(/[\u0900-\u097F]/.test(hiChatRes.data.reply), 'Responds with authentic Hindi script');

    // 6. Suggested Prompts
    const promptsRes = await invoke(app, {
      method: 'GET',
      url: '/api/ai/suggested-prompts?lang=kn',
    });
    assert(promptsRes.status === 200, 'GET /api/ai/suggested-prompts returns localized prompts');
    assert(promptsRes.data.prompts.length >= 4, 'Provides quick one-tap prompts');

    // --- PHASE 18: GOVERNMENT AGRICULTURAL SCHEMES ---
    console.log('\n--- Testing Phase 18: Government Agricultural Schemes ---');

    // 7. List Schemes
    const schemesRes = await invoke(app, {
      method: 'GET',
      url: '/api/schemes',
    });
    assert(schemesRes.status === 200, 'GET /api/schemes returns 200');
    assert(schemesRes.data.data.length >= 4, 'Returns Central and Karnataka welfare schemes');
    const hasPmkisan = schemesRes.data.data.some((s) => s.id === 'sch_pmkisan');
    const hasRaithaSiri = schemesRes.data.data.some((s) => s.id === 'sch_raitha_siri');
    assert(hasPmkisan && hasRaithaSiri, 'Includes PM-KISAN (Central) and Raitha Siri (Karnataka)');

    // 8. Single Scheme Details
    const pmkisanRes = await invoke(app, {
      method: 'GET',
      url: '/api/schemes/sch_pmkisan',
    });
    assert(pmkisanRes.status === 200, 'GET /api/schemes/:id returns scheme details');
    assert(pmkisanRes.data.data.benefits.includes('₹6,000'), 'Lists direct financial benefit details');
    assert(pmkisanRes.data.data.application_url.startsWith('https://'), 'Provides direct government portal application link');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Phase 14-18 Tests: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
