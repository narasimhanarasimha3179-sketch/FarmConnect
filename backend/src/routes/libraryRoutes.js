// FarmConnect Agricultural Library Routes (Phase 23)
const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

// Digital library articles & categories (Public reading access)
router.get('/articles', libraryController.getArticles);
router.get('/articles/:id', libraryController.getArticleById);
router.get('/categories', libraryController.getCategories);

module.exports = router;
