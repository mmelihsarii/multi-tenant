import Button from './Button';

/**
 * Empty State Component
 * Veri olmadığında gösterilecek boş durum ekranı
 */
export default function EmptyState({
  icon = 'inbox',
  title = 'Henüz veri yok',
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: '#F4F4F5' }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ color: '#D4D4D8' }}>
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2" style={{ color: '#18181B' }}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-base max-w-md mb-6" style={{ color: '#71717A' }}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {action || (actionLabel && onAction)
        ? action || (
            <Button variant="primary" onClick={onAction} leftIcon="add">
              {actionLabel}
            </Button>
          )
        : null}
    </div>
  );
}

/**
 * No Results - Arama sonucu bulunamadı
 */
export function NoResults({ searchTerm, onClear, className = '' }) {
  return (
    <EmptyState
      icon="search_off"
      title="Sonuç bulunamadı"
      description={
        searchTerm
          ? `"${searchTerm}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
          : 'Arama kriterlerinize uygun sonuç bulunamadı.'
      }
      actionLabel={onClear ? 'Aramayı Temizle' : undefined}
      onAction={onClear}
      className={className}
    />
  );
}

/**
 * No Appointments - Randevu yok
 */
export function NoAppointments({ onCreateNew, className = '' }) {
  return (
    <EmptyState
      icon="event_busy"
      title="Henüz randevu yok"
      description="İlk randevunuzu oluşturarak başlayın."
      actionLabel="Yeni Randevu Oluştur"
      onAction={onCreateNew}
      className={className}
    />
  );
}

/**
 * No Services - Hizmet yok
 */
export function NoServices({ onCreateNew, className = '' }) {
  return (
    <EmptyState
      icon="content_cut"
      title="Henüz hizmet yok"
      description="İşletmenizin sunduğu hizmetleri ekleyerek başlayın."
      actionLabel="Yeni Hizmet Ekle"
      onAction={onCreateNew}
      className={className}
    />
  );
}

/**
 * No Staff - Personel yok
 */
export function NoStaff({ onCreateNew, className = '' }) {
  return (
    <EmptyState
      icon="group_off"
      title="Henüz personel yok"
      description="Ekibinize personel ekleyerek başlayın."
      actionLabel="Yeni Personel Ekle"
      onAction={onCreateNew}
      className={className}
    />
  );
}

/**
 * Error State - Hata durumu
 */
export function ErrorState({
  title = 'Bir hata oluştu',
  description = 'Veriler yüklenirken bir sorun oluştu.',
  onRetry,
  className = '',
}) {
  return (
    <EmptyState
      icon="error"
      title={title}
      description={description}
      actionLabel={onRetry ? 'Tekrar Dene' : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}
