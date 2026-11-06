// FarmConnect Validation Utilities
// Form validation tailored for Indian agricultural user profiles, contacts, and land metrics

export const validators = {
  // Mobile numbers in India: 10 digits starting with 6, 7, 8, or 9
  // Accepts standard 10-digit, +91, 91 prefix, leading 0, and spaced/dashed formats
  isValidIndianPhone(phone) {
    if (!phone) return false;
    let cleaned = String(phone).replace(/[\s\-\(\)\+\.]/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
    if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
    const regex = /^[6-9]\d{9}$/;
    return regex.test(cleaned);
  },

  // Normalizes any valid Indian phone number into standard 10 digits
  cleanIndianPhone(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[\s\-\(\)\+\.]/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
    if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
    return cleaned;
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
