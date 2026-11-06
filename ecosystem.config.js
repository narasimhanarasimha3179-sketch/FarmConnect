// FarmConnect Production PM2 Cluster Configuration (Phase 31)
module.exports = {
  apps: [
    {
      name: 'farmconnect-api',
      script: 'backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
