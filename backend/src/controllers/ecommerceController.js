// FarmConnect Agricultural E-Commerce Controller (Phase 7)
// Comprehensive catalog, 10 categories, advanced search, filtering, reviews & details

const db = require('../config/database');
const crypto = require('crypto');

const VALID_CATEGORIES = [
  'SEEDS',
  'FERTILIZERS',
  'BIO_FERTILIZERS',
  'PESTICIDES',
  'FARMING_EQUIPMENT',
  'AGRICULTURAL_TOOLS',
  'IRRIGATION_PRODUCTS',
  'ORGANIC_PRODUCTS',
  'CROP_PROTECTION',
  'OTHER_SUPPLIES',
];

const CATEGORY_METADATA = {
  SEEDS: { name: 'Certified Seeds', icon: '🌱', description: 'Certified high-yield, drought-tolerant and hybrid seed varieties' },
  FERTILIZERS: { name: 'Fertilizers', icon: '🧪', description: 'Macro and micro-nutrient chemical and organic fertilizers' },
  BIO_FERTILIZERS: { name: 'Bio-Fertilizers', icon: '🦠', description: 'Nitrogen-fixing bacteria, mycorrhiza and bio-inoculants' },
  PESTICIDES: { name: 'Pesticides & Fungicides', icon: '🛡', description: 'Targeted insect repellents, bio-pesticides and systemic protectants' },
  FARMING_EQUIPMENT: { name: 'Farming Equipment', icon: '🚜', description: 'Battery sprayers, power weeders, seeders and harvesters' },
  AGRICULTURAL_TOOLS: { name: 'Agricultural Tools', icon: '🌾', description: 'Ergonomic sickles, spades, pruning shears and hand hoes' },
  IRRIGATION_PRODUCTS: { name: 'Irrigation Products', icon: '💧', description: 'Drip lines, impact sprinklers, lateral pipes and venturi injectors' },
  ORGANIC_PRODUCTS: { name: 'Organic Farming', icon: '🍃', description: 'Vermicompost, neem cake, panchagavya and organic manure' },
  CROP_PROTECTION: { name: 'Crop Protection', icon: '⛺', description: 'Mulch film sheets, shade nets, pheromone traps and fruit covers' },
  OTHER_SUPPLIES: { name: 'Farming Supplies', icon: '📦', description: 'Heavy-duty tarpaulins, jute bags, nursery pots and twine' },
};

/**
 * GET /api/ecommerce/categories
 * Returns all 10 verified agriculture categories with live product counts
 */
function getCategories(req, res) {
  try {
    const counts = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM products
      WHERE is_active = 1
      GROUP BY category
    `).all();

    const countMap = {};
    counts.forEach((c) => {
      countMap[c.category] = c.count;
    });

    const categories = VALID_CATEGORIES.map((catKey) => ({
      key: catKey,
      name: CATEGORY_METADATA[catKey]?.name || catKey,
      icon: CATEGORY_METADATA[catKey]?.icon || '📦',
      description: CATEGORY_METADATA[catKey]?.description || '',
      itemCount: countMap[catKey] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product categories.' });
  }
}

/**
 * GET /api/ecommerce/products
 * Advanced filterable, searchable & paginated agriculture product catalog
 */
function getProducts(req, res) {
  try {
    const { category, search, min_price, max_price, in_stock, sort = 'newest', page = 1, limit = 20 } = req.query;

    let query = `
      SELECT p.*, sp.shop_name, sp.rating as seller_rating, sp.verification_status
      FROM products p
      LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id OR p.seller_id = sp.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category && category !== 'ALL') {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (in_stock === 'true') {
      query += ' AND p.stock_quantity > 0';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'rating_desc':
        query += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
        break;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load product catalog.' });
  }
}

/**
 * GET /api/ecommerce/products/:id
 * Single product detailed record with seller info and verified customer reviews
 */
function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = db.prepare(`
      SELECT p.*, sp.shop_name, sp.license_number, sp.rating as seller_rating, sp.verification_status, sp.store_address
      FROM products p
      LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id OR p.seller_id = sp.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in catalog.' });
    }

    // Customer Reviews
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.target_id = ? AND r.target_type = 'PRODUCT'
      ORDER BY r.created_at DESC LIMIT 20
    `).all(id);

    // Related Products in same category
    const related = db.prepare(`
      SELECT id, title, price, unit, image_url, rating, category
      FROM products
      WHERE category = ? AND id != ? AND is_active = 1
      LIMIT 4
    `).all(product.category, id);

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        reviews,
        related,
      },
    });
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

/**
 * POST /api/ecommerce/reviews
 * Submit product review and rating
 */
function addProductReview(req, res) {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, rating (1-5), and comment are required.' });
    }

    const product = db.prepare('SELECT id, rating FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviewId = 'rev_' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, user_id, user_name, target_type, target_id, rating, comment, created_at)
      VALUES (?, ?, ?, 'PRODUCT', ?, ?, ?, ?)
    `).run(
      reviewId,
      req.user.id,
      req.user.name,
      product_id,
      parseInt(rating),
      comment.trim(),
      now
    );

    // Recalculate average rating
    const avgData = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE target_id = ? AND target_type = 'PRODUCT'
    `).get(product_id);

    if (avgData && avgData.avg_rating) {
      const newRating = Math.round(avgData.avg_rating * 10) / 10;
      db.prepare('UPDATE products SET rating = ? WHERE id = ?').run(newRating, product_id);
    }

    return res.status(201).json({
      success: true,
      message: 'Product review published successfully.',
      data: { id: reviewId, rating: parseInt(rating), comment },
    });
  } catch (err) {
    console.error('addProductReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record customer review.' });
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  addProductReview,
  VALID_CATEGORIES,
};
