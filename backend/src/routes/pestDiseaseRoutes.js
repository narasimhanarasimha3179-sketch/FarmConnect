// FarmConnect Pest & Disease Routes (Phase 13)
const express = require('express');
const router = express.Router();
const pestDiseaseController = require('../controllers/pestDiseaseController');

router.get('/', pestDiseaseController.getPestsAndDiseases);
router.get('/:id', pestDiseaseController.getPestDiseaseById);
router.post('/diagnose', pestDiseaseController.diagnoseSymptoms);

module.exports = router;
