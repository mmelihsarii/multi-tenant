import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import AppointmentCalendar from '../components/AppointmentCalendar';
import {
  Button,
  Input,
  Card,
  StatCard,
  StatusBadge,
  Modal,
  InlineLoading,
  NoAppointments,
  NoResults,
} from '../components/ui';
import { appointmentSchema } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/sanitize';
import { showSuccessToast, showErrorToast, showPromiseToast } from '../components/ToastProvider';
import { handleError } from '../utils/errorHandler';
import { APPOINTMENT_STATUS, WORKING_HOURS } from '../constants';

export default function Appointments() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'calendar'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(appointmentSchema),
  });

  useEffect(() => {
    const date = new Date();
    const options = { month: 'short', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('tr-TR', options));
  }, []);

  const fetchStaffAndServices = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      const companyId = userData.company_id;

      // Fetch staff
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      setStaffList(staff || []);
      setServiceList(services || []);
    } catch (err) {
      handleError(err, 'fetchStaffAndServices', 'Personel ve hizmetler yüklenirken hata oluştu');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Get company ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;

      const companyId = userData.company_id;

      // Fetch appointments
      const { data: appts, error: apptError } = await supabase
        .from('appointments')
        .select(
          `
          *, 
          staff:staff_id ( full_name ),
          service:service_id ( name, price, duration )
        `
        )
        .eq('company_id', companyId)
        .order('appt_date', { ascending: true })
        .order('appt_time', { ascending: true });

      if (apptError) throw apptError;

      // Calculate stats
      const total = appts.length;
      const pending = appts.filter(
        (a) => a.status === APPOINTMENT_STATUS.PENDING || !a.status
      ).length;
      const completed = appts.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length;

      setAppointments(appts || []);
      setFilteredAppointments(appts || []);
      setStats({ total, pending, completed });
    } catch (err) {
      handleError(err, 'fetchAppointments', 'Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAppointments();
      fetchStaffAndServices();
    }
  }, [session]);

  // Filter appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.customer_name?.toLowerCase().includes(query) ||
          a.customer_phone?.includes(query) ||
          a.staff?.full_name?.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, searchQuery]);

  const handleOpenModal = (appointment = null) => {
    setEditingAppointment(appointment);
    if (appointment) {
      setValue('customer_name', appointment.customer_name);
      setValue('customer_phone', appointment.customer_phone);
      setValue('customer_email', appointment.customer_email || '');
      setValue('appt_date', appointment.appt_date);
      setValue('appt_time', appointment.appt_time);
      setValue('staff_id', appointment.staff_id);
      setValue('service_id', appointment.service_id);
      setValue('notes', appointment.notes || '');
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    reset();
  };

  const onSubmit = async (formData) => {
    try {
      // Get company ID
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      const companyId = userData.company_id;

      // Sanitize inputs
      const sanitizedData = {
        customer_name: sanitizeInput(formData.customer_name),
        customer_phone: sanitizeInput(formData.customer_phone),
        customer_email: formData.customer_email ? sanitizeInput(formData.customer_email) : null,
        appt_date: formData.appt_date,
        appt_time: formData.appt_time,
        staff_id: formData.staff_id,
        service_id: formData.service_id,
        notes: formData.notes ? sanitizeInput(formData.notes) : null,
        company_id: companyId,
        status: editingAppointment ? editingAppointment.status : 'pending',
      };

      if (editingAppointment) {
        // Update
        await showPromiseToast(
          supabase.from('appointments').update(sanitizedData).eq('id', editingAppointment.id),
          {
            loading: 'Randevu güncelleniyor...',
            success: 'Randevu başarıyla güncellendi!',
            error: 'Randevu güncellenirken hata oluştu',
          }
        );
      } else {
        // Create
        await showPromiseToast(supabase.from('appointments').insert([sanitizedData]), {
          loading: 'Randevu oluşturuluyor...',
          success: 'Randevu başarıyla oluşturuldu!',
          error: 'Randevu oluşturulurken hata oluştu',
        });
      }

      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      console.error('Form gönderme hatası:', err);
      showErrorToast('Bir hata oluştu');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await showPromiseToast(
        supabase.from('appointments').update({ status: newStatus }).eq('id', appointmentId),
        {
          loading: 'Durum güncelleniyor...',
          success: 'Durum başarıyla güncellendi!',
          error: 'Durum güncellenirken hata oluştu',
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      await showPromiseToast(
        supabase.from('appointments').update(updates).eq('id', appointmentId),
        {
          loading: 'Randevu güncelleniyor...',
          success: 'Randevu başarıyla güncellendi!',
          error: 'Randevu güncellenirken hata oluştu',
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    try {
      await showPromiseToast(supabase.from('appointments').delete().eq('id', appointmentId), {
        loading: 'Randevu siliniyor...',
        success: 'Randevu başarıyla silindi!',
        error: 'Randevu silinirken hata oluştu',
      });
      fetchAppointments();
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setValue('customerName', appointment.customer_name);
    setValue('customerPhone', appointment.customer_phone);
    setValue('appointmentDate', appointment.appointment_date);
    setValue('appointmentTime', appointment.appointment_time);
    setValue('staff_id', appointment.staff_id);
    setValue('service_id', appointment.service_id);
    setValue('notes', appointment.notes || '');
    setIsModalOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <InlineLoading text="Randevular yükleniyor..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center bg-zinc-100 px-6 py-3 rounded-full gap-3">
              <span className="material-symbols-outlined text-rose-600">event</span>
              <span className="font-semibold text-zinc-900">Bugün, {currentDate}</span>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center bg-zinc-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                aria-label="Liste görünümü"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  list
                </span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                aria-label="Takvim görünümü"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  calendar_month
                </span>
              </button>
            </div>

            {/* Status Filter - Sadece liste görünümünde */}
            {viewMode === 'list' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 px-4 bg-zinc-100 rounded-full border-none font-medium text-zinc-700 focus:ring-2 focus:ring-rose-600"
                aria-label="Durum filtresi"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="confirmed">Onaylandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
            )}
          </div>

          <Button onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined" aria-hidden="true">
              add
            </span>
            Yeni Randevu
          </Button>
        </div>

        {/* Search Bar - Sadece liste görünümünde */}
        {viewMode === 'list' && (
          <Input
            type="text"
            placeholder="Müşteri adı, telefon veya personel ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon="search"
            aria-label="Randevu ara"
          />
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Toplam" value={stats.total} variant="default" />
          <StatCard label="Bekliyor" value={stats.pending} variant="warning" />
          <StatCard label="Tamamlandı" value={stats.completed} variant="success" />
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <AppointmentCalendar
            appointments={appointments}
            onDateClick={(info) => {
              // Tıklanan tarihe randevu ekle
              setValue('appointmentDate', info.dateStr);
              handleOpenModal();
            }}
            onEventClick={(info) => {
              // Randevuya tıklandığında detayları göster
              const appointment = appointments.find((apt) => apt.id === info.event.id);
              if (appointment) {
                handleEditAppointment(appointment);
              }
            }}
            onEventDrop={async (info) => {
              // Randevu sürüklendiğinde güncelle
              const newDate = info.event.start.toISOString().split('T')[0];
              const newTime = info.event.start.toTimeString().slice(0, 5);
              await handleUpdateAppointment(info.event.id, {
                appointment_date: newDate,
                appointment_time: newTime,
              });
            }}
          />
        ) : (
          /* Appointment List */
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-zinc-600 font-bold px-1">
              Aktif Program ({filteredAppointments.length})
            </h2>

            {appointments.length === 0 ? (
              <NoAppointments
                onAction={() => handleOpenModal()}
                actionLabel="İlk Randevuyu Oluştur"
              />
            ) : filteredAppointments.length === 0 ? (
            <NoResults
              onReset={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            />
          ) : (
            filteredAppointments.map((appt) => (
              <Card key={appt.id} variant="white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Time Section */}
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0 w-full md:w-24 shrink-0">
                    <span className="text-xl font-extrabold text-zinc-900">{appt.appt_time}</span>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {appt.appt_date}
                    </span>
                  </div>

                  {/* Customer & Staff Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Customer */}
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-zinc-900">{appt.customer_name}</h4>
                      <p className="text-sm text-zinc-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">call</span>
                        {appt.customer_phone}
                      </p>
                      {appt.service && (
                        <p className="text-sm text-zinc-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-xs">cut</span>
                          {appt.service.name} ({appt.service.duration} dk)
                        </p>
                      )}
                    </div>

                    {/* Staff */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-sm">
                        {getInitials(appt.staff?.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          {appt.staff?.full_name || 'Atanmadı'}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                          Stilist
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                    <StatusBadge status={appt.status || 'pending'} />

                    <div className="flex items-center gap-2">
                      {/* Status Change Dropdown */}
                      <select
                        value={appt.status || 'pending'}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        className="h-10 px-3 bg-zinc-100 rounded-lg border-none text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-rose-600"
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="confirmed">Onayla</option>
                        <option value="completed">Tamamla</option>
                        <option value="cancelled">İptal</option>
                      </select>

                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(appt)}>
                        <span className="material-symbols-outlined">edit</span>
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => handleDelete(appt.id)}>
                        <span className="material-symbols-outlined text-rose-600">delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Müşteri Adı"
              {...register('customer_name')}
              error={errors.customer_name?.message}
              placeholder="Ahmet Yılmaz"
            />

            <Input
              label="Telefon"
              {...register('customer_phone')}
              error={errors.customer_phone?.message}
              placeholder="0555 123 4567"
              leftIcon="call"
            />
          </div>

          <Input
            label="E-posta (Opsiyonel)"
            type="email"
            {...register('customer_email')}
            error={errors.customer_email?.message}
            placeholder="ornek@email.com"
            leftIcon="mail"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tarih"
              type="date"
              {...register('appt_date')}
              error={errors.appt_date?.message}
            />

            <Input
              label="Saat"
              type="time"
              {...register('appt_time')}
              error={errors.appt_time?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input.Select
              label="Personel"
              {...register('staff_id')}
              error={errors.staff_id?.message}
            >
              <option value="">Personel Seçin</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name}
                </option>
              ))}
            </Input.Select>

            <Input.Select
              label="Hizmet"
              {...register('service_id')}
              error={errors.service_id?.message}
            >
              <option value="">Hizmet Seçin</option>
              {serviceList.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}₺ ({service.duration} dk)
                </option>
              ))}
            </Input.Select>
          </div>

          <Input.Textarea
            label="Notlar (Opsiyonel)"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Randevu ile ilgili notlar..."
            rows={3}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit">{editingAppointment ? 'Güncelle' : 'Oluştur'}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
