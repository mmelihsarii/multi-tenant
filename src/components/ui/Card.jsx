import { memo } from 'react';

/**
 * Reusable Card Component
 * 60/30/10 renk sistemine uygun, tutarlı kart tasarımı
 * React.memo ile optimize edildi
 */

/**
 * Card Container
 */
const Card = memo(function Card({
  children,
  className = '',
  variant = 'white',
  hover = false,
  noPadding = false,
  ...props
}) {
  const variants = {
    white: 'bg-white border border-zinc-100',
    dark: 'bg-zinc-900 text-white',
    ghost: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
  };

  const hoverClass = hover ? 'hover:translate-y-[-4px] transition-transform cursor-pointer' : '';
  const paddingClass = noPadding ? '' : 'p-6';

  return (
    <div
      className={`
        rounded-lg shadow-sm overflow-hidden
        ${variants[variant]}
        ${hoverClass}
        ${paddingClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
export { Card };

/**
 * Card Header
 */
export const CardHeader = memo(function CardHeader({ children, className = '', action, ...props }) {
  return (
    <div
      className={`px-6 py-4 border-b border-zinc-100 flex justify-between items-center ${className}`}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
});

/**
 * Card Title
 */
export const CardTitle = memo(function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight ${className}`}
      style={{ color: '#18181B' }}
      {...props}
    >
      {children}
    </h3>
  );
});

/**
 * Card Description
 */
export const CardDescription = memo(function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm mt-1 ${className}`} style={{ color: '#71717A' }} {...props}>
      {children}
    </p>
  );
});

/**
 * Card Body
 */
export const CardBody = memo(function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

/**
 * Card Footer
 */
export const CardFooter = memo(function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-zinc-100 ${className}`} {...props}>
      {children}
    </div>
  );
});

/**
 * Stat Card - İstatistik kartları için özel component
 */
export const StatCard = memo(function StatCard({ title, value, subtitle, icon, trend, className = '' }) {
  return (
    <Card variant="dark" hover className={className}>
      <CardBody className="flex flex-col justify-between h-48">
        <div className="flex justify-between items-start">
          <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
            {title}
          </span>
          {icon && (
            <span className="material-symbols-outlined text-2xl" style={{ color: '#F43F5E' }}>
              {icon}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tighter" style={{ color: '#F43F5E' }}>
              {value}
            </span>
            {subtitle && <span className="text-zinc-500 text-sm font-medium">{subtitle}</span>}
          </div>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`material-symbols-outlined text-sm ${
                  trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {trend.direction === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              <span className="text-xs text-zinc-400">{trend.value}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
});
