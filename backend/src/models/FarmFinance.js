const mongoose = require('mongoose');

const farmFinanceSchema = new mongoose.Schema({
  farmerId: { type: String, default: 'farmer-primary' },
  cropSeason: { type: String, required: true }, // e.g., "Kharif 2026 - Sona Masoori"
  acreage: { type: Number, default: 1 },
  expenses: [
    {
      category: {
        type: String,
        enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Machinery & Fuel', 'Irrigation', 'Transport', 'Other'],
        required: true
      },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      description: { type: String, default: '' }
    }
  ],
  revenue: [
    {
      mandiOrBuyer: { type: String, required: true },
      quantityQuintals: { type: Number, required: true },
      pricePerQuintal: { type: Number, required: true },
      totalSaleAmount: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FarmFinance', farmFinanceSchema);
