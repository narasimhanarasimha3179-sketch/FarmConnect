// FarmConnect Server Entry Point
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🌱 FarmConnect Backend Server Running on Port ${PORT}`);
  console.log(` 🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` 📡 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(` 🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`=======================================================`);
});

module.exports = server;
