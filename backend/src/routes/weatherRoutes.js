// FarmConnect Weather & Agro-Meteorology Routes (Phase 10)
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Public Weather Endpoints
router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getWeatherForecast);
router.get('/advisories', weatherController.getWeatherAdvisories);
router.get('/districts', weatherController.getSupportedDistricts);

module.exports = router;
