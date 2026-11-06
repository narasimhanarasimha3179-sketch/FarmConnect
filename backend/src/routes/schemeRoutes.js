// FarmConnect Government Scheme Routes (Phase 18)
const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');

router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);

module.exports = router;
