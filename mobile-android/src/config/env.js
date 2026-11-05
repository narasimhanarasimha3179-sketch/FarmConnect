// FarmConnect Environment Configuration
// Supports seamless switching between local development, staging, and production

const ENV = {
  development: {
    API_BASE_URL: 'http://10.0.2.2:5000/api', // Standard Android Emulator localhost mapping
    API_TIMEOUT_MS: 15000,
    ENABLE_DEBUG_LOGS: true,
    ENABLE_MOCK_FALLBACK: true,
    ENVIRONMENT_NAME: 'development',
    APP_VERSION: '1.0.0-phase1',
  },
  production: {
    API_BASE_URL: 'https://api.farmconnect.gov.in/api',
    API_TIMEOUT_MS: 10000,
    ENABLE_DEBUG_LOGS: false,
    ENABLE_MOCK_FALLBACK: false,
    ENVIRONMENT_NAME: 'production',
    APP_VERSION: '1.0.0',
  },
};

const currentEnv = __DEV__ ? ENV.development : ENV.production;

export default currentEnv;
export { ENV };
