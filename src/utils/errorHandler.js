import { showErrorToast } from '../components/ToastProvider';

/**
 * Global error handler
 * Tüm hataları merkezi bir yerden yönetir
 */
export class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error kodları ve kullanıcı dostu mesajları
 */
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin',

  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'Email veya şifre hatalı',
  AUTH_USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  AUTH_SESSION_EXPIRED: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın',
  AUTH_UNAUTHORIZED: 'Bu işlem için yetkiniz yok',

  // Database errors
  DB_CONNECTION_ERROR: 'Veritabanı bağlantı hatası',
  DB_QUERY_ERROR: 'Veri işleme hatası',
  DB_DUPLICATE_ENTRY: 'Bu kayıt zaten mevcut',
  DB_NOT_FOUND: 'Kayıt bulunamadı',

  // Validation errors
  VALIDATION_ERROR: 'Lütfen tüm alanları doğru doldurun',
  VALIDATION_EMAIL: 'Geçerli bir email adresi girin',
  VALIDATION_PHONE: 'Geçerli bir telefon numarası girin',
  VALIDATION_REQUIRED: 'Bu alan zorunludur',

  // Business logic errors
  APPOINTMENT_CONFLICT: 'Bu saatte başka bir randevu var',
  APPOINTMENT_PAST_DATE: 'Geçmiş tarihe randevu oluşturamazsınız',
  STAFF_NOT_AVAILABLE: 'Seçilen personel müsait değil',
  SERVICE_NOT_FOUND: 'Hizmet bulunamadı',

  // Generic
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin',
};

/**
 * Supabase error'larını parse et
 */
const parseSupabaseError = (error) => {
  // Auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return { code: 'AUTH_INVALID_CREDENTIALS', message: ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS };
  }
  if (error.message?.includes('User not found')) {
    return { code: 'AUTH_USER_NOT_FOUND', message: ERROR_MESSAGES.AUTH_USER_NOT_FOUND };
  }
  if (error.message?.includes('JWT expired')) {
    return { code: 'AUTH_SESSION_EXPIRED', message: ERROR_MESSAGES.AUTH_SESSION_EXPIRED };
  }

  // Database errors
  if (error.code === '23505') {
    // Unique violation
    return { code: 'DB_DUPLICATE_ENTRY', message: ERROR_MESSAGES.DB_DUPLICATE_ENTRY };
  }
  if (error.code === 'PGRST116') {
    // Not found
    return { code: 'DB_NOT_FOUND', message: ERROR_MESSAGES.DB_NOT_FOUND };
  }

  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
    return { code: 'NETWORK_ERROR', message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  return { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR };
};

/**
 * Ana error handler fonksiyonu
 * @param {Error} error - Yakalanan hata
 * @param {string} context - Hatanın oluştuğu context (örn: 'fetchAppointments')
 * @param {string} userMessage - Kullanıcıya gösterilecek özel mesaj (opsiyonel)
 * @param {boolean} showToast - Toast gösterilsin mi? (default: true)
 * @returns {Object} - { success: false, error: {...} }
 */
export const handleError = (error, context = 'unknown', userMessage = null, showToast = true) => {
  // Console'a detaylı log
  console.error(`[${context}] Error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Supabase error'ını parse et
  const parsedError = parseSupabaseError(error);

  // Kullanıcıya gösterilecek mesaj
  const displayMessage = userMessage || parsedError.message;

  // Toast göster
  if (showToast) {
    showErrorToast(displayMessage);
  }

  // Production'da error tracking servisine gönder
  if (import.meta.env.PROD) {
    // TODO: Sentry.captureException(error, { tags: { context } });
  }

  return {
    success: false,
    error: {
      code: parsedError.code,
      message: displayMessage,
      originalError: import.meta.env.DEV ? error.message : undefined,
    },
  };
};

/**
 * Async fonksiyonları wrap eden helper
 * Try-catch boilerplate'ini ortadan kaldırır
 */
export const withErrorHandler = (fn, context, userMessage) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, context, userMessage);
    }
  };
};

/**
 * API response'larını validate et
 */
export const validateResponse = (response, context) => {
  if (!response) {
    throw new AppError('Empty response received', 'EMPTY_RESPONSE', 500);
  }

  if (response.error) {
    throw new AppError(
      response.error.message || 'API error',
      response.error.code || 'API_ERROR',
      response.error.statusCode || 500
    );
  }

  return response;
};

/**
 * Network timeout wrapper
 */
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new AppError('Request timeout', 'TIMEOUT_ERROR', 408)), timeoutMs)
    ),
  ]);
};

/**
 * Retry logic wrapper
 */
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Network hatalarında retry yap
      if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

export default handleError;
