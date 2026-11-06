// FarmConnect Government Agricultural Schemes Controller (Phase 18)
// Central & Karnataka State welfare schemes, eligibility rules & direct application portals

const db = require('../config/database');

/**
 * GET /api/schemes
 * Filterable directory of verified agriculture schemes
 */
function getSchemes(req, res) {
  try {
    const { state, category, search } = req.query;

    let query = "SELECT * FROM schemes WHERE status = 'ACTIVE'";
    const params = [];

    if (state && state !== 'ALL') {
      query += ' AND state = ?';
      params.push(state);
    }

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR eligibility LIKE ? OR benefits LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const schemes = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (err) {
    console.error('getSchemes error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve government schemes.' });
  }
}

/**
 * GET /api/schemes/:id
 * Single scheme detailed overview and document requirements
 */
function getSchemeById(req, res) {
  try {
    const { id } = req.params;
    const scheme = db.prepare('SELECT * FROM schemes WHERE id = ?').get(id);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (err) {
    console.error('getSchemeById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load scheme details.' });
  }
}

module.exports = {
  getSchemes,
  getSchemeById,
};
