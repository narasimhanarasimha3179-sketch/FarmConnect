// FarmConnect Search Routes (Phase 24)
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Global universal search endpoint
router.get('/', searchController.universalSearch);

module.exports = router;
