// FarmConnect Environment Configuration
// Supports seamless auto-discovery across Web, Physical Mobile Devices (Expo Go), and Emulators

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const HOST_LAN_IP = '172.16.51.144';
const CLOUD_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://farmconnect-api-ibr3.onrender.com/api';

const getDevBaseUrl = () => {
  // If explicitly overridden via env var, use that
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 1. Web browser environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      // If served directly from local backend server (port 5000)
      if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5000') {
        return `${window.location.protocol}//${window.location.hostname}:5000/api`;
      }
      // Running in Expo web dev server (port 8081) or hosted on cloud -> connect to live cloud backend
      return CLOUD_API_URL;
    }
    return CLOUD_API_URL;
  }

  // 2. Physical Android / iOS Device running Expo Go
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const detectedHost = hostUri.split(':')[0];
    if (detectedHost && detectedHost !== 'localhost' && detectedHost !== '127.0.0.1') {
      return `http://${detectedHost}:5000/api`;
    }
  }

  // 3. Fallback to live cloud backend for direct mobile access
  return CLOUD_API_URL;
};

const ENV = {
  development: {
    API_BASE_URL: getDevBaseUrl(),
    API_TIMEOUT_MS: 15000,
    ENABLE_DEBUG_LOGS: true,
    ENABLE_MOCK_FALLBACK: true,
    ENVIRONMENT_NAME: 'development',
    APP_VERSION: '1.0.0-phase32',
  },
  production: {
    API_BASE_URL: CLOUD_API_URL,
    API_TIMEOUT_MS: 15000,
    ENABLE_DEBUG_LOGS: false,
    ENABLE_MOCK_FALLBACK: true,
    ENVIRONMENT_NAME: 'production',
    APP_VERSION: '1.0.0',
  },
};

const currentEnv = __DEV__ ? ENV.development : ENV.production;

export default currentEnv;
export { ENV };
