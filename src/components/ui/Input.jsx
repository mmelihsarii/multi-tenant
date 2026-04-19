import { forwardRef } from 'react';

/**
 * Reusable Input Component
 * 60/30/10 renk sistemine uygun, tutarlı input tasarımı
 *
 * @param {string} label - Input etiketi
 * @param {string} error - Hata mesajı
 * @param {string} leftIcon - Sol ikon (Material Symbols)
 * @param {string} rightIcon - Sağ ikon
 * @param {ReactNode} rightElement - Sağ element (örn: şifre göster butonu)
 * @param {string} helperText - Yardımcı metin
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      rightElement,
      helperText,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    // ID yoksa otomatik oluştur
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`group ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-bold tracking-widest uppercase mb-2 ml-1"
            style={{ color: error ? '#EF4444' : '#A1A1AA' }}
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-xl h-14 px-4 transition-all ${
            error
              ? 'border-2 border-red-500 bg-red-50'
              : 'bg-zinc-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500'
          }`}
        >
          {leftIcon && (
            <span
              className="material-symbols-outlined mr-3"
              style={{ color: error ? '#EF4444' : '#A1A1AA' }}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
            bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-zinc-400
            ${className}
          `}
            style={{ color: '#18181B', outline: 'none' }}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />

          {rightIcon && (
            <span
              className="material-symbols-outlined ml-3"
              style={{ color: '#A1A1AA' }}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}

          {rightElement && rightElement}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs font-medium mt-1 ml-1 flex items-center gap-1"
            style={{ color: '#EF4444' }}
            role="alert"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              error
            </span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs mt-1 ml-1" style={{ color: '#71717A' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export { Input }; // Named export for testing

/**
 * Textarea Component
 */
export const Textarea = forwardRef(
  (
    { label, error, helperText, className = '', containerClassName = '', rows = 4, ...props },
    ref
  ) => {
    return (
      <div className={`group ${containerClassName}`}>
        {label && (
          <label
            className="block text-[10px] font-bold tracking-widest uppercase mb-2 ml-1"
            style={{ color: error ? '#EF4444' : '#A1A1AA' }}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`
          w-full px-4 py-3 rounded-xl font-medium placeholder:text-zinc-400 transition-all
          ${
            error
              ? 'border-2 border-red-500 bg-red-50'
              : 'bg-zinc-100 border-none focus:bg-white focus:ring-2 focus:ring-rose-500'
          }
          ${className}
        `}
          style={{ color: '#18181B', outline: 'none' }}
          {...props}
        />

        {error && (
          <p
            className="text-xs font-medium mt-1 ml-1 flex items-center gap-1"
            style={{ color: '#EF4444' }}
          >
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs mt-1 ml-1" style={{ color: '#71717A' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select Component
 */
export const Select = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      helperText,
      options = [],
      placeholder = 'Seçiniz',
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`group ${containerClassName}`}>
        {label && (
          <label
            className="block text-[10px] font-bold tracking-widest uppercase mb-2 ml-1"
            style={{ color: error ? '#EF4444' : '#A1A1AA' }}
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-xl h-14 px-4 transition-all ${
            error
              ? 'border-2 border-red-500 bg-red-50'
              : 'bg-zinc-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500'
          }`}
        >
          {leftIcon && (
            <span
              className="material-symbols-outlined mr-3"
              style={{ color: error ? '#EF4444' : '#A1A1AA' }}
            >
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            className={`
            bg-transparent border-none focus:ring-0 w-full font-medium
            ${className}
          `}
            style={{ color: '#18181B', outline: 'none' }}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span
            className="material-symbols-outlined ml-3 pointer-events-none"
            style={{ color: '#A1A1AA' }}
          >
            expand_more
          </span>
        </div>

        {error && (
          <p
            className="text-xs font-medium mt-1 ml-1 flex items-center gap-1"
            style={{ color: '#EF4444' }}
          >
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs mt-1 ml-1" style={{ color: '#71717A' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
