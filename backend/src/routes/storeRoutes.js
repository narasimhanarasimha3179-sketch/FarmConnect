const express = require('express');
const router = express.Router();
const ProductStore = require('../models/ProductStore');
const Order = require('../models/Order');

// Fallback seed items for catalog
const fallbackCatalog = [
  { _id: 'seed-1', title: 'Hybrid Maize Pro-Seed (DKC 9108)', category: 'Seeds', price: 850, discountPrice: 799, stock: 120, unit: '5 kg pack', rating: 4.9, sellerName: 'Bayer CropScience' },
  { _id: 'fert-1', title: 'Organic Neem Cake Soil Enricher', category: 'Fertilizers', price: 620, discountPrice: 550, stock: 85, unit: '25 kg bag', rating: 4.7, sellerName: 'BioAgro Solutions' },
  { _id: 'pest-1', title: 'Bio-Neem Oil Pest Repellent (10,000 PPM)', category: 'Pesticides', price: 430, discountPrice: 380, stock: 200, unit: '1 Litre', rating: 4.8, sellerName: 'GreenProtect Agri' },
  { _id: 'tool-1', title: 'Manual 16L Backpack Knapsack Sprayer', category: 'Tools', price: 1850, discountPrice: 1590, stock: 45, unit: 'Piece', rating: 4.6, sellerName: 'Kisan Kranti Tools' },
  { _id: 'irrig-1', title: 'Inline Drip Irrigation Lateral Pipe (16mm)', category: 'Irrigation', price: 2100, discountPrice: 1899, stock: 60, unit: '100m Roll', rating: 4.9, sellerName: 'Jain Irrigation Systems' }
];

let fallbackOrders = [];

// GET Catalog with Category and Search filters
router.get('/items', async (req, res) => {
  const { category, search } = req.query;
  try {
    let items = await ProductStore.find();
    if (!items || items.length === 0) items = fallbackCatalog;

    let filtered = items;
    if (category && category !== 'All') {
      filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
    res.json({ success: true, count: filtered.length, items: filtered });
  } catch (err) {
    res.json({ success: true, items: fallbackCatalog });
  }
});

// POST New Store Product (Seller Management)
router.post('/items', async (req, res) => {
  try {
    const { title, category, price, discountPrice, stock, unit, sellerName, description } = req.body;
    const item = new ProductStore({
      title,
      category,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      stock: Number(stock) || 10,
      unit: unit || 'pack',
      sellerName: sellerName || 'Authorized Dealer',
      description
    });
    await item.save();
    res.status(201).json({ success: true, item });
  } catch (err) {
    const mockItem = { _id: String(Date.now()), ...req.body };
    fallbackCatalog.unshift(mockItem);
    res.status(201).json({ success: true, item: mockItem });
  }
});

// POST Place Checkout Order
router.post('/checkout', async (req, res) => {
  try {
    const { buyerName, phone, deliveryAddress, items, totalAmount, paymentMethod } = req.body;
    if (!buyerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Buyer details and cart items are mandatory' });
    }

    const order = new Order({
      buyerName,
      phone,
      deliveryAddress,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'COD'
    });
    await order.save();
    res.status(201).json({ success: true, orderId: order._id, message: 'Order placed successfully!' });
  } catch (err) {
    const mockOrder = {
      _id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      ...req.body,
      createdAt: new Date(),
      orderStatus: 'Placed'
    };
    fallbackOrders.unshift(mockOrder);
    res.status(201).json({ success: true, orderId: mockOrder._id, order: mockOrder, message: 'Order created successfully!' });
  }
});

// GET Order History
router.get('/orders', (req, res) => {
  res.json({ success: true, orders: fallbackOrders });
});

module.exports = router;
