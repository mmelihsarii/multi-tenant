import { forwardRef, memo } from 'react';

/**
 * Reusable Button Component
 * 60/30/10 renk sistemine uygun, tutarlı buton tasarımı
 * React.memo ile optimize edildi
 *
 * @param {string} variant - primary, secondary, ghost, danger
 * @param {string} size - sm, md, lg
 * @param {boolean} loading - Yükleme durumu
 * @param {boolean} disabled - Devre dışı durumu
 * @param {boolean} fullWidth - Tam genişlik
 * @param {ReactNode} leftIcon - Sol ikon
 * @param {ReactNode} rightIcon - Sağ ikon
 */
const Button = memo(
  forwardRef(
    (
      {
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled = false,
        fullWidth = false,
        leftIcon,
        rightIcon,
        children,
        className = '',
        ...props
      },
      ref
    ) => {
      const baseStyles =
        'font-bold rounded-full transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

      const variants = {
        primary:
          'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:brightness-110 focus:ring-rose-500 shadow-lg shadow-rose-600/10',
        secondary:
          'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-500 border border-zinc-700',
        ghost:
          'bg-transparent text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-500 border border-zinc-200',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/10',
        success:
          'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg shadow-emerald-600/10',
      };

      const sizes = {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      };

      const widthClass = fullWidth ? 'w-full' : '';

      return (
        <button
          ref={ref}
          disabled={disabled || loading}
          className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
          {...props}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              {leftIcon && <span className="material-symbols-outlined text-xl">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="material-symbols-outlined text-xl">{rightIcon}</span>}
            </>
          )}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';

export default Button;
export { Button }; // Named export for testing

/**
 * Icon Button - Sadece ikon içeren buton (Accessibility ile)
 * React.memo ile optimize edildi
 */
export const IconButton = memo(
  forwardRef(
    ({ icon, variant = 'ghost', size = 'md', className = '', title, 'aria-label': ariaLabel, ...props }, ref) => {
      const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
      };

      const variants = {
        primary: 'bg-rose-600 text-white hover:bg-rose-700',
        secondary: 'bg-zinc-900 text-white hover:bg-zinc-800',
        ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      };

      return (
        <button
          ref={ref}
          className={`
        ${sizeClasses[size]}
        ${variants[variant]}
        rounded-full flex items-center justify-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500
        ${className}
      `}
          aria-label={ariaLabel || title}
          title={title}
          {...props}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">
            {icon}
          </span>
        </button>
      );
    }
  )
);

IconButton.displayName = 'IconButton';
