const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: {
    type: DataTypes.ENUM('farmer', 'buyer', 'agri_seller', 'expert'),
    defaultValue: 'farmer',
  },
  state: { type: DataTypes.STRING, defaultValue: 'Karnataka' },
  district: { type: DataTypes.STRING },
  kycVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const HarvestLot = sequelize.define('HarvestLot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  farmerName: { type: DataTypes.STRING, allowNull: false },
  commodity: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.STRING, allowNull: false },
  basePrice: { type: DataTypes.FLOAT, allowNull: false },
  currentHighestBid: { type: DataTypes.FLOAT, allowNull: false },
  totalBids: { type: DataTypes.INTEGER, defaultValue: 0 },
  qualityGrade: { type: DataTypes.STRING, defaultValue: 'Grade A' },
  location: { type: DataTypes.STRING, allowNull: false },
});

const StoreProduct = sequelize.define('StoreProduct', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stockCount: { type: DataTypes.INTEGER, defaultValue: 10 },
  sellerName: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
});

module.exports = { sequelize, User, HarvestLot, StoreProduct };