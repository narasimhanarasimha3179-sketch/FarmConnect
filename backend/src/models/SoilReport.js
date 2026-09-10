const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  farmerName: { type: String, required: true },
  farmLocation: { type: String, default: 'Karnataka' },
  soilType: { 
    type: String, 
    required: true, 
    enum: ['Black Soil', 'Red Loamy', 'Alluvial', 'Sandy Loam', 'Clayey', 'Laterite'] 
  },
  phLevel: { type: Number, required: true },
  nitrogen: { type: Number, required: true },    // kg/ha
  phosphorus: { type: Number, required: true },  // kg/ha
  potassium: { type: Number, required: true },   // kg/ha
  organicCarbon: { type: Number, default: 0.5 }, // %
  healthScore: { type: Number, default: 80 },
  deficiencies: [String],
  fertilizerRecommendations: [String],
  suggestedCrops: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilReport', soilReportSchema);
