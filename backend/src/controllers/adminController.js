// FarmConnect Admin Controller
const { getDb } = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/admin/dashboard
 * Aggregated administrative metrics for platform oversight
 */
function getDashboard(req, res) {
  try {
    const db = getDb();

    // User counts by role
    const userRoleCounts = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
    const roleMap = { FARMER: 0, BUYER: 0, SELLER: 0, ADMIN: 0 };
    userRoleCounts.forEach(r => { roleMap[r.role] = r.count; });

    // Total Users
    const totalUsers = Object.values(roleMap).reduce((a, b) => a + b, 0);

    // Pending Seller KYCs
    const pendingSellers = db.prepare(`
      SELECT COUNT(*) as count FROM seller_profiles WHERE verification_status = 'PENDING'
    `).get().count;

    // Financial & Order metrics
    const orderMetrics = db.prepare(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_gmv FROM orders
    `).get();

    // Active marketplace products & crops
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;
    const activeCrops = db.prepare("SELECT COUNT(*) as count FROM crops_market WHERE status = 'AVAILABLE'").get().count;

    // Open Disputes / Complaints
    const openComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'OPEN'").get().count;

    // Recent Audit Logs
    const recentAuditLogs = db.prepare(`
      SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10
    `).all();

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          farmerCount: roleMap.FARMER,
          buyerCount: roleMap.BUYER,
          sellerCount: roleMap.SELLER,
          adminCount: roleMap.ADMIN,
          pendingSellers,
          totalOrders: orderMetrics.total_orders,
          totalGmv: Math.round(orderMetrics.total_gmv),
          activeProducts,
          activeCrops,
          openComplaints,
        },
        recentAuditLogs,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load administrative dashboard telemetry.' });
  }
}

/**
 * GET /api/admin/users
 * Paginated/filtered user directory
 */
function getUsers(req, res) {
  try {
    const db = getDb();
    const { role, status, search } = req.query;

    let query = 'SELECT id, name, phone, email, role, status, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const users = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch platform users.' });
  }
}

/**
 * PUT /api/admin/users/:id/status
 * Suspend or reactivate user account
 */
function updateUserStatus(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
    }

    const user = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    // Audit log
    const auditId = 'aud_' + crypto.randomBytes(4).toString('hex');
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      req.user.id,
      status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'USER',
      id,
      `User ${user.name} (${user.role}) status changed to ${status}`,
      now
    );

    return res.status(200).json({
      success: true,
      message: `User ${user.name} status updated to ${status}.`,
      data: { id, status, updated_at: now },
    });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to modify user account status.' });
  }
}

/**
 * GET /api/admin/sellers
 * Retrieve all registered sellers and verification statuses
 */
function getSellers(req, res) {
  try {
    const db = getDb();
    const { status } = req.query;

    let query = `
      SELECT sp.id, sp.user_id, u.name, u.phone, u.email, u.status as user_status,
             sp.business_name, sp.gstin, sp.license_number, sp.rating, sp.verification_status,
             sp.total_orders, sp.total_revenue, sp.created_at
      FROM seller_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND sp.verification_status = ?';
      params.push(status);
    }

    query += ' ORDER BY sp.created_at DESC';

    const sellers = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, count: sellers.length, data: sellers });
  } catch (err) {
    console.error('getSellers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve seller registry.' });
  }
}

/**
 * PUT /api/admin/sellers/:id/verify
 * Approve, reject or place seller KYC under review
 */
function verifySeller(req, res) {
  try {
    const db = getDb();
    const { id } = req.params; // Can be seller_profiles.id or user_id
    const { status, notes } = req.body;

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const seller = db.prepare(`
      SELECT sp.*, u.name FROM seller_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = ? OR sp.user_id = ?
    `).get(id, id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    db.prepare(`
      UPDATE seller_profiles SET verification_status = ? WHERE id = ?
    `).run(status, seller.id);

    // Audit log
    const now = new Date().toISOString();
    const auditId = 'aud_' + crypto.randomBytes(4).toString('hex');
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      req.user.id,
      'VERIFY_SELLER',
      'SELLER_PROFILE',
      seller.id,
      `Seller ${seller.business_name} (${seller.name}) KYC set to ${status}. Note: ${notes || 'None'}`,
      now
    );

    return res.status(200).json({
      success: true,
      message: `Seller ${seller.business_name} verification status set to ${status}.`,
      data: { id: seller.id, verification_status: status },
    });
  } catch (err) {
    console.error('verifySeller error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update seller verification status.' });
  }
}

/**
 * GET /api/admin/complaints
 * Grievance & dispute log
 */
function getComplaints(req, res) {
  try {
    const db = getDb();
    const { status } = req.query;

    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const complaints = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    console.error('getComplaints error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints list.' });
  }
}

/**
 * PUT /api/admin/complaints/:id
 * Resolve or update complaint
 */
function updateComplaint(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    if (!['OPEN', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint status.' });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE complaints SET status = ?, resolution_notes = ?, updated_at = ? WHERE id = ?
    `).run(status, resolution_notes || null, now, id);

    // Audit log
    const auditId = 'aud_' + crypto.randomBytes(4).toString('hex');
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      req.user.id,
      'RESOLVE_COMPLAINT',
      'COMPLAINT',
      id,
      `Complaint #${id} (${complaint.subject}) status updated to ${status}`,
      now
    );

    return res.status(200).json({
      success: true,
      message: `Complaint #${id} marked as ${status}.`,
      data: { id, status, resolution_notes, updated_at: now },
    });
  } catch (err) {
    console.error('updateComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update complaint resolution.' });
  }
}

/**
 * GET /api/admin/audit-logs
 * System governance audit trail
 */
function getAuditLogs(req, res) {
  try {
    const db = getDb();
    const logs = db.prepare(`
      SELECT al.*, u.name as actor_name, u.role as actor_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `).all();

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
  }
}

/**
 * GET /api/admin/mandi-prices
 * Mandi price master list
 */
function getMandiPrices(req, res) {
  try {
    const db = getDb();
    const prices = db.prepare('SELECT * FROM mandi_prices ORDER BY arrival_date DESC, commodity ASC').all();
    return res.status(200).json({ success: true, count: prices.length, data: prices });
  } catch (err) {
    console.error('getMandiPrices error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch mandi price records.' });
  }
}

/**
 * POST /api/admin/mandi-prices
 * Add or update mandi price record
 */
function upsertMandiPrice(req, res) {
  try {
    const db = getDb();
    const { commodity, crop_name, market_mandi, mandi_name, variety, district, state, modal_price, min_price, max_price, trend, arrival_date, date } = req.body;

    const commName = commodity || crop_name;
    const mandi = market_mandi || mandi_name;

    if (!commName || !mandi || !modal_price) {
      return res.status(400).json({ success: false, message: 'Crop/commodity name, mandi name, and modal price are required.' });
    }

    const id = 'mandi_' + crypto.randomBytes(4).toString('hex');
    const today = arrival_date || date || new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO mandi_prices (id, commodity, variety, state, district, market_mandi, min_price, max_price, modal_price, trend, arrival_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      commName,
      variety || 'Standard Grade',
      state || 'Karnataka',
      district || 'Mandya',
      mandi,
      min_price ? parseFloat(min_price) : parseFloat(modal_price) * 0.95,
      max_price ? parseFloat(max_price) : parseFloat(modal_price) * 1.05,
      parseFloat(modal_price),
      trend || 'STABLE',
      today
    );

    return res.status(201).json({
      success: true,
      message: `Mandi price for ${commName} at ${mandi} recorded.`,
      data: { id, commodity: commName, market_mandi: mandi, modal_price, arrival_date: today },
    });
  } catch (err) {
    console.error('upsertMandiPrice error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record mandi price.' });
  }
}

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getSellers,
  verifySeller,
  getComplaints,
  updateComplaint,
  getAuditLogs,
  getMandiPrices,
  upsertMandiPrice,
};
