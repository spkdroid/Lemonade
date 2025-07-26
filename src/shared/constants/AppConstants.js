/**
 * Application Constants
 */

// Storage Keys
export const STORAGE_KEYS = {
  CART_DATA: '@cart_data',
  DELIVERY_INFO: '@delivery_info',
  MENU_DATA: '@menu_data',
  USER_PREFERENCES: '@user_preferences'
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.lemonadestand.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Business Rules
export const BUSINESS_RULES = {
  MIN_ORDER_VALUE: 5.00,
  FREE_DELIVERY_THRESHOLD: 30.00,
  BASE_DELIVERY_FEE: 5.99,
  EXPRESS_DELIVERY_FEE: 3.99,
  TAX_RATE: 0.085,
  DISCOUNT_THRESHOLD: 50.00,
  DISCOUNT_RATE: 0.05,
  MAX_QUANTITY_PER_ITEM: 10,
  DELIVERY_TIME_STANDARD: '30-45 minutes',
  DELIVERY_TIME_EXPRESS: '15-25 minutes'
};

// UI Constants
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#FF6B6B',
    SECONDARY: '#4ECDC4',
    SUCCESS: '#38A169',
    ERROR: '#E53E3E',
    WARNING: '#D69E2E',
    INFO: '#3182CE',
    LIGHT_GRAY: '#F7FAFC',
    MEDIUM_GRAY: '#A0AEC0',
    DARK_GRAY: '#2D3748',
    WHITE: '#FFFFFF',
    BLACK: '#000000'
  },
  SIZES: {
    BORDER_RADIUS: 8,
    BORDER_RADIUS_LARGE: 12,
    SPACING_XS: 4,
    SPACING_SM: 8,
    SPACING_MD: 16,
    SPACING_LG: 24,
    SPACING_XL: 32,
    FONT_SIZE_XS: 12,
    FONT_SIZE_SM: 14,
    FONT_SIZE_MD: 16,
    FONT_SIZE_LG: 18,
    FONT_SIZE_XL: 24,
    FONT_SIZE_XXL: 32
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  ADDRESS_MIN_LENGTH: 5,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
  ZIP_CODE_PATTERN: /^\d{5}(-\d{4})?$/
};

// Menu Categories
export const MENU_CATEGORIES = {
  LEMONADES: 'lemonades',
  SMOOTHIES: 'smoothies',
  ICED_TEAS: 'iced_teas',
  HOT_DRINKS: 'hot_drinks',
  SNACKS: 'snacks'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};
