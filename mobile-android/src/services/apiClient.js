// FarmConnect Core API Client & Global Network Service
// Lightweight, fetch-based, offline-aware HTTP client with global error normalization

import env from '../config/env';
import logger from './logger';

class ApiClient {
  constructor() {
    this.baseURL = env.API_BASE_URL;
    this.timeout = env.API_TIMEOUT_MS;
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
    logger.debug('ApiClient', 'Auth token updated in client state');
  }

  clearAuthToken() {
    this.authToken = null;
    logger.debug('ApiClient', 'Auth token cleared');
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-App-Platform': 'Android',
      'X-App-Version': env.APP_VERSION,
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      method,
      headers,
      ...(options.body ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {}),
    };

    logger.debug('ApiClient', `Outgoing ${method} -> ${url}`);

    // Timeout controller using AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timer);

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorPayload = {
          success: false,
          status: response.status,
          message: (data && data.message) || `HTTP Error ${response.status}`,
          code: (data && data.code) || 'HTTP_ERROR',
          data,
        };
        logger.error('ApiClient', `HTTP Error on ${method} ${url}`, errorPayload);
        return errorPayload;
      }

      logger.debug('ApiClient', `Response 200 from ${method} ${url}`);
      return {
        success: true,
        status: response.status,
        data,
      };
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err.name === 'AbortError';
      const normalizedError = {
        success: false,
        status: isTimeout ? 408 : 0,
        message: isTimeout
          ? 'Network timeout. Please check your internet connection or try again.'
          : err.message || 'Unable to connect to the FarmConnect server.',
        code: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
        details: err,
      };
      logger.error('ApiClient', `Network failure on ${method} ${url}`, normalizedError);
      return normalizedError;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
