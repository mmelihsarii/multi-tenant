/**
 * Reusable Badge Component
 * Durum göstergeleri, etiketler için
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700',
    primary: 'bg-rose-100 text-rose-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Status Badge - Randevu durumları için özel badge
 */
export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    pending: {
      label: 'Beklemede',
      variant: 'warning',
      icon: 'schedule',
    },
    confirmed: {
      label: 'Onaylandı',
      variant: 'success',
      icon: 'check_circle',
    },
    completed: {
      label: 'Tamamlandı',
      variant: 'info',
      icon: 'task_alt',
    },
    cancelled: {
      label: 'İptal',
      variant: 'danger',
      icon: 'cancel',
    },
    noshow: {
      label: 'Gelmedi',
      variant: 'default',
      icon: 'person_off',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={className}>
      <span className="material-symbols-outlined text-sm">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

/**
 * Dot Badge - Bildirim noktası
 */
export function DotBadge({ count, variant = 'primary', className = '' }) {
  if (!count || count === 0) return null;

  const variants = {
    primary: 'bg-rose-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <span
      className={`
        absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full 
        flex items-center justify-center text-white text-xs font-bold
        ${variants[variant]}
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
