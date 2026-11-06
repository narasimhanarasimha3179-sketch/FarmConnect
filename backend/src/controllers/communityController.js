// FarmConnect Agricultural Community & Social Discussion Controller (Phase 22)
const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/community/posts
 * Fetch community discussion feed
 */
function getCommunityFeed(req, res) {
  try {
    const { sort = 'recent', limit = 20 } = req.query;

    let orderBy = 'created_at DESC';
    if (sort === 'popular') {
      orderBy = 'likes_count DESC, created_at DESC';
    }

    const posts = db.prepare(`
      SELECT p.*, COALESCE(fp.district, 'Mandya') as district, COALESCE(fp.state, 'Karnataka') as state
      FROM community_posts p
      LEFT JOIN farmer_profiles fp ON p.user_id = fp.user_id
      ORDER BY ${orderBy}
      LIMIT ?
    `).all(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err) {
    console.error('getCommunityFeed error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve community feed.' });
  }
}

/**
 * POST /api/community/posts
 * Create new farming question or observation post
 */
function createPost(req, res) {
  try {
    const { title, content, image_url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const postId = 'post_' + crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO community_posts (
        id, user_id, author_name, author_role, title, content, image_url, likes_count, comments_count, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `).run(
      postId,
      req.user.id,
      req.user.name,
      req.user.role,
      title,
      content,
      image_url || null,
      now
    );

    return res.status(201).json({
      success: true,
      message: 'Farming post shared with community.',
      post_id: postId,
    });
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create community post.' });
  }
}

/**
 * GET /api/community/posts/:id
 * Get post details with conversation comments
 */
function getPostDetails(req, res) {
  try {
    const { id } = req.params;

    const post = db.prepare(`
      SELECT p.*, COALESCE(fp.district, 'Mandya') as district, COALESCE(fp.state, 'Karnataka') as state
      FROM community_posts p
      LEFT JOIN farmer_profiles fp ON p.user_id = fp.user_id
      WHERE p.id = ?
    `).get(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Community post not found.' });
    }

    const comments = db.prepare(`
      SELECT c.*, u.role as author_role
      FROM community_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(id);

    return res.status(200).json({
      success: true,
      post,
      comments,
    });
  } catch (err) {
    console.error('getPostDetails error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve post details.' });
  }
}

/**
 * POST /api/community/posts/:id/like
 * Like or upvote a farming discussion post
 */
function likePost(req, res) {
  try {
    const { id } = req.params;

    const post = db.prepare('SELECT id, likes_count FROM community_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const newLikes = (post.likes_count || 0) + 1;
    db.prepare('UPDATE community_posts SET likes_count = ? WHERE id = ?').run(newLikes, id);

    return res.status(200).json({
      success: true,
      message: 'Post liked.',
      likes_count: newLikes,
    });
  } catch (err) {
    console.error('likePost error:', err);
    return res.status(500).json({ success: false, message: 'Failed to like post.' });
  }
}

/**
 * POST /api/community/posts/:id/comment
 * Add expert advice or peer reply to post
 */
function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const post = db.prepare('SELECT id, comments_count FROM community_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const commentId = 'com_' + crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO community_comments (id, post_id, user_id, author_name, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(commentId, id, req.user.id, req.user.name, content.trim(), now);

    const newCommentCount = (post.comments_count || 0) + 1;
    db.prepare('UPDATE community_posts SET comments_count = ? WHERE id = ?').run(newCommentCount, id);

    return res.status(201).json({
      success: true,
      message: 'Comment posted.',
      comment_id: commentId,
      comments_count: newCommentCount,
    });
  } catch (err) {
    console.error('addComment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to post comment.' });
  }
}

module.exports = {
  getCommunityFeed,
  createPost,
  getPostDetails,
  likePost,
  addComment,
};
