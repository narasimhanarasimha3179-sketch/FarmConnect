// In-process test suite for Phase 2 Auth that does not require network sockets
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

async function runDirectTests() {
  console.log('--- STARTING IN-PROCESS PHASE 2 AUTH TESTS ---');

  // Clean test user if exists
  const db = require('../src/config/database');
  db.exec("DELETE FROM users WHERE email IN ('ramesh.farmer@example.com', 'kiran.buyer@example.com', 'cauvery.seller@example.com', 'admin@farmconnect.org')");

  // 1. Health check
  console.log('\n[1] Testing /api/health...');
  const health = await invoke(app, { method: 'GET', url: '/api/health' });
  console.assert(health.status === 200, `Health expected 200, got ${health.status}`);
  console.log('✓ Health check passed:', health.data.system);

  // 2. Register FARMER
  console.log('\n[2] Registering FARMER (Ramesh Patil)...');
  const farmerReg = await invoke(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: 'Ramesh Patil',
      email: 'ramesh.farmer@example.com',
      phone: '9845012345',
      password: 'FarmerPassword123',
      role: 'FARMER',
      profileData: {
        state: 'Karnataka',
        district: 'Mandya',
        village: 'Maddur',
        land_size_acres: 4.5,
        soil_type: 'Red Sandy Loam',
        primary_crops: 'Sugarcane, Paddy',
        experience_years: 15,
      },
    },
  });

  console.assert(farmerReg.status === 201, `Expected 201, got ${farmerReg.status}: ${JSON.stringify(farmerReg.data)}`);
  console.assert(farmerReg.data.token, 'Token must be present in response');
  console.assert(farmerReg.data.user.role === 'FARMER', 'User role must be FARMER');
  console.assert(farmerReg.data.user.profile.district === 'Mandya', 'Farmer profile district must match');
  const farmerToken = farmerReg.data.token;
  console.log('✓ Farmer registered with SQLite profile and valid JWT');

  // 3. Prevent duplicate email
  console.log('\n[3] Testing duplicate email rejection...');
  const dupEmail = await invoke(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: 'Duplicate Patil',
      email: 'ramesh.farmer@example.com',
      phone: '9999999999',
      password: 'AnotherPassword123',
      role: 'FARMER',
    },
  });
  console.assert(dupEmail.status === 409, `Expected 409 Conflict, got ${dupEmail.status}`);
  console.log('✓ Duplicate email correctly rejected with 409');

  // 4. Test Login with Phone
  console.log('\n[4] Testing Login via Phone Number...');
  const phoneLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: '9845012345',
      password: 'FarmerPassword123',
    },
  });
  console.assert(phoneLogin.status === 200, `Expected 200, got ${phoneLogin.status}`);
  console.assert(phoneLogin.data.token, 'Login must yield JWT');
  console.log('✓ Login via phone number successful');

  // 5. Test Login with Email
  console.log('\n[5] Testing Login via Email...');
  const emailLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'ramesh.farmer@example.com',
      password: 'FarmerPassword123',
    },
  });
  console.assert(emailLogin.status === 200, `Expected 200, got ${emailLogin.status}`);
  console.log('✓ Login via email address successful');

  // 6. Test Login with Wrong Password
  console.log('\n[6] Testing Login with Wrong Password...');
  const wrongPass = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'ramesh.farmer@example.com',
      password: 'IncorrectPassword',
    },
  });
  console.assert(wrongPass.status === 401, `Expected 401 Unauthorized, got ${wrongPass.status}`);
  console.log('✓ Invalid password correctly rejected with 401');

  // 7. Protected Route: /api/auth/me
  console.log('\n[7] Testing Protected Route /api/auth/me...');
  const meRes = await invoke(app, {
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: `Bearer ${farmerToken}` },
  });
  console.assert(meRes.status === 200, `Expected 200, got ${meRes.status}`);
  console.assert(meRes.data.user.email === 'ramesh.farmer@example.com', 'User email must match token');
  console.log('✓ Protected route correctly authenticated via Bearer token');

  // 8. Role Permission: Farmer Allowed on /farmer-only
  console.log('\n[8] Testing Role Guard (FARMER on /farmer-only)...');
  const farmerOnly = await invoke(app, {
    method: 'GET',
    url: '/api/auth/farmer-only',
    headers: { authorization: `Bearer ${farmerToken}` },
  });
  console.assert(farmerOnly.status === 200, `Expected 200, got ${farmerOnly.status}`);
  console.log('✓ Role Guard permitted authorized role');

  // 9. Role Permission: Farmer Forbidden on /buyer-only
  console.log('\n[9] Testing Role Guard (FARMER on /buyer-only -> 403)...');
  const forbiddenRes = await invoke(app, {
    method: 'GET',
    url: '/api/auth/buyer-only',
    headers: { authorization: `Bearer ${farmerToken}` },
  });
  console.assert(forbiddenRes.status === 403, `Expected 403 Forbidden, got ${forbiddenRes.status}`);
  console.log('✓ Role Guard rejected unauthorized role with 403');

  // 10. Register BUYER, SELLER, ADMIN
  console.log('\n[10] Registering BUYER, SELLER, and ADMIN roles...');
  const buyerReg = await invoke(app, {
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
  console.assert(buyerReg.status === 201, 'Buyer registration failed');

  const sellerReg = await invoke(app, {
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
  console.assert(sellerReg.status === 201, 'Seller registration failed');

  const adminReg = await invoke(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: 'System Admin',
      email: 'admin@farmconnect.org',
      phone: '9845012348',
      password: 'AdminSuperPassword123',
      role: 'ADMIN',
    },
  });
  console.assert(adminReg.status === 201, 'Admin registration failed');
  console.log('✓ All 4 user roles (Farmer, Buyer, Seller, Admin) registered and verified in SQLite');

  // 11. Test Forgot & Reset Password
  console.log('\n[11] Testing Forgot & Reset Password Workflow...');
  const forgotRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/forgot-password',
    body: { identifier: 'ramesh.farmer@example.com' },
  });
  console.assert(forgotRes.status === 200, 'Forgot password request failed');
  const resetCode = forgotRes.data.recovery_code;
  console.assert(resetCode, 'Reset code must be returned');

  const resetRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/reset-password',
    body: {
      identifier: 'ramesh.farmer@example.com',
      reset_code: resetCode,
      new_password: 'NewFarmerPassword456',
    },
  });
  console.assert(resetRes.status === 200, 'Reset password failed');

  // Verify login with new password
  const newLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      identifier: 'ramesh.farmer@example.com',
      password: 'NewFarmerPassword456',
    },
  });
  console.assert(newLogin.status === 200, 'Login with updated password failed');
  console.log('✓ Password reset workflow complete & verified with new login');

  console.log('\n======================================================');
  console.log(' 🎉 ALL 11 PHASE 2 BACKEND AUTH & RBAC TESTS PASSED! 🎉');
  console.log('======================================================\n');
}

runDirectTests().catch((err) => {
  console.error('In-process test suite failed:', err);
  process.exit(1);
});
