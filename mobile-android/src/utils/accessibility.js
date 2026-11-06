// FarmConnect Android Accessibility & Touch Target Standards (Phase 28)
// Adheres to Android Material Design minimum 48dp touch targets and WCAG 2.1 AA/AAA contrast

export const MIN_TOUCH_TARGET = 48;

/**
 * Standard Accessible Touch Target Style
 */
export const accessibleTouchTarget = {
  minWidth: MIN_TOUCH_TARGET,
  minHeight: MIN_TOUCH_TARGET,
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * High-Contrast Sunlight Color Palette for Outdoor Farming Conditions
 */
export const highContrastColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  textPrimary: '#000000',     // 21:1 contrast ratio against white
  textSecondary: '#1C1C1C',   // >14:1 contrast ratio
  primary: '#1B5E20',         // Deep forest green (7.5:1 against white)
  primaryDark: '#003300',
  accent: '#E65100',          // Deep amber / safety orange
  border: '#212121',
  error: '#B71C1C',
  success: '#1B5E20',
};

/**
 * Generates Android TalkBack & Screen Reader Attributes
 */
export function getA11yProps(label, role = 'button', hint = '') {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: role,
    accessibilityHint: hint,
  };
}

export default {
  MIN_TOUCH_TARGET,
  accessibleTouchTarget,
  highContrastColors,
  getA11yProps,
};
