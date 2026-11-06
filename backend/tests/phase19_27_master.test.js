// Automated Master Test Suite for Phase 19 to Phase 27
// Payments, Logistics, Notifications, Community, Library, Search, Security & API Documentation
process.env.NODE_ENV = 'test';
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
  console.log('🧪 Starting Master Test Suite (Phases 19 - 27)...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Authenticate Ramesh & Kiran
  let farmerToken = '';
  let buyerToken = '';

  const loginFarmer = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: { identifier: 'ramesh.farmer@example.com', password: 'NewFarmerPassword456' },
  });
  if (loginFarmer.status === 200) {
    farmerToken = loginFarmer.data.token || loginFarmer.data.data.token;
  } else {
    const fallback = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { identifier: 'ramesh.farmer@example.com', password: 'FarmerPassword123' },
    });
    farmerToken = fallback.data.token || fallback.data.data?.token;
  }

  const loginBuyer = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: { identifier: 'kiran.buyer@example.com', password: 'BuyerPassword123' },
  });
  buyerToken = loginBuyer.data.token || loginBuyer.data.data?.token;

  const fAuth = { authorization: `Bearer ${farmerToken}` };
  const bAuth = { authorization: `Bearer ${buyerToken}` };

  // ==========================================
  // PHASE 19: Payments, Invoicing & Receipts
  // ==========================================
  console.log('▶ Testing Phase 19: Payments & Invoicing...');

  // 1.1 Create Payment Intent
  const payIntent = await invoke(app, {
    method: 'POST',
    url: '/api/payments/create-intent',
    headers: bAuth,
    body: { order_id: 'ord_seed_1', amount: 2550.0, payment_method: 'UPI' },
  });
  assert(payIntent.status === 200 && payIntent.data.payment_id, 'Create UPI checkout payment intent');
  assert(payIntent.data.upi_intent_string?.includes('upi://pay'), 'Generated standard UPI intent link');

  // 1.2 Verify Payment
  const payVerify = await invoke(app, {
    method: 'POST',
    url: '/api/payments/verify',
    headers: bAuth,
    body: { payment_id: payIntent.data.payment_id, status: 'SUCCESS' },
  });
  assert(payVerify.status === 200 && payVerify.data.payment_status === 'COMPLETED', 'Verify transaction signature and confirm order');

  // 1.3 Tax Invoice / Payment Receipt
  const receipt = await invoke(app, {
    method: 'GET',
    url: '/api/payments/receipt/ord_seed_1',
    headers: bAuth,
  });
  assert(receipt.status === 200 && receipt.data.receipt?.invoice_number, 'Generate GST compliance tax invoice receipt');
  assert(receipt.data.receipt.platform_gstin === '29AAACF1234A1Z5', 'Tax invoice includes verified platform GSTIN');

  // ==========================================
  // PHASE 20: Logistics & Real-time Tracking
  // ==========================================
  console.log('\n▶ Testing Phase 20: Logistics & Shipment Tracking...');

  // 2.1 Track Shipment by Tracking ID
  const trackRes = await invoke(app, {
    method: 'GET',
    url: '/api/logistics/track/FC-TRK-882104-A1',
  });
  assert(trackRes.status === 200 && trackRes.data.shipment?.driver_name === 'Basavaraj M.', 'Track shipment with driver and vehicle telematics');
  assert(trackRes.data.shipment.progress_stage >= 1 && trackRes.data.shipment.total_stages === 5, 'Calculates 5-stage progression status');

  // 2.2 Update Shipment Status
  const updateShip = await invoke(app, {
    method: 'PUT',
    url: '/api/logistics/update-status',
    headers: bAuth,
    body: {
      tracking_number: 'FC-TRK-882104-A1',
      status: 'OUT_FOR_DELIVERY',
      location: 'Mandya Hub Gate 2',
      notes: 'Out with delivery executive Basavaraj for last-mile drop',
    },
  });
  assert(updateShip.status === 200 && updateShip.data.status === 'OUT_FOR_DELIVERY', 'Update logistics status and append checkpoint');

  // ==========================================
  // PHASE 21: Notifications & Alert System
  // ==========================================
  console.log('\n▶ Testing Phase 21: Notifications & Agronomic Alerts...');

  // 3.1 Fetch Farmer Notifications
  const notifRes = await invoke(app, {
    method: 'GET',
    url: '/api/notifications',
    headers: fAuth,
  });
  assert(notifRes.status === 200 && Array.isArray(notifRes.data.notifications), 'Retrieve user notification inbox');
  assert(notifRes.data.notifications.length >= 2, 'Verified mandi and weather alerts seeded for farmer');

  // 3.2 Dispatch Agronomic Alert
  const alertSend = await invoke(app, {
    method: 'POST',
    url: '/api/notifications/send-alert',
    headers: fAuth,
    body: {
      title: 'Pest Alert: Fall Armyworm',
      message: 'Scattered infestation reported in adjacent taluk. Inspect whorls.',
      type: 'WEATHER',
    },
  });
  assert(alertSend.status === 201 && alertSend.data.notification_id, 'Dispatch custom agronomic alert notification');

  // 3.3 Mark All Read
  const markAll = await invoke(app, {
    method: 'PUT',
    url: '/api/notifications/mark-all-read',
    headers: fAuth,
  });
  assert(markAll.status === 200 && markAll.data.success, 'Mark all notifications read');

  // ==========================================
  // PHASE 22: Agricultural Community Feed
  // ==========================================
  console.log('\n▶ Testing Phase 22: Community & Peer Discussions...');

  // 4.1 Fetch Community Feed
  const feed = await invoke(app, {
    method: 'GET',
    url: '/api/community/posts',
  });
  assert(feed.status === 200 && feed.data.posts?.length >= 2, 'Browse community farming discussion feed');

  // 4.2 Create New Community Post
  const createPost = await invoke(app, {
    method: 'POST',
    url: '/api/community/posts',
    headers: fAuth,
    body: {
      title: 'Neem Cake Efficacy on Sugarcane Grubs',
      content: 'Applied 250kg neem cake per acre at planting. Soil grub count dropped remarkably.',
    },
  });
  assert(createPost.status === 201 && createPost.data.post_id, 'Publish farming observation post');

  // 4.3 Like Post
  const likePost = await invoke(app, {
    method: 'POST',
    url: `/api/community/posts/${createPost.data.post_id}/like`,
    headers: bAuth,
  });
  assert(likePost.status === 200 && likePost.data.likes_count === 1, 'Like/upvote community post');

  // 4.4 Add Comment
  const addComment = await invoke(app, {
    method: 'POST',
    url: `/api/community/posts/${createPost.data.post_id}/comment`,
    headers: bAuth,
    body: { content: 'Very insightful! Did you incorporate it before or after furrow formation?' },
  });
  assert(addComment.status === 201 && addComment.data.comment_id, 'Add peer comment to discussion post');

  // ==========================================
  // PHASE 23: Agricultural Digital Library
  // ==========================================
  console.log('\n▶ Testing Phase 23: Digital Knowledge Library...');

  // 5.1 Fetch Articles
  const articles = await invoke(app, {
    method: 'GET',
    url: '/api/library/articles',
  });
  assert(articles.status === 200 && articles.data.articles?.length >= 2, 'Retrieve digital library articles');

  // 5.2 Filter by Category
  const catArticles = await invoke(app, {
    method: 'GET',
    url: '/api/library/articles?category=IRRIGATION',
  });
  assert(catArticles.status === 200 && catArticles.data.articles[0]?.category === 'IRRIGATION', 'Filter articles by agronomic category (IRRIGATION)');

  // 5.3 Fetch Categories
  const categories = await invoke(app, {
    method: 'GET',
    url: '/api/library/categories',
  });
  assert(categories.status === 200 && categories.data.categories?.length >= 2, 'Retrieve article categories and counts');

  // ==========================================
  // PHASE 24: Universal Global Search
  // ==========================================
  console.log('\n▶ Testing Phase 24: Universal Multi-Domain Search...');

  // 6.1 Multi-domain query for "Sugarcane"
  const searchCane = await invoke(app, {
    method: 'GET',
    url: '/api/search?q=Sugarcane',
  });
  assert(searchCane.status === 200 && searchCane.data.total_matches > 0, 'Execute universal multi-domain search');
  assert(searchCane.data.items.some((it) => it.domain === 'MANDI'), 'Search found matching APMC Mandi rates');
  assert(searchCane.data.items.some((it) => it.domain === 'GUIDE'), 'Search found matching Crop Cultivation Guides');

  // ==========================================
  // PHASE 25 & 26 & 27: Security & Documentation
  // ==========================================
  console.log('\n▶ Testing Phase 25, 26, 27: Security, Headers & OpenAPI...');

  // 7.1 Security Headers
  const healthCheck = await invoke(app, { method: 'GET', url: '/api/health' });
  assert(healthCheck.headers['x-frame-options'] === 'DENY', 'Security Header: X-Frame-Options is DENY');
  assert(healthCheck.headers['x-content-type-options'] === 'nosniff', 'Security Header: X-Content-Type-Options is nosniff');
  assert(healthCheck.headers['x-ratelimit-limit'] !== undefined, 'Rate Limiter Header: X-RateLimit-Limit active');

  // 7.2 OpenAPI Documentation
  const docsRes = await invoke(app, { method: 'GET', url: '/api/docs' });
  assert(docsRes.status === 200 && docsRes.data.documentation?.openapi === '3.0.3', 'OpenAPI 3.0 specification available at /api/docs');
  assert(docsRes.data.documentation.endpoints?.length >= 25, 'Catalogued all 25+ system endpoints in API documentation');

  console.log(`\n========================================`);
  console.log(`Phase 19 - 27 Test Results: Passed: ${passed}, Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
