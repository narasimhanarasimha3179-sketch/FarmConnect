const express = require('express');
const router = express.Router();
const { User, HarvestLot, StoreProduct } = require('../models');
const externalApiController = require('../controllers/externalApiController');

// Fetch listings
router.get('/marketplace/lots', async (req, res) => {
  try {
    const lots = await HarvestLot.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: lots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create listing (Farmer)
router.post('/marketplace/lots', async (req, res) => {
  try {
    const { farmerName, commodity, category, quantity, basePrice, location } = req.body;

    if (!farmerName || !commodity || !category || !quantity || basePrice === undefined || !location) {
      return res.status(400).json({ success: false, error: 'All lot details are required' });
    }

    const numericBasePrice = Number(basePrice);
    if (isNaN(numericBasePrice) || numericBasePrice <= 0) {
      return res.status(400).json({ success: false, error: 'Base price must be a valid positive number' });
    }

    const newLot = await HarvestLot.create({
      ...req.body,
      basePrice: numericBasePrice,
      currentHighestBid: numericBasePrice,
      totalBids: 0,
    });

    res.status(201).json({ success: true, data: newLot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Place bid (Buyer)
router.post('/marketplace/bid', async (req, res) => {
  try {
    const { lotId, bidAmount } = req.body;

    if (!lotId || bidAmount === undefined) {
      return res.status(400).json({ success: false, error: 'Lot ID and bid amount are required' });
    }

    const numericBid = Number(bidAmount);
    if (isNaN(numericBid) || numericBid <= 0) {
      return res.status(400).json({ success: false, error: 'Bid amount must be a valid positive number' });
    }

    const lot = await HarvestLot.findByPk(lotId);
    if (!lot) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }

    if (numericBid <= lot.currentHighestBid) {
      return res.status(400).json({
        success: false,
        error: `Bid must be higher than the current highest bid of ₹${lot.currentHighestBid}`,
      });
    }

    lot.currentHighestBid = numericBid;
    lot.totalBids += 1;
    await lot.save();

    res.json({ success: true, data: lot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch supplies
router.get('/store/products', async (req, res) => {
  try {
    const products = await StoreProduct.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add supply product (Dealer)
router.post('/store/products', async (req, res) => {
  try {
    const { title, category, price, sellerName } = req.body;

    if (!title || !category || price === undefined || !sellerName) {
      return res.status(400).json({ success: false, error: 'Title, category, price, and seller name are required' });
    }

    const newProduct = await StoreProduct.create({
      ...req.body,
      price: Number(price),
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Live External APIs
router.get('/mandi/rates', externalApiController.getMandiRates);
router.get('/weather/advisory', externalApiController.getWeatherAdvisory);

module.exports = router;