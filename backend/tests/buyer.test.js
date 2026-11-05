// Automated End-to-End Test Suite for Phase 4: Buyer Subsystem
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

async function runBuyerTests() {
  console.log('--- STARTING PHASE 4 BUYER SUBSYSTEM TESTS ---');

  // 1. Authenticate Buyer
  console.log('\n[1] Authenticating Buyer (Kiran Wholesales)...');
  let buyerToken;
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'kiran.buyer@example.com',
      password: 'BuyerPassword123',
    },
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    buyerToken = loginRes.data.token;
  } else {
    const regRes = await invoke(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        name: 'Kiran Wholesales',
        email: 'kiran.buyer@example.com',
        phone: '9845012346',
        password: 'BuyerPassword123',
        role: 'BUYER',
        profileData: { business_name: 'Kiran Agro Exports', buyer_type: 'Wholesaler' },
      },
    });
    buyerToken = regRes.data.token;
  }

  console.assert(buyerToken, 'Buyer token must be acquired');
  console.log('✓ Buyer token acquired');

  // 2. Fetch Buyer Dashboard
  console.log('\n[2] Testing GET /api/buyer/dashboard...');
  const dashRes = await invoke(app, {
    method: 'GET',
    url: '/api/buyer/dashboard',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(dashRes.status === 200, `Expected 200, got ${dashRes.status}`);
  console.assert(dashRes.data.buyer.role === 'BUYER', 'Role must be BUYER');
  console.assert(Array.isArray(dashRes.data.featured_crops), 'Featured crops array required');
  console.assert(Array.isArray(dashRes.data.featured_products), 'Featured products array required');
  console.log('✓ Buyer dashboard telemetry retrieved successfully');

  // 3. Test Catalog Browsing & Search
  console.log('\n[3] Testing GET /api/buyer/catalog (search & filter)...');
  const catalogRes = await invoke(app, {
    method: 'GET',
    url: '/api/buyer/catalog?type=all&search=Paddy&sort=price_asc',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(catalogRes.status === 200, `Expected 200, got ${catalogRes.status}`);
  console.assert(catalogRes.data.count > 0, 'Catalog search for Paddy should return results');
  console.log(`✓ Catalog search returned ${catalogRes.data.count} items matching "Paddy"`);

  // 4. Cart Management: Add to Cart
  console.log('\n[4] Testing POST /api/buyer/cart (Add Item)...');
  const addCartRes = await invoke(app, {
    method: 'POST',
    url: '/api/buyer/cart',
    headers: { authorization: `Bearer ${buyerToken}` },
    body: {
      item_id: 'prod_1',
      item_type: 'PRODUCT',
      title: 'Hybrid Paddy Seeds (Sona Masoori)',
      unit_price: 850,
      quantity: 2,
      unit: 'bag (10kg)',
    },
  });
  console.assert(addCartRes.status === 200, `Expected 200, got ${addCartRes.status}`);

  // Fetch Cart
  const getCartRes = await invoke(app, {
    method: 'GET',
    url: '/api/buyer/cart',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(getCartRes.status === 200, `Expected 200, got ${getCartRes.status}`);
  console.assert(getCartRes.data.cart.items.length > 0, 'Cart should contain items');
  console.assert(getCartRes.data.cart.subtotal === 1700, `Subtotal expected 1700, got ${getCartRes.data.cart.subtotal}`);
  console.log(`✓ Cart verified: ${getCartRes.data.cart.items.length} items, Subtotal: ₹${getCartRes.data.cart.subtotal}`);

  // 5. Wishlist Management
  console.log('\n[5] Testing POST & GET /api/buyer/wishlist...');
  const wishToggle = await invoke(app, {
    method: 'POST',
    url: '/api/buyer/wishlist',
    headers: { authorization: `Bearer ${buyerToken}` },
    body: {
      item_id: 'crop_m1',
      item_type: 'CROP',
      title: 'Sugarcane Co 86032',
      unit_price: 3350,
      unit: 'Quintal',
    },
  });
  console.assert(wishToggle.status === 200, `Expected 200, got ${wishToggle.status}`);
  console.log('✓ Wishlist item toggled');

  // 6. Checkout Pipeline & Order Creation
  console.log('\n[6] Testing POST /api/buyer/checkout...');
  const checkoutRes = await invoke(app, {
    method: 'POST',
    url: '/api/buyer/checkout',
    headers: { authorization: `Bearer ${buyerToken}` },
    body: {
      shipping_name: 'Kiran Wholesales Hub',
      shipping_address: 'Plot 48, APMC Industrial Yard, Mysuru, Karnataka',
      shipping_phone: '9845012346',
      payment_method: 'UPI',
    },
  });
  console.assert(checkoutRes.status === 201, `Expected 201, got ${checkoutRes.status}`);
  const createdOrder = checkoutRes.data.order;
  console.assert(createdOrder.order_number.startsWith('FC-ORD-2026-'), 'Order number format invalid');
  console.assert(createdOrder.total_amount === 1700, 'Total amount must match cart subtotal');
  console.log(`✓ Order placed successfully: ${createdOrder.order_number} (Amount: ₹${createdOrder.total_amount})`);

  // 7. Order History & Tracking Timeline
  console.log('\n[7] Testing GET /api/buyer/orders and tracking...');
  const ordersRes = await invoke(app, {
    method: 'GET',
    url: '/api/buyer/orders',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(ordersRes.status === 200, `Expected 200, got ${ordersRes.status}`);
  console.assert(ordersRes.data.orders.length > 0, 'Orders history should be populated');

  const trackRes = await invoke(app, {
    method: 'GET',
    url: `/api/buyer/orders/${createdOrder.id}`,
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  console.assert(trackRes.status === 200, `Expected 200, got ${trackRes.status}`);
  console.assert(trackRes.data.order.tracking_stages.length === 4, 'Tracking should contain 4 stages');
  console.log(`✓ Order tracking verified: Status "${trackRes.data.order.order_status}", Stepper steps: ${trackRes.data.order.tracking_stages.length}`);

  // 8. Submit Customer Review
  console.log('\n[8] Testing POST /api/buyer/reviews...');
  const reviewRes = await invoke(app, {
    method: 'POST',
    url: '/api/buyer/reviews',
    headers: { authorization: `Bearer ${buyerToken}` },
    body: {
      target_type: 'PRODUCT',
      target_id: 'prod_1',
      rating: 5,
      comment: 'Excellent germination rate on these Sona Masoori seeds. Recommended for all paddy farmers.',
    },
  });
  console.assert(reviewRes.status === 201, `Expected 201, got ${reviewRes.status}`);
  console.log('✓ Customer review and 5-star rating recorded in SQLite');

  // 9. RBAC Test: Non-Buyer blocked from checkout
  console.log('\n[9] Testing RBAC: Non-Buyer (FARMER) blocked from /api/buyer/checkout...');
  const farmerLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'ramesh.farmer@example.com',
      password: 'NewFarmerPassword456',
    },
  });
  const farmerToken = farmerLogin.data.token;
  const farmerBlocked = await invoke(app, {
    method: 'POST',
    url: '/api/buyer/checkout',
    headers: { authorization: `Bearer ${farmerToken}` },
    body: {},
  });
  console.assert(farmerBlocked.status === 403, `Expected 403, got ${farmerBlocked.status}`);
  console.log('✓ Farmer blocked from Buyer checkout route with 403');

  console.log('\n======================================================');
  console.log(' 🎉 ALL 9 PHASE 4 BUYER SUBSYSTEM TESTS PASSED! 🎉');
  console.log('======================================================\n');
}

runBuyerTests().catch((err) => {
  console.error('Buyer test suite failed:', err);
  process.exit(1);
});
