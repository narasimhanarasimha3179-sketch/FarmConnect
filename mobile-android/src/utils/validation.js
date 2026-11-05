// FarmConnect Validation Utilities
// Form validation tailored for Indian agricultural user profiles, contacts, and land metrics

export const validators = {
  // Mobile numbers in India: 10 digits starting with 6, 7, 8, or 9
  isValidIndianPhone(phone) {
    if (!phone) return false;
    const cleaned = String(phone).replace(/\s+|-/g, '');
    const regex = /^[6-9]\d{9}$/;
    return regex.test(cleaned);
  },

  // Standard Email validation
  isValidEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).trim().toLowerCase());
  },

  // Password requirement: minimum 6 characters
  isValidPassword(password) {
    return typeof password === 'string' && password.trim().length >= 6;
  },

  // Required field check
  isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  },

  // Positive numeric check (prices, weights, quantities)
  isPositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  // Land size in acres: valid non-negative number up to 10,000 acres
  isValidLandSize(acres) {
    const num = Number(acres);
    return !isNaN(num) && num >= 0.1 && num <= 10000;
  },

  // Soil pH: scale 0.0 to 14.0
  isValidSoilPH(ph) {
    const num = Number(ph);
    return !isNaN(num) && num >= 0.0 && num <= 14.0;
  },
};

export default validators;
