// FarmConnect Authentication Context & Session Engine
// Manages real JWT sessions, role-based state, and user profiles across all 4 roles

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import logger from '../services/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Set auth token on apiClient whenever token changes
  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token);
    } else {
      apiClient.clearAuthToken();
    }
  }, [token]);

  // Login handler
  const login = useCallback(async (identifier, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await apiClient.post('/auth/login', { identifier, password });
      if (res.success && res.data && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        logger.info('AuthContext', `User logged in: ${res.data.user.email} (${res.data.user.role})`);
        setIsLoading(false);
        return { success: true, user: res.data.user };
      } else {
        const errorMsg = (res.data && res.data.message) || res.message || 'Login failed. Please check your credentials.';
        setAuthError(errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const msg = err.message || 'Network error during login.';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  }, []);

  // Register handler
  const register = useCallback(async (registrationData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await apiClient.post('/auth/register', registrationData);
      if (res.success && res.data && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        logger.info('AuthContext', `User registered: ${res.data.user.email} (${res.data.user.role})`);
        setIsLoading(false);
        return { success: true, user: res.data.user };
      } else {
        const errorMsg = (res.data && res.data.message) || res.message || 'Registration failed.';
        setAuthError(errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const msg = err.message || 'Network error during registration.';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    logger.info('AuthContext', 'User logged out');
    setToken(null);
    setUser(null);
    setAuthError(null);
    apiClient.clearAuthToken();
  }, []);

  // Profile update
  const updateProfile = useCallback(async (updateData) => {
    setIsLoading(true);
    try {
      const res = await apiClient.put('/auth/profile', updateData);
      if (res.success && res.data && res.data.user) {
        setUser(res.data.user);
        setIsLoading(false);
        return { success: true, user: res.data.user };
      } else {
        setIsLoading(false);
        return { success: false, message: res.data?.message || res.message || 'Update failed' };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: err.message };
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (identifier) => {
    return apiClient.post('/auth/forgot-password', { identifier });
  }, []);

  // Reset password
  const resetPassword = useCallback(async (identifier, reset_code, new_password) => {
    return apiClient.post('/auth/reset-password', { identifier, reset_code, new_password });
  }, []);

  const value = {
    user,
    token,
    role: user ? user.role : null,
    isAuthenticated: !!user && !!token,
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
