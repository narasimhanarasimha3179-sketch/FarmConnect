// FarmConnect Universal Multi-Domain Search Controller (Phase 24)
const db = require('../config/database');

/**
 * GET /api/search
 * Universal search across Products, Crops, Schemes, Mandi, Guides, and Library
 */
function universalSearch(req, res) {
  try {
    const { q, type } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query parameter (q) is required.' });
    }

    const term = `%${q.trim()}%`;
    const results = {
      products: [],
      crops: [],
      schemes: [],
      mandi: [],
      guides: [],
      articles: [],
    };

    // 1. Search Products
    if (!type || type === 'products') {
      results.products = db.prepare(`
        SELECT id, title, category, price, unit, image_url, rating
        FROM products
        WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
        LIMIT 6
      `).all(term, term, term);
    }

    // 2. Search Direct Market Crops
    if (!type || type === 'crops') {
      results.crops = db.prepare(`
        SELECT id, crop_name, variety, expected_price, unit, mandi_location, quality_grade, image_url
        FROM crops_market
        WHERE crop_name LIKE ? OR variety LIKE ? OR mandi_location LIKE ?
        LIMIT 6
      `).all(term, term, term);
    }

    // 3. Search Schemes
    if (!type || type === 'schemes') {
      results.schemes = db.prepare(`
        SELECT id, title, state, category, benefits, application_url
        FROM schemes
        WHERE title LIKE ? OR benefits LIKE ? OR category LIKE ?
        LIMIT 5
      `).all(term, term, term);
    }

    // 4. Search Mandi Prices
    if (!type || type === 'mandi') {
      results.mandi = db.prepare(`
        SELECT id, commodity, variety, market_mandi, district, modal_price, trend
        FROM mandi_prices
        WHERE commodity LIKE ? OR market_mandi LIKE ? OR district LIKE ?
        LIMIT 6
      `).all(term, term, term);
    }

    // 5. Search Crop Cultivation Guides
    if (!type || type === 'guides') {
      results.guides = db.prepare(`
        SELECT id, crop_name, season, soil_type, climate
        FROM crop_guides
        WHERE crop_name LIKE ? OR season LIKE ?
        LIMIT 4
      `).all(term, term);
    }

    // 6. Search Library Articles
    if (!type || type === 'articles') {
      results.articles = db.prepare(`
        SELECT id, title, category, read_time_mins, summary
        FROM library_articles
        WHERE title LIKE ? OR summary LIKE ? OR content LIKE ?
        LIMIT 5
      `).all(term, term, term);
    }

    // Flatten into unified search results list
    const consolidated = [
      ...results.products.map((p) => ({
        domain: 'PRODUCT',
        id: p.id,
        title: p.title,
        subtitle: `₹${p.price}/${p.unit} • ${p.category}`,
        badge: 'Store Product',
        image_url: p.image_url,
      })),
      ...results.crops.map((c) => ({
        domain: 'CROP_MARKET',
        id: c.id,
        title: `${c.crop_name} (${c.variety})`,
        subtitle: `₹${c.expected_price}/${c.unit} • ${c.mandi_location}`,
        badge: 'Direct Farm Harvest',
        image_url: c.image_url,
      })),
      ...results.schemes.map((s) => ({
        domain: 'SCHEME',
        id: s.id,
        title: s.title,
        subtitle: `${s.state} • ${s.category}`,
        badge: 'Govt Subsidy',
        url: s.application_url,
      })),
      ...results.mandi.map((m) => ({
        domain: 'MANDI',
        id: m.id,
        title: `${m.commodity} @ ${m.market_mandi}`,
        subtitle: `Modal: ₹${m.modal_price}/Quintal (${m.trend})`,
        badge: 'Live APMC Rate',
      })),
      ...results.guides.map((g) => ({
        domain: 'GUIDE',
        id: g.id,
        title: `${g.crop_name} Cultivation Guide`,
        subtitle: `Season: ${g.season} • Soil: ${g.soil_type}`,
        badge: 'Farming Advisory',
      })),
      ...results.articles.map((a) => ({
        domain: 'LIBRARY',
        id: a.id,
        title: a.title,
        subtitle: `${a.category} • ${a.read_time_mins} min read`,
        badge: 'Digital Library',
      })),
    ];

    return res.status(200).json({
      success: true,
      query: q,
      total_matches: consolidated.length,
      categorized: results,
      items: consolidated,
    });
  } catch (err) {
    console.error('universalSearch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to execute global search.' });
  }
}

module.exports = {
  universalSearch,
};
