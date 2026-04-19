import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useServicesStore } from '../stores';
import { useDebounce } from '../hooks/useDebounce';
import Layout from '../components/Layout';
import {
  Button,
  Input,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  InlineLoading,
  NoServices,
  NoResults,
  IconButton,
} from '../components/ui';
import { serviceSchema } from '../utils/validationSchemas';
import { showSuccessToast, showErrorToast } from '../components/ToastProvider';
import { sanitizeInput } from '../utils/sanitize';

export default function Services() {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Debounced search - 300ms gecikme ile
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Zustand store
  const { services, loading, fetchServices, addService, updateService, deleteService, toggleServiceStatus } =
    useServicesStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(serviceSchema),
  });

  // Sayfa açıldığında verileri getir (cache'den veya API'den)
  useEffect(() => {
    const loadServices = async () => {
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          await fetchServices(userData.company_id);
        }
      }
    };

    loadServices();
  }, [session, fetchServices]);

  // Yeni Hizmet Ekle veya Güncelle
  const onSubmit = async (formData) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (!userData) {
        showErrorToast('Şirket bilginiz bulunamadı!');
        return;
      }

      // Input'ları sanitize et
      const serviceData = {
        company_id: userData.company_id,
        name: sanitizeInput(formData.name),
        duration_minutes: parseInt(formData.duration),
        price: parseFloat(formData.price),
        description: formData.description ? sanitizeInput(formData.description) : null,
      };

      if (editingService) {
        // Güncelleme - Zustand store kullan
        await updateService(editingService.id, serviceData);
        showSuccessToast('Hizmet başarıyla güncellendi');
      } else {
        // Yeni ekleme - Zustand store kullan
        await addService(serviceData);
        showSuccessToast('Hizmet başarıyla eklendi');
      }

      reset();
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      // Error handling zaten store'da yapılıyor
    }
  };

  // Düzenleme modalını aç
  // useCallback ile optimize edilmiş handler fonksiyonlar
  const handleEditService = useCallback((service) => {
    setEditingService(service);
    setValue('name', service.name);
    setValue('duration', service.duration_minutes);
    setValue('price', service.price);
    setValue('description', service.description || '');
    setShowModal(true);
  }, [setValue]);

  // Modal kapatma
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingService(null);
    reset();
  }, [reset]);

  // Hizmet Sil
  const handleDeleteService = useCallback(async (serviceId) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteService(serviceId);
      showSuccessToast('Hizmet başarıyla silindi');
    } catch (error) {
      // Error handling zaten store'da yapılıyor
    }
  }, [deleteService]);

  // Hizmet Durumunu Değiştir (Aktif/Pasif)
  const handleToggleStatus = useCallback(async (serviceId, currentStatus) => {
    try {
      await toggleServiceStatus(serviceId, currentStatus);
      showSuccessToast(currentStatus ? 'Hizmet pasif edildi' : 'Hizmet aktif edildi');
    } catch (error) {
      // Error handling zaten store'da yapılıyor
    }
  }, [toggleServiceStatus]);

  // Filtrelenmiş hizmetler - useMemo ile optimize edildi + debounced search
  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [services, debouncedSearchQuery]);

  if (loading) {
    return (
      <Layout>
        <InlineLoading message="Hizmetler yükleniyor..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Top Bar with Search */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-16 z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Hizmetler</h2>

            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-rose-500 transition-colors">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 h-12 bg-zinc-100 border-none rounded-full text-sm focus:ring-0 focus:bg-white transition-all"
                placeholder="Hizmet ara..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            leftIcon="add"
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Yeni Hizmet Ekle</span>
            <span className="sm:hidden">Yeni Hizmet</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service) => (
            <Card key={service.id} variant="white" hover>
              <CardBody className="p-6 sm:p-8">
                {/* Header with Title and Toggle */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight leading-tight max-w-[70%]">
                    {service.name}
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={service.is_active !== false}
                      onChange={() => handleToggleStatus(service.id, service.is_active !== false)}
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                {/* Service Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span className="material-symbols-outlined text-zinc-400 text-lg">
                      schedule
                    </span>
                    <span className="text-sm font-medium">{service.duration_minutes} dk</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-900">
                    <span className="material-symbols-outlined text-rose-500 text-lg">sell</span>
                    <span className="text-lg font-bold">₺{service.price}</span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-zinc-500 mt-2">{service.description}</p>
                  )}
                </div>

                {/* Footer with Actions */}
                <div className="pt-6 border-t border-zinc-100 flex justify-end items-center gap-2">
                  <IconButton
                    icon="edit"
                    variant="ghost"
                    onClick={() => handleEditService(service)}
                    title="Düzenle"
                    className="min-w-[44px] min-h-[44px]"
                  />
                  <IconButton
                    icon="delete"
                    variant="ghost"
                    onClick={() => handleDeleteService(service.id)}
                    title="Sil"
                    className="min-w-[44px] min-h-[44px]"
                  />
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Add New Service Card */}
          <Card
            variant="ghost"
            className="border-2 border-dashed border-zinc-200 hover:border-rose-500/30 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <CardBody className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 text-zinc-300 group-hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <p className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                Yeni Hizmet Oluştur
              </p>
              <p className="text-xs text-zinc-400 mt-1">Özel hizmet şablonu ekle</p>
            </CardBody>
          </Card>
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 &&
          !loading &&
          (searchQuery ? (
            <NoResults searchTerm={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            <NoServices onCreateNew={() => setShowModal(true)} />
          ))}
      </section>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-6">
            <Input
              label="Hizmet Adı"
              placeholder="Örn: Saç Kesimi"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Süre (Dakika)"
                type="number"
                placeholder="60"
                error={errors.duration?.message}
                {...register('duration')}
              />

              <Input
                label="Fiyat (₺)"
                type="number"
                placeholder="250"
                error={errors.price?.message}
                {...register('price')}
              />
            </div>

            <Input
              label="Açıklama (Opsiyonel)"
              placeholder="Hizmet hakkında kısa açıklama"
              error={errors.description?.message}
              {...register('description')}
            />
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {editingService ? 'Güncelle' : 'Hizmeti Ekle'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </Layout>
  );
}
