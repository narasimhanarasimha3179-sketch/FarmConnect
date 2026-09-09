export const COLORS = {
  primary: '#1b5e20',          // Deep agricultural forest green
  primaryLight: '#2e7d32',     // Action button green
  accent: '#4CAF50',           // Focus and highlight green
  accentSoft: '#e8f5e9',       // Soft mint background for badges
  background: '#f8fafc',       // Crisp neutral light background
  surface: '#ffffff',          // Card and container surface
  textPrimary: '#111827',      // High contrast heading text
  textSecondary: '#4b5563',    // Subtitle and descriptor text
  textMuted: '#9ca3af',        // Placeholder and disabled text
  border: '#e2e8f0',           // Card and divider borders
  danger: '#dc2626',           // Critical disease alerts & validation errors
  dangerSoft: '#fee2e2',       // Light red pill background
  warning: '#d97706',          // Cautionary severity indicator
  warningSoft: '#fef3c7',      // Cautionary background
  success: '#16a34a',          // Healthy crop status indicator
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const API_CONFIG = {
  BASE_URL: 'http://10.95.149.144:5000/api',
  TIMEOUT_MS: 10000,
};