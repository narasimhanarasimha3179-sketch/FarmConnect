// FarmConnect Environment Configuration
// Supports seamless auto-discovery across Web, Physical Mobile Devices (Expo Go), and Emulators

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const HOST_LAN_IP = '172.16.51.144';

const getDevBaseUrl = () => {
  // 1. Web browser environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:5000/api`;
    }
    return `http://${HOST_LAN_IP}:5000/api`;
  }

  // 2. Physical Android / iOS Device running Expo Go
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const detectedHost = hostUri.split(':')[0];
    if (detectedHost && detectedHost !== 'localhost' && detectedHost !== '127.0.0.1') {
      return `http://${detectedHost}:5000/api`;
    }
  }

  // 3. Fallback to physical Wi-Fi IP for direct mobile LAN access
  return `http://${HOST_LAN_IP}:5000/api`;
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
    API_BASE_URL: `http://${HOST_LAN_IP}:5000/api`,
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
