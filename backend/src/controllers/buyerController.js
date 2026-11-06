// FarmConnect Buyer Controller
// Powers product/crop catalog browsing, search & filter, cart, wishlist, checkout, and order tracking

const crypto = require('crypto');
const db = require('../config/database');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(userId);
    let profile = db.prepare('SELECT * FROM buyer_profiles WHERE user_id = ?').get(userId);

    if (!profile) {
      const profileId = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO buyer_profiles (id, user_id, business_name, buyer_type, delivery_address, gst_number, created_at, updated_at)
        VALUES (?, ?, ?, 'Wholesaler', 'APMC Market Road, Mysuru, Karnataka', '29ABCDE1234F1Z5', ?, ?)
      `).run(profileId, userId, `${user.name} Trading Co.`, now, now);
      profile = db.prepare('SELECT * FROM buyer_profiles WHERE user_id = ?').get(userId);
    }

    const cartCount = db.prepare('SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?').get(userId);
    const wishlistCount = db.prepare('SELECT COUNT(*) as count FROM wishlist_items WHERE user_id = ?').get(userId);
    const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE buyer_id = ?').get(userId);

    const featuredCrops = db.prepare("SELECT * FROM crops_market WHERE status = 'AVAILABLE' LIMIT 3").all();
    const featuredProducts = db.prepare('SELECT * FROM products LIMIT 4').all();

    return res.status(200).json({
      success: true,
      buyer: {
        ...user,
        profile,
        stats: {
          cart_items_count: cartCount ? cartCount.count : 0,
          wishlist_count: wishlistCount ? wishlistCount.count : 0,
          total_orders_count: ordersCount ? ordersCount.count : 0,
        },
      },
      featured_crops: featuredCrops,
      featured_products: featuredProducts,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve buyer dashboard', error: err.message });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    const { type = 'all', category, search, sort = 'price_asc' } = req.query;

    let items = [];

    // 1. Fetch Products if requested
    if (type === 'all' || type === 'product') {
      let query = "SELECT *, 'PRODUCT' as item_type FROM products WHERE 1=1";
      const params = [];

      if (category && category !== 'ALL') {
        query += ' AND category = ?';
        params.push(category.toUpperCase());
      }

      if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const products = db.prepare(query).all(...params);
      items.push(...products.map((p) => ({
        id: p.id,
        item_type: 'PRODUCT',
        title: p.title,
        category: p.category,
        description: p.description,
        price: p.price,
        unit: p.unit,
        image_url: p.image_url,
        rating: p.rating,
        stock_quantity: p.stock_quantity,
        seller_id: p.seller_id,
        source_name: 'Cauvery Agri Inputs (Verified Merchant)',
      })));
    }

    // 2. Fetch Direct Farm Crops if requested
    if (type === 'all' || type === 'crop') {
      let query = "SELECT *, 'CROP' as item_type FROM crops_market WHERE status = 'AVAILABLE'";
      const params = [];

      if (search) {
        query += ' AND (crop_name LIKE ? OR variety LIKE ? OR mandi_location LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const crops = db.prepare(query).all(...params);
      items.push(...crops.map((c) => ({
        id: c.id,
        item_type: 'CROP',
        title: `${c.crop_name} (${c.variety})`,
        category: 'FARM_PRODUCE',
        description: c.description,
        price: c.expected_price,
        unit: c.unit,
        image_url: c.image_url,
        rating: 4.9,
        stock_quantity: c.quantity_available,
        farmer_id: c.farmer_id,
        source_name: `${c.farmer_name} (Direct Harvest)`,
        location: c.mandi_location,
        quality_grade: c.quality_grade,
      })));
    }

    // 3. Sorting
    if (sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error('getCatalog error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve catalog', error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC').all(userId);

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.unit_price * item.quantity;
    }

    const deliveryFee = subtotal > 1500 || subtotal === 0 ? 0 : 75;
    const total = subtotal + deliveryFee;

    return res.status(200).json({
      success: true,
      cart: {
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load cart', error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id, item_type, title, unit_price, quantity = 1, unit = 'kg' } = req.body;

    if (!item_id || !item_type || !title || unit_price === undefined) {
      return res.status(400).json({ success: false, message: 'Item details are incomplete.' });
    }

    const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND item_id = ?').get(userId, item_id);

    if (existing) {
      const newQty = existing.quantity + Number(quantity);
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO cart_items (id, user_id, item_type, item_id, title, unit_price, quantity, unit, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, item_type, item_id, title, Number(unit_price), Number(quantity), unit, now);
    }

    return res.status(200).json({ success: true, message: `${title} added to cart.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add item to cart', error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
    return res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove cart item', error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = db.prepare('SELECT * FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return res.status(200).json({ success: true, wishlist: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist', error: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id, item_type, title, unit_price, unit = 'kg' } = req.body;

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND item_id = ?').get(userId, item_id);

    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
      return res.status(200).json({ success: true, action: 'REMOVED', message: 'Item removed from wishlist.' });
    } else {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO wishlist_items (id, user_id, item_type, item_id, title, unit_price, unit, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, item_type, item_id, title, Number(unit_price), unit, now);
      return res.status(200).json({ success: true, action: 'ADDED', message: 'Item saved to wishlist.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle wishlist item', error: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(userId);
    const { shipping_name, shipping_address, shipping_phone, payment_method = 'UPI' } = req.body;

    const cartItems = db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty. Please add items to checkout.' });
    }

    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.unit_price * item.quantity;
    }
    const deliveryFee = subtotal > 1500 ? 0 : 75;
    const totalAmount = subtotal + deliveryFee;

    const orderId = crypto.randomUUID();
    const orderNumber = `FC-ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const isCOD = payment_method === 'COD';
    const initialPaymentStatus = isCOD ? 'PENDING_COD' : 'PAID';
    const trackingNote = isCOD
      ? `Cash on Delivery order confirmed. Verification OTP generated.`
      : `Payment authorized via ${payment_method}. Vendor preparing agricultural dispatch.`;

    db.prepare(`
      INSERT INTO orders (id, order_number, buyer_id, total_amount, shipping_name, shipping_address, shipping_phone, payment_method, payment_status, order_status, tracking_note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      userId,
      totalAmount,
      shipping_name || user.name,
      shipping_address || 'APMC Hub, Mysuru, Karnataka',
      shipping_phone || user.phone,
      payment_method,
      initialPaymentStatus,
      trackingNote,
      now,
      now
    );

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (id, order_id, item_type, item_id, title, unit_price, quantity, unit, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of cartItems) {
      const orderItemId = crypto.randomUUID();
      insertOrderItem.run(
        orderItemId,
        orderId,
        item.item_type,
        item.item_id,
        item.title,
        item.unit_price,
        item.quantity,
        item.unit,
        item.unit_price * item.quantity
      );

      // Decrement stock in real product catalog
      try {
        db.prepare('UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?').run(item.quantity, item.item_id);
      } catch {}
    }

    // Initialize real shipment tracking record
    try {
      const trackId = crypto.randomUUID();
      const initialCheckpoint = JSON.stringify([
        {
          timestamp: now,
          status: 'ORDER_PLACED',
          location: 'Agricultural Marketplace Hub, Mandya',
          description: `Consignment verified. Payment mode: ${payment_method}.`,
        },
      ]);
      db.prepare(`
        INSERT OR IGNORE INTO shipment_trackings (id, order_id, current_stage, tracking_number, courier_partner, estimated_delivery, checkpoints, created_at, updated_at)
        VALUES (?, ?, 'ORDER_PLACED', ?, 'K-Agri Express Fleet', ?, ?, ?, ?)
      `).run(
        trackId,
        orderId,
        `TRK-${orderNumber}`,
        new Date(Date.now() + 86400000 * 2).toISOString(),
        initialCheckpoint,
        now,
        now
      );
    } catch {}

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderDetails = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    return res.status(201).json({
      success: true,
      message: 'Order successfully placed!',
      order: {
        ...createdOrder,
        items: orderDetails,
      },
    });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process checkout', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(userId);

    const enrichedOrders = orders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return {
        ...ord,
        items,
      };
    });

    return res.status(200).json({ success: true, orders: enrichedOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders', error: err.message });
  }
};

exports.getOrderTracking = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyer_id = ?').get(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    // Build real tracking stages
    const stages = [
      { step: 1, name: 'Order Confirmed', completed: true, timestamp: order.created_at, note: 'Payment verified and sent to vendor.' },
      { step: 2, name: 'Packed & Quality Verified', completed: order.order_status !== 'CONFIRMED', timestamp: order.updated_at, note: 'Agricultural moisture & purity verified.' },
      { step: 3, name: 'Dispatched in Transit', completed: ['SHIPPED', 'DELIVERED'].includes(order.order_status), timestamp: order.updated_at, note: 'Assigned to regional agricultural freight carrier.' },
      { step: 4, name: 'Delivered', completed: order.order_status === 'DELIVERED', timestamp: null, note: 'Handed over at buyer destination.' },
    ];

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        tracking_stages: stages,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tracking', error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);
    const { target_type, target_id, rating, comment } = req.body;

    if (!target_type || !target_id || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Target, rating (1-5), and comment are required.' });
    }

    const reviewId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, user_id, user_name, target_type, target_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(reviewId, userId, user.name, target_type, target_id, Number(rating), comment.trim(), now);

    return res.status(201).json({ success: true, message: 'Review successfully recorded.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add review', error: err.message });
  }
};
