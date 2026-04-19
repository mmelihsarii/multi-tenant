import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useStaffStore } from '../stores';
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
  NoStaff,
  NoResults,
  IconButton,
  Badge,
  StatCard,
} from '../components/ui';
import { staffSchema } from '../utils/validationSchemas';
import { showSuccessToast, showErrorToast, showPromiseToast } from '../components/ToastProvider';
import { USER_ROLES } from '../constants';
import { sanitizeInput, normalizeEmail, normalizePhone } from '../utils/sanitize';

export default function Staff() {
  const { session } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);

  // Debounced search - 300ms gecikme ile
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Zustand store
  const { staff: staffList, loading, fetchStaff, addStaff, updateStaff, deleteStaff, toggleStaffStatus } =
    useStaffStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(staffSchema),
  });

  // Sayfa açıldığında verileri getir (cache'den veya API'den)
  useEffect(() => {
    const loadStaff = async () => {
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          await fetchStaff(userData.company_id);
        }
      }
    };

    loadStaff();
  }, [session, fetchStaff]);

  // Yeni Personel Ekle veya Güncelle
  const onSubmit = async (formData) => {
    try {
      // Input'ları sanitize et
      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        email: normalizeEmail(formData.email),
        password: formData.password, // Şifre sanitize edilmez
        phone: formData.phone ? normalizePhone(formData.phone) : null,
      };

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (!userData) {
        showErrorToast('Şirket bilginiz bulunamadı!');
        return;
      }

      if (editingStaff) {
        // Güncelleme - Zustand store kullan
        await updateStaff(editingStaff.id, {
          full_name: sanitizedData.fullName,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
        });
        showSuccessToast('Personel başarıyla güncellendi');
      } else {
        // Yeni ekleme - Zustand store kullan
        await addStaff({
          email: sanitizedData.email,
          password: sanitizedData.password,
          fullName: sanitizedData.fullName,
          companyId: userData.company_id,
          phone: sanitizedData.phone,
        });
        showSuccessToast('Personel başarıyla eklendi');
      }

      reset();
      setShowModal(false);
      setEditingStaff(null);
    } catch (error) {
      // Error handling zaten store'da yapılıyor
      showErrorToast(error.message || 'Personel kaydedilirken hata oluştu');
    }
  };

  // Düzenleme modalını aç
  // useCallback ile optimize edilmiş handler fonksiyonlar
  const handleEditStaff = useCallback((staff) => {
    setEditingStaff(staff);
    setValue('fullName', staff.full_name);
    setValue('email', staff.email);
    setValue('phone', staff.phone || '');
    setShowModal(true);
  }, [setValue]);

  // Modal kapatma
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingStaff(null);
    reset();
  }, [reset]);

  // Personel Silme
  const handleDeleteStaff = useCallback(async (staffId) => {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      await deleteStaff(staffId);
      showSuccessToast('Personel başarıyla silindi');
    } catch (error) {
      // Error handling zaten store'da yapılıyor
      showErrorToast(error.message || 'Personel silinirken hata oluştu');
    }
  }, [deleteStaff]);

  // Personel Durumunu Değiştir
  const handleToggleStatus = useCallback(async (staffId, currentStatus) => {
    try {
      await toggleStaffStatus(staffId, currentStatus);
      showSuccessToast(currentStatus ? 'Personel pasif edildi' : 'Personel aktif edildi');
    } catch (error) {
      // Error handling zaten store'da yapılıyor
      showErrorToast('Durum güncellenemedi: ' + error.message);
    }
  }, [toggleStaffStatus]);

  // İsimden baş harfleri al - useCallback ile optimize edildi
  const getInitials = useCallback((name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }, []);

  // Filtrelenmiş personel - useMemo ile optimize edildi + debounced search
  const filteredStaff = useMemo(() => {
    return staffList.filter(
      (staff) =>
        staff.full_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        staff.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [staffList, debouncedSearchQuery]);

  // İstatistikler - useMemo ile optimize edildi
  const stats = useMemo(() => {
    const activeStaff = staffList.filter((s) => s.is_active !== false).length;
    const totalStaff = staffList.length;
    return { activeStaff, totalStaff };
  }, [staffList]);

  if (loading) {
    return (
      <Layout>
        <InlineLoading message="Personel listesi yükleniyor..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-rose-600 uppercase">
              Ekip Yönetimi
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-none mt-2">
              Personel Üyeleri
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="lg" onClick={() => setShowModal(true)} leftIcon="add">
              Yeni Personel Ekle
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              search
            </span>
            <input
              className="w-full bg-zinc-100 border-none rounded-full py-3 pl-12 pr-6 text-sm focus:ring-0 focus:bg-white transition-all"
              placeholder="İsim, rol veya ID ile ara..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Toplam Personel" value={stats.totalStaff} icon="person_search" />

          <StatCard
            title="Aktif Vardiya"
            value={stats.activeStaff}
            subtitle="Çalışıyor"
            icon="pending_actions"
          />

          <Card variant="dark" className="md:col-span-1">
            <CardBody className="p-8 flex flex-col justify-between h-40 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">
                  Operasyonel Durum
                </div>
                <div className="text-sm font-medium text-zinc-100">
                  Ekip verimliliği bu ay %12 arttı
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <span className="material-symbols-outlined text-[160px]">trending_up</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} variant="white" hover>
              <CardBody className="p-6">
                {/* Header with Avatar and Toggle */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 text-zinc-50 flex items-center justify-center font-black text-xl shadow-lg">
                    {getInitials(staff.full_name)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={staff.is_active !== false ? 'success' : 'default'} size="sm">
                      {staff.is_active !== false ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={staff.is_active !== false}
                        onChange={() => handleToggleStatus(staff.id, staff.is_active !== false)}
                      />
                      <div className="w-10 h-5 bg-zinc-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>
                </div>

                {/* Staff Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                    {staff.full_name}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">{staff.email}</p>
                  {staff.phone && <p className="text-xs text-zinc-400 mt-1">{staff.phone}</p>}
                </div>

                {/* Role Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="default" size="sm">
                    {staff.role === 'owner' ? 'Yönetici' : 'Personel'}
                  </Badge>
                  <Badge variant="primary" size="sm">
                    Stilist
                  </Badge>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStaff(staff)}
                    fullWidth
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStaff(staff.id)}
                    fullWidth
                  >
                    Sil
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Add New Staff Card */}
          <Card
            variant="ghost"
            className="border-2 border-dashed border-zinc-300 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <CardBody className="p-6 flex flex-col items-center justify-center text-center min-h-[340px]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-rose-600">
                Yeni Yetenek Ekle
              </span>
            </CardBody>
          </Card>
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 &&
          !loading &&
          (searchQuery ? (
            <NoResults searchTerm={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            <NoStaff onCreateNew={() => setShowModal(true)} />
          ))}
      </div>

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingStaff ? 'Personeli Düzenle' : 'Yeni Personel Oluştur'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-6">
            <Input
              label="Ad Soyad"
              placeholder="Örn: Ahmet Yılmaz"
              error={errors.fullName?.message}
              leftIcon="person"
              {...register('fullName')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="E-posta Adresi"
                type="email"
                placeholder="isim@atelier.com"
                error={errors.email?.message}
                leftIcon="mail"
                {...register('email')}
                disabled={!!editingStaff}
              />

              {!editingStaff && (
                <Input
                  label="Geçici Şifre"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  leftIcon="lock"
                  {...register('password')}
                  helperText="Personel ilk girişte değiştirebilir"
                />
              )}

              <Input
                label="Telefon (Opsiyonel)"
                type="tel"
                placeholder="05XX XXX XX XX"
                error={errors.phone?.message}
                leftIcon="phone"
                {...register('phone')}
              />
            </div>

            {!editingStaff && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Personel Oluşturma</p>
                    <p>
                      Personel için otomatik olarak bir hesap oluşturulacak ve giriş bilgileri email
                      ile gönderilecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {editingStaff ? 'Güncelle' : 'Personel Oluştur'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </Layout>
  );
}
