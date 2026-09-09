const express = require('express');
const router = express.Router();
const { User, HarvestLot, StoreProduct } = require('../models');

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
    const newLot = await HarvestLot.create(req.body);
    res.status(201).json({ success: true, data: newLot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Place bid (Buyer)
router.post('/marketplace/bid', async (req, res) => {
  try {
    const { lotId, bidAmount } = req.body;
    const lot = await HarvestLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    if (bidAmount <= lot.currentHighestBid) {
      return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
    }

    lot.currentHighestBid = bidAmount;
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
    const products = await StoreProduct.findAll();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;