// Dosya Yolu: src/utils/helpers.js

/**
 * Tarihi formatlar
 * @param {Date|string} date - Tarih
 * @returns {string} - Formatlanmış tarih
 */
export const formatDate = (date) => {
  if (!date) return 'Invalid Date';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Saati formatlar
 * @param {Date|string} date - Tarih/Saat
 * @returns {string} - Formatlanmış saat
 */
export const formatTime = (date) => {
  if (!date) return 'Invalid Time';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Time';

    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (error) {
    return 'Invalid Time';
  }
};

/**
 * Para birimini formatlar
 * @param {number} amount - Miktar
 * @param {string} currency - Para birimi (TRY, USD, EUR)
 * @returns {string} - Formatlanmış para
 */
export const formatCurrency = (amount, currency = 'TRY') => {
  if (typeof amount !== 'number') return '0';

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

/**
 * Slug oluşturur
 * @param {string} text - Metin
 * @returns {string} - Slug
 */
export const generateSlug = (text) => {
  if (!text) return '';

  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '') // Harf ve rakam dışındaki şeyleri sil
    .replace(/\s+/g, '-') // Boşlukları tire (-) yap
    .replace(/-+/g, '-') // Yan yana iki tire varsa teke düşür
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri kaldır
};
