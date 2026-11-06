// FarmConnect Agricultural Knowledge Base & Digital Library Controller (Phase 23)
const db = require('../config/database');

/**
 * GET /api/library/articles
 * Fetch agronomic articles with category filtering & keyword search
 */
function getArticles(req, res) {
  try {
    const { category, search, limit = 20 } = req.query;

    let query = 'SELECT * FROM library_articles WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category.toUpperCase());
    }

    if (search) {
      query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY published_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const articles = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error('getArticles error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve library articles.' });
  }
}

/**
 * GET /api/library/articles/:id
 * Get full article details
 */
function getArticleById(req, res) {
  try {
    const { id } = req.params;

    const article = db.prepare('SELECT * FROM library_articles WHERE id = ?').get(id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Library article not found.' });
    }

    return res.status(200).json({
      success: true,
      article,
    });
  } catch (err) {
    console.error('getArticleById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve article details.' });
  }
}

/**
 * GET /api/library/categories
 * List article categories and counts
 */
function getCategories(req, res) {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as article_count
      FROM library_articles
      GROUP BY category
      ORDER BY article_count DESC
    `).all();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

module.exports = {
  getArticles,
  getArticleById,
  getCategories,
};
