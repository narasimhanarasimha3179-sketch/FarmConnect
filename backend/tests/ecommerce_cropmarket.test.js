// Automated Test Suite for Phase 7 (Agri E-Commerce) & Phase 8 (Crop Marketplace)
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
  console.log('🧪 Starting Phase 7 (E-Commerce) & Phase 8 (Crop Marketplace) Tests...\n');
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
    // 1. Authenticate Farmer & Buyer
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
    assert(farmerToken !== undefined, 'Farmer acquired valid token');
    const farmerHeaders = { authorization: `Bearer ${farmerToken}` };

    const buyerLogin = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { identifier: 'kiran.buyer@example.com', password: 'BuyerPassword123' },
    });
    const buyerToken = buyerLogin.data.token || (buyerLogin.data.data && buyerLogin.data.data.token);
    assert(buyerToken !== undefined, 'Buyer acquired valid token');
    const buyerHeaders = { authorization: `Bearer ${buyerToken}` };

    // --- PHASE 7: AGRICULTURAL E-COMMERCE TESTS ---
    console.log('\n--- Testing Phase 7: Agricultural E-Commerce ---');

    // 2. Categories
    const catRes = await invoke(app, { method: 'GET', url: '/api/ecommerce/categories' });
    assert(catRes.status === 200, 'GET /api/ecommerce/categories returns 200');
    assert(catRes.data.data.length === 10, 'All 10 verified agricultural categories returned');
    const hasSeeds = catRes.data.data.some((c) => c.key === 'SEEDS');
    const hasBioFert = catRes.data.data.some((c) => c.key === 'BIO_FERTILIZERS');
    const hasIrrigation = catRes.data.data.some((c) => c.key === 'IRRIGATION_PRODUCTS');
    assert(hasSeeds && hasBioFert && hasIrrigation, 'Categories include Seeds, Bio-Fertilizers & Irrigation');

    // 3. Products Catalog with Filters
    const prodRes = await invoke(app, {
      method: 'GET',
      url: '/api/ecommerce/products?category=SEEDS&sort=price_asc',
    });
    assert(prodRes.status === 200, 'GET /api/ecommerce/products returns 200');
    assert(prodRes.data.data.length >= 2, 'Category filter returns matching seed products');

    // 4. Product Search
    const searchRes = await invoke(app, {
      method: 'GET',
      url: '/api/ecommerce/products?search=Neem',
    });
    assert(searchRes.status === 200, 'Product search returns 200');
    assert(searchRes.data.data.length >= 1, 'Search query "Neem" returned relevant products');

    // 5. Product Detail View
    const targetProduct = prodRes.data.data[0];
    const detailRes = await invoke(app, {
      method: 'GET',
      url: `/api/ecommerce/products/${targetProduct.id}`,
    });
    assert(detailRes.status === 200, 'GET /api/ecommerce/products/:id returns 200');
    assert(detailRes.data.data.id === targetProduct.id, 'Product details match requested ID');
    assert(Array.isArray(detailRes.data.data.related), 'Product returns related recommendations');

    // 6. Submit Customer Review
    const reviewRes = await invoke(app, {
      method: 'POST',
      url: '/api/ecommerce/reviews',
      headers: buyerHeaders,
      body: {
        product_id: targetProduct.id,
        rating: 5,
        comment: 'Excellent germination rate and sturdy crop tillers in canal fields.',
      },
    });
    assert(reviewRes.status === 201, 'POST /api/ecommerce/reviews adds verified customer review');

    // --- PHASE 8: CROP MARKETPLACE TESTS ---
    console.log('\n--- Testing Phase 8: Crop Marketplace ---');

    // 7. Browse Crop Listings
    const cropListRes = await invoke(app, {
      method: 'GET',
      url: '/api/crop-market/listings?status=AVAILABLE',
    });
    assert(cropListRes.status === 200, 'GET /api/crop-market/listings returns 200');
    assert(cropListRes.data.data.length >= 3, 'Marketplace lists active farmer crop harvests');

    // 8. Farmer Creates New Harvest Listing
    const newCropRes = await invoke(app, {
      method: 'POST',
      url: '/api/crop-market/listings',
      headers: farmerHeaders,
      body: {
        crop_name: 'Mysuru Mallige Jasmine',
        variety: 'GI Tag Traditional',
        quantity_available: 25,
        unit: 'kg',
        expected_price: 650,
        mandi_location: 'Mysuru Devaraja Market',
        quality_grade: 'Grade A',
        harvest_date: '2026-11-28',
        description: 'Authentic fragrant flower harvest with GI tag certification.',
      },
    });
    if (newCropRes.status !== 201) {
      console.log('DEBUG newCropRes:', newCropRes.status, newCropRes.data);
    }
    assert(newCropRes.status === 201, 'POST /api/crop-market/listings farmer creates harvest batch');
    const createdCropId = newCropRes.data.data ? newCropRes.data.data.id : null;

    // 9. Farmer Updates Listing
    const updateCropRes = await invoke(app, {
      method: 'PUT',
      url: `/api/crop-market/listings/${createdCropId}`,
      headers: farmerHeaders,
      body: {
        expected_price: 680,
        quantity_available: 30,
      },
    });
    assert(updateCropRes.status === 200, 'PUT /api/crop-market/listings/:id updates price and quantity');

    // 10. Buyer Submits Negotiation Enquiry
    const enquiryRes = await invoke(app, {
      method: 'POST',
      url: '/api/crop-market/enquiries',
      headers: buyerHeaders,
      body: {
        crop_id: createdCropId,
        offered_price: 660,
        quantity_requested: 20,
        unit: 'kg',
        message: 'Looking for weekly consignment for wedding event garland decorators.',
      },
    });
    assert(enquiryRes.status === 201, 'POST /api/crop-market/enquiries buyer submits purchase bid');
    const enquiryId = enquiryRes.data.data ? enquiryRes.data.data.id : null;

    // 11. Farmer Retrieves Enquiries
    const farmerEnqRes = await invoke(app, {
      method: 'GET',
      url: '/api/crop-market/farmer/enquiries',
      headers: farmerHeaders,
    });
    assert(farmerEnqRes.status === 200, 'GET /api/crop-market/farmer/enquiries farmer retrieves bids');
    const receivedEnq = farmerEnqRes.data.data.find((e) => e.id === enquiryId);
    assert(receivedEnq !== undefined, 'Farmer enquiry queue contains the buyer bid');

    // 12. Farmer Accepts Buyer Offer
    const acceptRes = await invoke(app, {
      method: 'PUT',
      url: `/api/crop-market/enquiries/${enquiryId}/status`,
      headers: farmerHeaders,
      body: { status: 'ACCEPTED' },
    });
    assert(acceptRes.status === 200, 'PUT /api/crop-market/enquiries/:id/status farmer accepts offer');

    // 13. Farmer Cleans Up Listing
    const delCropRes = await invoke(app, {
      method: 'DELETE',
      url: `/api/crop-market/listings/${createdCropId}`,
      headers: farmerHeaders,
    });
    assert(delCropRes.status === 200, 'DELETE /api/crop-market/listings/:id farmer removes listing');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Phase 7 & 8 Tests: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
