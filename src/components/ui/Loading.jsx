/**
 * Loading Components
 * Yükleme durumları için çeşitli göstergeler
 */

/**
 * Spinner - Dönen yükleme göstergesi
 */
export default function LoadingSpinner({ size = 'md', color = 'rose', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colors = {
    rose: 'border-zinc-200 border-t-rose-600',
    white: 'border-zinc-700 border-t-white',
    zinc: 'border-zinc-200 border-t-zinc-600',
  };

  return (
    <div
      className={`
        ${sizes[size]} 
        ${colors[color]} 
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}

/**
 * Skeleton Loader - İçerik yüklenirken placeholder
 */
export function SkeletonLoader({ className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'bg-zinc-200',
    dark: 'bg-zinc-700',
    light: 'bg-zinc-100',
  };

  return <div className={`animate-pulse ${variants[variant]} rounded ${className}`} {...props} />;
}

/**
 * Skeleton Text - Metin için skeleton
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader key={i} className="h-4" style={{ width: `${Math.random() * 30 + 70}%` }} />
      ))}
    </div>
  );
}

/**
 * Skeleton Card - Kart için skeleton
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-zinc-100 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonLoader className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-3/4" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/**
 * Full Page Loading - Tam sayfa yükleme
 */
export function FullPageLoading({ message = 'Yükleniyor...' }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-lg font-medium" style={{ color: '#71717A' }}>
        {message}
      </p>
    </div>
  );
}

/**
 * Inline Loading - Satır içi yükleme
 */
export function InlineLoading({ message = 'Yükleniyor...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <LoadingSpinner size="md" />
      <span className="text-sm font-medium" style={{ color: '#71717A' }}>
        {message}
      </span>
    </div>
  );
}

/**
 * Button Loading - Buton içi yükleme
 */
export function ButtonLoading({ message = 'İşlem yapılıyor...' }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" color="white" />
      {message}
    </div>
  );
}
