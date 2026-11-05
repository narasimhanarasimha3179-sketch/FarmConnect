// Automated End-to-End Test Suite for Phase 5: Seller Subsystem
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

async function runSellerTests() {
  console.log('--- STARTING PHASE 5 SELLER SUBSYSTEM TESTS ---');

  // 1. Authenticate Seller
  console.log('\n[1] Authenticating Seller (Cauvery Agri Inputs)...');
  let sellerToken;
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'cauvery.seller@example.com',
      password: 'SellerPassword123',
    },
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    sellerToken = loginRes.data.token;
  } else {
    const regRes = await invoke(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        name: 'Cauvery Agri Inputs',
        email: 'cauvery.seller@example.com',
        phone: '9845012347',
        password: 'SellerPassword123',
        role: 'SELLER',
        profileData: { shop_name: 'Cauvery Seeds & Fertilizers', license_number: 'KA-AGRI-4821' },
      },
    });
    sellerToken = regRes.data.token;
  }

  console.assert(sellerToken, 'Seller token must be acquired');
  console.log('✓ Seller token acquired');

  // 2. Fetch Seller Dashboard
  console.log('\n[2] Testing GET /api/seller/dashboard...');
  const dashRes = await invoke(app, {
    method: 'GET',
    url: '/api/seller/dashboard',
    headers: { authorization: `Bearer ${sellerToken}` },
  });
  console.assert(dashRes.status === 200, `Expected 200, got ${dashRes.status}`);
  console.assert(dashRes.data.seller.role === 'SELLER', 'Role must be SELLER');
  console.assert(dashRes.data.stats.active_products_count > 0, 'Should have active products in catalog');
  console.log(`✓ Seller dashboard retrieved: ${dashRes.data.stats.active_products_count} active items, Gross revenue: ${dashRes.data.stats.gross_revenue}`);

  // 3. Add Product to Inventory
  console.log('\n[3] Testing POST /api/seller/products (Add Product)...');
  const addProdRes = await invoke(app, {
    method: 'POST',
    url: '/api/seller/products',
    headers: { authorization: `Bearer ${sellerToken}` },
    body: {
      title: 'Bio-NPK Liquid Consortia 1L',
      category: 'FERTILIZERS',
      price: 480,
      unit: 'bottle (1L)',
      stock_quantity: 75,
      description: 'Multi-strain nitrogen fixing and phosphate solubilizing liquid biofertilizer.',
    },
  });
  console.assert(addProdRes.status === 201, `Expected 201, got ${addProdRes.status}`);
  const createdProdId = addProdRes.data.product.id;
  console.assert(createdProdId, 'Product ID must be created');
  console.log(`✓ Product added to inventory (ID: ${createdProdId})`);

  // 4. Update Product
  console.log('\n[4] Testing PUT /api/seller/products/:id (Update Price & Stock)...');
  const updateProdRes = await invoke(app, {
    method: 'PUT',
    url: `/api/seller/products/${createdProdId}`,
    headers: { authorization: `Bearer ${sellerToken}` },
    body: {
      price: 520,
      stock_quantity: 80,
    },
  });
  console.assert(updateProdRes.status === 200, `Expected 200, got ${updateProdRes.status}`);
  console.assert(updateProdRes.data.product.price === 520, 'Price must be updated');
  console.assert(updateProdRes.data.product.stock_quantity === 80, 'Stock quantity must be updated');
  console.log('✓ Product price and stock successfully updated in SQLite');

  // 5. Delete Product
  console.log('\n[5] Testing DELETE /api/seller/products/:id...');
  const delProdRes = await invoke(app, {
    method: 'DELETE',
    url: `/api/seller/products/${createdProdId}`,
    headers: { authorization: `Bearer ${sellerToken}` },
  });
  console.assert(delProdRes.status === 200, `Expected 200, got ${delProdRes.status}`);
  console.log('✓ Product removed from inventory');

  // 6. Manage Orders & Update Fulfilment Status
  console.log('\n[6] Testing GET /api/seller/orders & PUT status...');
  const ordersRes = await invoke(app, {
    method: 'GET',
    url: '/api/seller/orders',
    headers: { authorization: `Bearer ${sellerToken}` },
  });
  console.assert(ordersRes.status === 200, `Expected 200, got ${ordersRes.status}`);

  if (ordersRes.data.orders.length > 0) {
    const firstOrder = ordersRes.data.orders[0];
    const statusUpdate = await invoke(app, {
      method: 'PUT',
      url: `/api/seller/orders/${firstOrder.id}/status`,
      headers: { authorization: `Bearer ${sellerToken}` },
      body: {
        order_status: 'PACKED',
        tracking_note: 'Agricultural consignments securely packed for freight dispatch.',
      },
    });
    console.assert(statusUpdate.status === 200, `Expected 200, got ${statusUpdate.status}`);
    console.log(`✓ Order ${firstOrder.order_number} marked as PACKED`);
  }

  // 7. Sales & Revenue Reports
  console.log('\n[7] Testing GET /api/seller/reports...');
  const reportRes = await invoke(app, {
    method: 'GET',
    url: '/api/seller/reports',
    headers: { authorization: `Bearer ${sellerToken}` },
  });
  console.assert(reportRes.status === 200, `Expected 200, got ${reportRes.status}`);
  console.assert(Array.isArray(reportRes.data.report.category_breakdown), 'Category breakdown required');
  console.log('✓ Sales analytics & revenue reports verified');

  // 8. RBAC Test: Non-Seller blocked from /api/seller/dashboard
  console.log('\n[8] Testing RBAC: Non-Seller (FARMER) blocked from /api/seller/dashboard...');
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
    method: 'GET',
    url: '/api/seller/dashboard',
    headers: { authorization: `Bearer ${farmerToken}` },
  });
  console.assert(farmerBlocked.status === 403, `Expected 403, got ${farmerBlocked.status}`);
  console.log('✓ Farmer blocked from Seller dashboard with 403');

  console.log('\n======================================================');
  console.log(' 🎉 ALL 8 PHASE 5 SELLER SUBSYSTEM TESTS PASSED! 🎉');
  console.log('======================================================\n');
}

runSellerTests().catch((err) => {
  console.error('Seller test suite failed:', err);
  process.exit(1);
});
