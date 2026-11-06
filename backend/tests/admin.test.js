// Automated End-to-End Test Suite for Phase 6: Admin Subsystem & Platform Governance
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
  console.log('🧪 Starting Phase 6 Admin Subsystem Automated Tests...\n');
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
    // 1. Admin Login
    const adminLoginRes = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        identifier: 'admin@farmconnect.org',
        password: 'AdminSuperPassword123',
      },
    });

    assert(adminLoginRes.status === 200, 'Admin login successfully with seed credentials');
    const adminToken = adminLoginRes.data.token || (adminLoginRes.data.data && adminLoginRes.data.data.token);
    assert(adminToken !== null && adminToken !== undefined, 'Admin received valid JWT token');

    const adminHeaders = { authorization: `Bearer ${adminToken}` };

    // 2. Buyer Login for RBAC Check
    const buyerLoginRes = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        identifier: 'kiran.buyer@example.com',
        password: 'BuyerPassword123',
      },
    });
    const buyerToken = buyerLoginRes.data.token || (buyerLoginRes.data.data && buyerLoginRes.data.data.token);
    const buyerHeaders = { authorization: `Bearer ${buyerToken}` };

    // 3. RBAC Protection Check
    const rbacRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/dashboard',
      headers: buyerHeaders,
    });
    assert(rbacRes.status === 403, 'RBAC correctly blocks non-ADMIN role from admin dashboard (HTTP 403)');

    // 4. Admin Dashboard Metrics
    const dashRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/dashboard',
      headers: adminHeaders,
    });
    assert(dashRes.status === 200, 'Admin successfully fetches dashboard metrics');
    assert(dashRes.data.data.summary.totalUsers >= 4, 'Dashboard reports all registered platform users');
    assert(dashRes.data.data.summary.totalGmv >= 0, 'Dashboard tracks platform Gross Merchandise Value');

    // 5. User Directory & Status Filter
    const usersRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/users?role=FARMER',
      headers: adminHeaders,
    });
    assert(usersRes.status === 200, 'Admin successfully lists farmers');
    assert(Array.isArray(usersRes.data.data) && usersRes.data.data.length >= 1, 'User directory returns matching farmers');

    // 6. User Status Update (Suspension & Reactivation)
    const buyerUsersRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/users?role=BUYER',
      headers: adminHeaders,
    });
    const targetBuyer = buyerUsersRes.data.data[0];

    const suspendRes = await invoke(app, {
      method: 'PUT',
      url: `/api/admin/users/${targetBuyer.id}/status`,
      headers: adminHeaders,
      body: { status: 'SUSPENDED' },
    });
    assert(suspendRes.status === 200, `Admin successfully suspended user ${targetBuyer.name}`);

    const reactivateRes = await invoke(app, {
      method: 'PUT',
      url: `/api/admin/users/${targetBuyer.id}/status`,
      headers: adminHeaders,
      body: { status: 'ACTIVE' },
    });
    assert(reactivateRes.status === 200, `Admin successfully reactivated user ${targetBuyer.name}`);

    // 7. Seller Verification Queue
    const sellersRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/sellers',
      headers: adminHeaders,
    });
    assert(sellersRes.status === 200, 'Admin successfully retrieves seller verification list');
    const targetSeller = sellersRes.data.data[0];

    const verifyRes = await invoke(app, {
      method: 'PUT',
      url: `/api/admin/sellers/${targetSeller.id}/verify`,
      headers: adminHeaders,
      body: { status: 'VERIFIED', notes: 'GSTIN and dealer license audited and approved.' },
    });
    assert(verifyRes.status === 200, `Admin successfully marked seller ${targetSeller.business_name} as VERIFIED`);

    // 8. Complaints / Grievance Management
    const complaintsRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/complaints',
      headers: adminHeaders,
    });
    assert(complaintsRes.status === 200, 'Admin successfully retrieves grievance registry');
    const openComplaint = complaintsRes.data.data.find(c => c.status === 'OPEN');
    if (openComplaint) {
      const resolveRes = await invoke(app, {
        method: 'PUT',
        url: `/api/admin/complaints/${openComplaint.id}`,
        headers: adminHeaders,
        body: { status: 'RESOLVED', resolution_notes: 'APMC lab analysis document issued and shared.' },
      });
      assert(resolveRes.status === 200, `Admin successfully resolved complaint #${openComplaint.id}`);
    }

    // 9. Mandi Price Administration
    const addPriceRes = await invoke(app, {
      method: 'POST',
      url: '/api/admin/mandi-prices',
      headers: adminHeaders,
      body: {
        crop_name: 'Soybean',
        mandi_name: 'Bidar APMC',
        district: 'Bidar',
        state: 'Karnataka',
        modal_price: 4950,
        min_price: 4700,
        max_price: 5200,
      },
    });
    assert(addPriceRes.status === 201, 'Admin successfully upserts real-time APMC mandi price');

    // 10. Audit Trail Verification
    const auditRes = await invoke(app, {
      method: 'GET',
      url: '/api/admin/audit-logs',
      headers: adminHeaders,
    });
    assert(auditRes.status === 200, 'Admin successfully retrieves immutable audit logs');
    assert(auditRes.data.data.length >= 3, 'Audit logs properly record user suspension and seller verification operations');

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Phase 6 Tests Complete: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
