// FarmConnect Live Mandi Prices & Market Telemetry Controller (Phase 9)
// Verified APMC rates, historical trends, mandi comparisons & price alerts

const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/mandi/rates
 * Live APMC mandi price ticker with multi-faceted filtering
 */
function getMandiRates(req, res) {
  try {
    const { commodity, district, state = 'Karnataka', market_mandi, search, sort = 'date_desc' } = req.query;

    let query = 'SELECT * FROM mandi_prices WHERE 1=1';
    const params = [];

    if (commodity) {
      query += ' AND commodity = ?';
      params.push(commodity);
    }

    if (district) {
      query += ' AND district = ?';
      params.push(district);
    }

    if (state && state !== 'ALL') {
      query += ' AND state = ?';
      params.push(state);
    }

    if (market_mandi) {
      query += ' AND market_mandi = ?';
      params.push(market_mandi);
    }

    if (search) {
      query += ' AND (commodity LIKE ? OR variety LIKE ? OR market_mandi LIKE ? OR district LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    switch (sort) {
      case 'price_high':
        query += ' ORDER BY modal_price DESC';
        break;
      case 'price_low':
        query += ' ORDER BY modal_price ASC';
        break;
      case 'commodity':
        query += ' ORDER BY commodity ASC, arrival_date DESC';
        break;
      case 'date_desc':
      default:
        query += ' ORDER BY arrival_date DESC, modal_price DESC';
        break;
    }

    query += ' LIMIT 100';

    const rates = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: rates.length,
      data: rates,
    });
  } catch (err) {
    console.error('getMandiRates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve mandi rates.' });
  }
}

/**
 * GET /api/mandi/commodities
 * List distinct commodities with current state-wide modal price
 */
function getCommodities(req, res) {
  try {
    const commodities = db.prepare(`
      SELECT commodity, variety, AVG(modal_price) as avg_modal_price,
             MIN(min_price) as state_min, MAX(max_price) as state_max,
             COUNT(DISTINCT market_mandi) as mandis_reporting,
             MAX(arrival_date) as latest_date
      FROM mandi_prices
      GROUP BY commodity
      ORDER BY commodity ASC
    `).all();

    return res.status(200).json({
      success: true,
      count: commodities.length,
      data: commodities.map((c) => ({
        ...c,
        avg_modal_price: Math.round(c.avg_modal_price),
      })),
    });
  } catch (err) {
    console.error('getCommodities error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve commodities list.' });
  }
}

/**
 * GET /api/mandi/history
 * Chronological price history for trend graphs
 */
function getPriceHistory(req, res) {
  try {
    const { commodity, market_mandi, days = 14 } = req.query;

    if (!commodity) {
      return res.status(400).json({ success: false, message: 'Commodity parameter is required.' });
    }

    let query = `
      SELECT arrival_date as date, modal_price, min_price, max_price, trend, market_mandi
      FROM mandi_prices
      WHERE commodity = ?
    `;
    const params = [commodity];

    if (market_mandi) {
      query += ' AND market_mandi = ?';
      params.push(market_mandi);
    }

    query += ' ORDER BY arrival_date ASC LIMIT ?';
    params.push(parseInt(days));

    const history = db.prepare(query).all(...params);

    // Compute trend direction
    let overallTrend = 'STABLE';
    if (history.length >= 2) {
      const firstPrice = history[0].modal_price;
      const lastPrice = history[history.length - 1].modal_price;
      if (lastPrice > firstPrice) overallTrend = 'UP';
      else if (lastPrice < firstPrice) overallTrend = 'DOWN';
    }

    return res.status(200).json({
      success: true,
      commodity,
      market_mandi: market_mandi || 'All Markets Average',
      overall_trend: overallTrend,
      points_count: history.length,
      data: history,
    });
  } catch (err) {
    console.error('getPriceHistory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve price history.' });
  }
}

/**
 * GET /api/mandi/comparison
 * Compare commodity price across different district APMC markets
 */
function getMarketComparison(req, res) {
  try {
    const { commodity } = req.query;

    if (!commodity) {
      return res.status(400).json({ success: false, message: 'Commodity parameter is required.' });
    }

    const comparison = db.prepare(`
      SELECT market_mandi, district, state, modal_price, min_price, max_price, trend, arrival_date
      FROM mandi_prices
      WHERE commodity = ?
      ORDER BY modal_price DESC
    `).all(commodity);

    return res.status(200).json({
      success: true,
      commodity,
      markets_compared: comparison.length,
      data: comparison,
    });
  } catch (err) {
    console.error('getMarketComparison error:', err);
    return res.status(500).json({ success: false, message: 'Failed to compare mandi rates.' });
  }
}

/**
 * POST /api/mandi/alerts
 * Set target price notification alert for a crop
 */
function createPriceAlert(req, res) {
  try {
    const { commodity, market_mandi, target_price, condition = 'ABOVE' } = req.body;

    if (!commodity || !target_price) {
      return res.status(400).json({ success: false, message: 'Commodity and target price are required.' });
    }

    const id = 'alert_' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO price_alerts (id, user_id, commodity, market_mandi, target_price, condition, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(
      id,
      req.user.id,
      commodity,
      market_mandi || 'Any APMC',
      parseFloat(target_price),
      condition,
      now
    );

    return res.status(201).json({
      success: true,
      message: `Price alert activated for ${commodity} when rate reaches ₹${target_price}.`,
      data: { id, commodity, market_mandi: market_mandi || 'Any APMC', target_price, condition, status: 'ACTIVE' },
    });
  } catch (err) {
    console.error('createPriceAlert error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create price alert.' });
  }
}

/**
 * GET /api/mandi/alerts
 * Retrieve user's configured price alerts
 */
function getUserPriceAlerts(req, res) {
  try {
    const alerts = db.prepare(`
      SELECT * FROM price_alerts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    console.error('getUserPriceAlerts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user price alerts.' });
  }
}

/**
 * DELETE /api/mandi/alerts/:id
 * Remove price alert
 */
function deletePriceAlert(req, res) {
  try {
    const { id } = req.params;
    const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Price alert not found.' });
    }

    if (alert.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this alert.' });
    }

    db.prepare('DELETE FROM price_alerts WHERE id = ?').run(id);

    return res.status(200).json({
      success: true,
      message: 'Price alert deleted successfully.',
    });
  } catch (err) {
    console.error('deletePriceAlert error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete price alert.' });
  }
}

module.exports = {
  getMandiRates,
  getCommodities,
  getPriceHistory,
  getMarketComparison,
  createPriceAlert,
  getUserPriceAlerts,
  deletePriceAlert,
};
