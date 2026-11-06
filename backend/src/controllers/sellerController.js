// FarmConnect Seller Controller
// Powers merchant inventory management, product CRUD, order fulfilment, and sales analytics

const crypto = require('crypto');
const db = require('../config/database');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(userId);
    let profile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(userId);

    if (!profile) {
      const profileId = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO seller_profiles (id, user_id, shop_name, license_number, is_verified, store_address, rating, created_at, updated_at)
        VALUES (?, ?, ?, 'KA-AGRI-4821', 1, 'APMC Commercial Yard, Mandya, Karnataka', 4.9, ?, ?)
      `).run(profileId, userId, `${user.name} Agri Center`, now, now);
      profile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(userId);
    }

    // Products managed by this seller (or all seed products if initial test merchant)
    const products = db.prepare("SELECT * FROM products WHERE seller_id = ? OR seller_id = 'seller_cauvery' ORDER BY created_at DESC").all(userId);

    // Orders to fulfill
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
    const enrichedOrders = orders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });

    // Compute gross revenue
    let totalRevenue = 0;
    for (const ord of orders) {
      totalRevenue += ord.total_amount;
    }

    const lowStockCount = products.filter((p) => p.stock_quantity < 50).length;

    return res.status(200).json({
      success: true,
      seller: {
        ...user,
        profile,
      },
      stats: {
        gross_revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        active_products_count: products.length,
        orders_to_dispatch: orders.filter((o) => o.order_status === 'CONFIRMED' || o.order_status === 'PACKED').length,
        low_stock_alerts: lowStockCount,
      },
      products,
      orders: enrichedOrders,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve seller dashboard', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = db.prepare("SELECT * FROM products WHERE seller_id = ? OR seller_id = 'seller_cauvery' ORDER BY created_at DESC").all(userId);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory', error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, price, unit = 'unit', stock_quantity = 50, description, image_url } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
    }

    const prodId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO products (id, seller_id, category, title, description, price, unit, stock_quantity, image_url, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?)
    `).run(
      prodId,
      userId,
      category.toUpperCase(),
      title.trim(),
      description || 'Certified quality agricultural input.',
      Number(price),
      unit,
      Number(stock_quantity),
      image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b',
      now
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId);
    return res.status(201).json({ success: true, message: `${title} added to inventory.`, product: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const prodId = req.params.id;
    const { title, price, stock_quantity, description, category } = req.body;

    const existing = db.prepare("SELECT * FROM products WHERE id = ? AND (seller_id = ? OR seller_id = 'seller_cauvery')").get(prodId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
    }

    db.prepare(`
      UPDATE products
      SET title = COALESCE(?, title),
          price = COALESCE(?, price),
          stock_quantity = COALESCE(?, stock_quantity),
          description = COALESCE(?, description),
          category = COALESCE(?, category)
      WHERE id = ?
    `).run(
      title || null,
      price !== undefined ? Number(price) : null,
      stock_quantity !== undefined ? Number(stock_quantity) : null,
      description || null,
      category ? category.toUpperCase() : null,
      prodId
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId);
    return res.status(200).json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const prodId = req.params.id;

    const result = db.prepare("DELETE FROM products WHERE id = ? AND (seller_id = ? OR seller_id = 'seller_cauvery')").run(prodId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
    }

    return res.status(200).json({ success: true, message: 'Product removed from store inventory.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const enriched = orders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });
    return res.status(200).json({ success: true, orders: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_status, tracking_note } = req.body;

    const validStatuses = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE orders
      SET order_status = ?,
          tracking_note = COALESCE(?, tracking_note),
          updated_at = ?
      WHERE id = ?
    `).run(order_status, tracking_note || null, now, orderId);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    return res.status(200).json({ success: true, message: `Order status updated to ${order_status}`, order: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const orders = db.prepare("SELECT * FROM orders WHERE order_status != 'CANCELLED'").all();
    let totalRevenue = 0;
    for (const o of orders) totalRevenue += o.total_amount;

    const categoryBreakdown = [
      { category: 'SEEDS', revenue: '₹34,200', units_sold: 42 },
      { category: 'FERTILIZERS', revenue: '₹28,500', units_sold: 38 },
      { category: 'EQUIPMENT', revenue: '₹14,000', units_sold: 5 },
      { category: 'TOOLS', revenue: '₹7,500', units_sold: 21 },
    ];

    return res.status(200).json({
      success: true,
      report: {
        total_sales_revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        completed_consignments: orders.length,
        category_breakdown: categoryBreakdown,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate reports', error: err.message });
  }
};

// Seed / Chemical Expiry & Compliance Batch Register
const merchantBatches = [
  {
    id: 'batch_seed_01',
    product_name: 'Certified Paddy Seeds (Sona Masoori BPT 5204)',
    batch_no: 'BATCH-BPT-2026-KHARIF-08',
    lot_number: 'NSC-LOT-88214',
    category: 'SEEDS',
    quantity_bags: 120,
    germination_rate: '96.5%',
    mfg_date: '2026-06-15',
    expiry_date: '2027-06-14',
    days_to_expiry: 220,
    status: 'ACTIVE',
    certification: 'National Seeds Corporation (NSC) Certified Tag #8821',
  },
  {
    id: 'batch_fert_02',
    product_name: 'IFFCO Granular Urea 46% N (50kg Bag)',
    batch_no: 'BATCH-IFFCO-UR-2026-04',
    lot_number: 'IFFCO-MDY-9923',
    category: 'FERTILIZERS',
    quantity_bags: 85,
    germination_rate: 'N/A',
    mfg_date: '2026-07-01',
    expiry_date: '2028-06-30',
    days_to_expiry: 598,
    status: 'ACTIVE',
    certification: 'CIBRC & Fertilizer Control Order (FCO) Tested',
  },
  {
    id: 'batch_pest_03',
    product_name: 'Bayer Confidor Insecticide (Imidacloprid 17.8% SL)',
    batch_no: 'BATCH-BAYER-CF-2025-11',
    lot_number: 'BAYER-IN-44120',
    category: 'PESTICIDES',
    quantity_bags: 40,
    germination_rate: 'N/A',
    mfg_date: '2025-11-10',
    expiry_date: '2026-11-30',
    days_to_expiry: 24,
    status: 'EXPIRING_SOON',
    certification: 'Central Insecticides Board & Registration Committee (CIBRC)',
  },
];

// Customer Khata Ledger
let customerKhata = [
  {
    id: 'khata_1',
    farmer_name: 'Ramesh Patil',
    phone: '9845012345',
    village: 'Shivalli, Mandya',
    crop_cycle: 'Sugarcane Adasali (14-Month)',
    credit_amount: 14500,
    paid_amount: 5000,
    outstanding_balance: 9500,
    due_date: '2026-12-15',
    status: 'ACTIVE',
    last_payment_date: '2026-10-20',
  },
  {
    id: 'khata_2',
    farmer_name: 'Basavaraj Hiremath',
    phone: '9845012399',
    village: 'Kothathi, Mandya',
    crop_cycle: 'Paddy Kharif 2026',
    credit_amount: 8200,
    paid_amount: 8200,
    outstanding_balance: 0,
    due_date: '2026-11-01',
    status: 'SETTLED',
    last_payment_date: '2026-10-28',
  },
  {
    id: 'khata_3',
    farmer_name: 'Chennappa Gowda',
    phone: '9845012377',
    village: 'Maddur Rural',
    crop_cycle: 'Ragi GPU-28 Rainfed',
    credit_amount: 6400,
    paid_amount: 2000,
    outstanding_balance: 4400,
    due_date: '2026-11-25',
    status: 'OVERDUE',
    last_payment_date: '2026-09-15',
  },
];

exports.getBatches = async (req, res) => {
  return res.status(200).json({
    success: true,
    count: merchantBatches.length,
    batches: merchantBatches,
  });
};

exports.getCreditLedger = async (req, res) => {
  const totalOutstanding = customerKhata.reduce((sum, k) => sum + k.outstanding_balance, 0);
  return res.status(200).json({
    success: true,
    total_outstanding: totalOutstanding,
    khata_entries: customerKhata,
  });
};

exports.recordCreditPayment = async (req, res) => {
  try {
    const { khata_id, amount_paid } = req.body;
    const entry = customerKhata.find((k) => k.id === khata_id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Khata entry not found' });
    }
    const amt = parseFloat(amount_paid) || 0;
    entry.paid_amount += amt;
    entry.outstanding_balance = Math.max(0, entry.outstanding_balance - amt);
    entry.last_payment_date = new Date().toISOString().split('T')[0];
    if (entry.outstanding_balance === 0) {
      entry.status = 'SETTLED';
    }
    return res.status(200).json({
      success: true,
      message: `Payment of ₹${amt.toLocaleString('en-IN')} recorded for ${entry.farmer_name}. Remaining balance: ₹${entry.outstanding_balance}`,
      entry,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record credit payment', error: err.message });
  }
};
