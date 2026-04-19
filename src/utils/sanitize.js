import DOMPurify from 'dompurify';

/**
 * XSS saldırılarına karşı input'ları temizler
 * @param {string} input - Temizlenecek string
 * @returns {string} - Temizlenmiş string
 */
export const sanitizeInput = (input) => {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return input;

  // DOMPurify ile HTML/Script injection'ı temizle
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Hiçbir HTML tag'ine izin verme
    ALLOWED_ATTR: [], // Hiçbir attribute'e izin verme
  });

  return cleaned.trim();
};

/**
 * HTML içeriğini güvenli hale getirir (bazı tag'lere izin verir)
 * @param {string} html - HTML içeriği
 * @returns {string} - Temizlenmiş HTML
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';
  if (typeof html !== 'string') return '';

  // Güvenli HTML tag'lerine izin ver
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
  });
};

/**
 * Obje içindeki tüm string değerleri temizler
 * @param {Object} obj - Temizlenecek obje
 * @returns {Object} - Temizlenmiş obje
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * SQL Injection'a karşı özel karakterleri escape eder
 * Not: Supabase zaten parametreli sorgular kullanır, bu ekstra güvenlik katmanı
 * @param {string} input - Escape edilecek string
 * @returns {string} - Escape edilmiş string
 */
export const escapeSqlInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/'/g, "''") // Single quote escape
    .replace(/\\/g, '\\\\') // Backslash escape
    .replace(/\0/g, '\\0') // Null byte
    .replace(/\n/g, '\\n') // New line
    .replace(/\r/g, '\\r') // Carriage return
    .replace(/\x1a/g, '\\Z'); // Ctrl+Z
};

/**
 * Email adresini normalize eder
 * @param {string} email - Email adresi
 * @returns {string} - Normalize edilmiş email
 */
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') return email;

  return sanitizeInput(email).toLowerCase().trim();
};

/**
 * Telefon numarasını normalize eder (sadece rakamlar)
 * @param {string} phone - Telefon numarası
 * @returns {string} - Normalize edilmiş telefon
 */
export const normalizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;

  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, '');

  // 0 ile başlıyorsa kaldır
  return cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
};

/**
 * URL'yi validate eder ve temizler
 * @param {string} url - URL
 * @returns {string|null} - Geçerli URL veya null
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);

    // Sadece http ve https protokollerine izin ver
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    return urlObj.href;
  } catch (error) {
    return null;
  }
};

/**
 * Dosya adını güvenli hale getirir
 * @param {string} filename - Dosya adı
 * @returns {string} - Güvenli dosya adı
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return 'file';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Özel karakterleri underscore ile değiştir
    .replace(/\.{2,}/g, '.') // Çoklu noktaları tek noktaya indir
    .replace(/^\.+/, '') // Başındaki noktaları kaldır
    .slice(0, 255); // Maksimum 255 karakter
};

/**
 * Rate limiting için basit bir helper
 * @param {string} key - Unique key (örn: user_id, ip_address)
 * @param {number} maxAttempts - Maksimum deneme sayısı
 * @param {number} windowMs - Zaman penceresi (milisaniye)
 * @returns {boolean} - İzin verilip verilmediği
 */
const rateLimitStore = new Map();

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    // Zaman penceresi doldu, sıfırla
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Limit aşıldı
  }

  // Sayacı artır
  record.count++;
  return true;
};

/**
 * Rate limit store'u temizle (memory leak önleme)
 */
export const clearExpiredRateLimits = () => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Her 5 dakikada bir expired rate limit kayıtlarını temizle
if (typeof window !== 'undefined') {
  setInterval(clearExpiredRateLimits, 5 * 60 * 1000);
}
