import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Input değerlerini debounce eder (geciktirir)
 * 
 * @param {any} value - Debounce edilecek değer
 * @param {number} delay - Gecikme süresi (ms)
 * @returns {any} Debounced değer
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedSearch = useDebounce(searchQuery, 500);
 * 
 * useEffect(() => {
 *   // API çağrısı sadece kullanıcı yazmayı bıraktıktan 500ms sonra yapılır
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Delay sonrasında değeri güncelle
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Yeni değer gelirse önceki timeout'u iptal et
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook
 * Fonksiyon çağrılarını throttle eder (sınırlar)
 * 
 * @param {Function} callback - Throttle edilecek fonksiyon
 * @param {number} delay - Minimum çağrı aralığı (ms)
 * @returns {Function} Throttled fonksiyon
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll event');
 * }, 200);
 * 
 * window.addEventListener('scroll', handleScroll);
 */
export function useThrottle(callback, delay = 200) {
  const [lastRun, setLastRun] = useState(Date.now());

  return (...args) => {
    const now = Date.now();
    
    if (now - lastRun >= delay) {
      callback(...args);
      setLastRun(now);
    }
  };
}

export default useDebounce;
