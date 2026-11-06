// FarmConnect Agricultural Community Routes (Phase 22)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const communityController = require('../controllers/communityController');

// Feed is open to browse
router.get('/posts', communityController.getCommunityFeed);
router.get('/posts/:id', communityController.getPostDetails);

// Creating posts, liking, and commenting requires authentication
router.post('/posts', authenticate, communityController.createPost);
router.post('/posts/:id/like', authenticate, communityController.likePost);
router.post('/posts/:id/comment', authenticate, communityController.addComment);

module.exports = router;
