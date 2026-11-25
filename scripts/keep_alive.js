// FarmConnect Cloud Keep-Alive Script
// Prevents Render Free Tier cold-sleep by pinging health endpoint every 10 minutes

const https = require('https');

const CLOUD_URL = process.env.CLOUD_URL || 'https://farmconnect-api.onrender.com/api/health';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

console.log(`[Keep-Alive] Monitoring FarmConnect live cloud backend: ${CLOUD_URL}`);

function pingServer() {
  const req = https.get(CLOUD_URL, (res) => {
    console.log(`[Keep-Alive] Ping sent at ${new Date().toLocaleTimeString()} -> Status: ${res.statusCode} OK`);
  });

  req.on('error', (err) => {
    console.warn(`[Keep-Alive] Ping notice at ${new Date().toLocaleTimeString()}: ${err.message}`);
  });
}

// Initial ping
pingServer();

// Recurring ping every 10 minutes
setInterval(pingServer, INTERVAL_MS);
