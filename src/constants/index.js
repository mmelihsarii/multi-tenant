/**
 * Application Constants
 * Tüm magic number'lar ve sabit değerler burada
 */

// ==================== WORKING HOURS ====================
export const WORKING_HOURS = {
  START: 9,
  END: 18,
  START_FORMATTED: '09:00',
  END_FORMATTED: '18:00',
};

// ==================== APPOINTMENT RULES ====================
export const APPOINTMENT_RULES = {
  MIN_ADVANCE_HOURS: 3, // Randevu en az 3 saat önceden alınmalı
  MAX_DURATION_MINUTES: 480, // Maksimum 8 saat
  MIN_DURATION_MINUTES: 15, // Minimum 15 dakika
  DEFAULT_DURATION_MINUTES: 60,
};

// ==================== APPOINTMENT STATUS ====================
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Bekliyor',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Onaylandı',
  [APPOINTMENT_STATUS.COMPLETED]: 'Tamamlandı',
  [APPOINTMENT_STATUS.CANCELLED]: 'İptal',
  [APPOINTMENT_STATUS.NO_SHOW]: 'Gelmedi',
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'warning',
  [APPOINTMENT_STATUS.CONFIRMED]: 'primary',
  [APPOINTMENT_STATUS.COMPLETED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'danger',
  [APPOINTMENT_STATUS.NO_SHOW]: 'default',
};

// ==================== USER ROLES ====================
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Yönetici',
  [USER_ROLES.STAFF]: 'Personel',
  [USER_ROLES.CUSTOMER]: 'Müşteri',
};

// ==================== BUSINESS TYPES ====================
export const BUSINESS_TYPES = {
  BARBER: 'barber',
  SALON: 'salon',
  SPA: 'spa',
  BEAUTY: 'beauty',
  MASSAGE: 'massage',
  OTHER: 'other',
};

export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.BARBER]: 'Berber',
  [BUSINESS_TYPES.SALON]: 'Kuaför / Salon',
  [BUSINESS_TYPES.SPA]: 'Spa',
  [BUSINESS_TYPES.BEAUTY]: 'Güzellik Merkezi',
  [BUSINESS_TYPES.MASSAGE]: 'Masaj Salonu',
  [BUSINESS_TYPES.OTHER]: 'Diğer',
};

// ==================== VALIDATION RULES ====================
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10, // 5XXXXXXXXX
  EMAIL_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  ADDRESS_MAX_LENGTH: 200,
  NOTES_MAX_LENGTH: 500,
};

// ==================== FILE UPLOAD ====================
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
};

// ==================== PAGINATION ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// ==================== DATE & TIME FORMATS ====================
export const DATE_FORMATS = {
  DISPLAY: 'DD.MM.YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'DD MMMM YYYY, HH:mm',
  TIME: 'HH:mm',
};

export const LOCALE = {
  TR: 'tr-TR',
  EN: 'en-US',
};

// ==================== API ====================
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// ==================== RATE LIMITING ====================
export const RATE_LIMIT = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  API_REQUESTS: 100,
  API_WINDOW: 60 * 1000, // 1 minute
};

// ==================== SESSION ====================
export const SESSION = {
  TIMEOUT: 60 * 60 * 1000, // 1 hour
  REFRESH_BEFORE: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  STORAGE_KEY: 'app_session',
};

// ==================== TOAST NOTIFICATIONS ====================
export const TOAST = {
  DURATION: {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 5000,
  },
  POSITION: {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right',
  },
};

// ==================== ROUTES ====================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/appointments',
  SERVICES: '/services',
  STAFF: '/staff',
  SETTINGS: '/settings',
  PUBLIC_BOOKING: '/booking/:companyId',
};

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
};

// ==================== THEME ====================
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// ==================== BREAKPOINTS (Tailwind) ====================
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// ==================== Z-INDEX LAYERS ====================
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};

// ==================== ANIMATION DURATIONS ====================
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export default {
  WORKING_HOURS,
  APPOINTMENT_RULES,
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS,
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  VALIDATION,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  LOCALE,
  API,
  RATE_LIMIT,
  SESSION,
  TOAST,
  ROUTES,
  STORAGE_KEYS,
  THEME,
  BREAKPOINTS,
  Z_INDEX,
  ANIMATION,
};
