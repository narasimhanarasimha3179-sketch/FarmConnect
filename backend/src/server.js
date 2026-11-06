// FarmConnect Server Entry Point
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const LAN_IP = '172.16.51.144';

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` 🌱 FarmConnect Backend Server Running on Port ${PORT}`);
  console.log(` 🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` 📡 Local Health:  http://localhost:${PORT}/api/health`);
  console.log(` 📱 Mobile LAN:    http://${LAN_IP}:${PORT}/api/health`);
  console.log(` 🔐 Auth Endpoint: http://${LAN_IP}:${PORT}/api/auth/*`);
  console.log(`=======================================================`);
});

module.exports = server;
