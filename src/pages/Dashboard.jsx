import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  StatCard,
  InlineLoading,
  NoAppointments,
} from '../components/ui';
import { showSuccessToast, showErrorToast } from '../components/ToastProvider';
import { handleError } from '../utils/errorHandler';
import { APPOINTMENT_STATUS } from '../constants';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Real data states
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activeStaff: 0,
    dailyRevenue: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // useCallback ile optimize edilmiş fonksiyonlar
  const fetchDashboardStats = useCallback(async (companyId) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Today's appointments count
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('id, service_id')
        .eq('company_id', companyId)
        .eq('appt_date', today);

      if (apptError) throw apptError;

      // Active staff count
      const { data: staff, error: staffError } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId)
        .eq('role', 'staff')
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Calculate daily revenue (from services)
      let dailyRevenue = 0;
      if (appointments && appointments.length > 0) {
        const serviceIds = appointments.map((apt) => apt.service_id).filter(Boolean);

        if (serviceIds.length > 0) {
          const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('price')
            .in('id', serviceIds);

          if (!servicesError && services) {
            dailyRevenue = services.reduce((sum, service) => sum + (service.price || 0), 0);
          }
        }
      }

      setStats({
        todayAppointments: appointments?.length || 0,
        activeStaff: staff?.length || 0,
        dailyRevenue: dailyRevenue,
      });
    } catch (error) {
      handleError(error, 'fetchStats', 'İstatistikler yüklenirken hata oluştu');
    }
  }, []); // Dependency yok, sadece companyId parametre olarak alıyor

  const fetchTodaySchedule = useCallback(async (companyId) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          customer_name,
          customer_phone,
          appt_time,
          status,
          staff:users!appointments_staff_id_fkey(full_name),
          service:services(name)
        `
        )
        .eq('company_id', companyId)
        .eq('appt_date', today)
        .order('appt_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      setTodaySchedule(data || []);
    } catch (error) {
      handleError(error, 'fetchTodaySchedule', 'Bugünün programı yüklenirken hata oluştu');
    }
  }, []);

  // useMemo ile optimize edilmiş booking link
  const bookingLink = useMemo(
    () => (companyId ? `${window.location.origin}/booking/${companyId}` : ''),
    [companyId]
  );

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      showSuccessToast('Link kopyalandı!');
    } catch (error) {
      handleError(error, 'copyBookingLink', 'Link kopyalanamadı', false);
      showErrorToast('Link kopyalanamadı');
    }
  }, [bookingLink]);

  const handleNewAppointment = useCallback(() => {
    navigate('/appointments');
  }, [navigate]);

  const handleViewCalendar = useCallback(() => {
    navigate('/appointments');
  }, [navigate]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatTime = useCallback((time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }, []);

  // useEffect'i optimize et
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('tr-TR', options));

    // Extract user name from email
    if (session?.user?.email) {
      const name = session.user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }

    // Get company ID and fetch data
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);

          // Get company ID
          const { data: userData } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', session.user.id)
            .single();

          if (userData?.company_id) {
            setCompanyId(userData.company_id);

            // Fetch dashboard stats
            await fetchDashboardStats(userData.company_id);
            await fetchTodaySchedule(userData.company_id);
          }
        } catch (error) {
          handleError(error, 'fetchDashboardData', 'Dashboard verileri yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [session, fetchDashboardStats, fetchTodaySchedule]);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <p className="text-rose-600 font-bold uppercase tracking-[0.2em] text-xs mb-2">
              Yönetim Paneli
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-zinc-900 leading-[0.9]">
              Merhaba, {userName}
            </h2>
            <p className="text-zinc-600 mt-3 sm:mt-4 font-medium flex items-center gap-2 text-sm sm:text-base">
              <span className="material-symbols-outlined text-rose-500">calendar_today</span>
              <span className="hidden sm:inline">{currentDate}</span>
              <span className="sm:hidden">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNewAppointment}
              leftIcon="add"
              className="w-full sm:w-auto min-h-[44px]"
            >
              Yeni Randevu
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowLinkModal(true)}
              disabled={!companyId}
              leftIcon="share"
              className="min-w-[44px] min-h-[44px]"
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard
            title="Bugünkü Randevular"
            value={loading ? '...' : stats.todayAppointments}
            subtitle="Rezerve"
            icon="event"
          />

          <StatCard
            title="Aktif Personel"
            value={loading ? '...' : stats.activeStaff}
            subtitle="Vardiyada"
            icon="group"
          />

          <StatCard
            title="Günlük Gelir"
            value={loading ? '...' : formatCurrency(stats.dailyRevenue)}
            icon="payments"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">Bugünün Programı</h3>
                <Button variant="ghost" size="sm" onClick={handleViewCalendar} className="w-full sm:w-auto">
                  <span className="hidden sm:inline">Tam Takvimi Gör</span>
                  <span className="sm:hidden">Takvim</span>
                </Button>
              </div>

              <div className="divide-y divide-zinc-50">
                {loading ? (
                  <InlineLoading message="Randevular yükleniyor..." />
                ) : todaySchedule.length === 0 ? (
                  <NoAppointments onCreateNew={handleNewAppointment} />
                ) : (
                  todaySchedule.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between hover:bg-zinc-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                        <div className="w-12 sm:w-16 text-center flex-shrink-0">
                          <p className="text-sm sm:text-base text-zinc-900 font-black tracking-tighter">
                            {formatTime(appointment.appt_time)}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                            {parseInt(appointment.appt_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                          </p>
                        </div>
                        <div
                          className={`h-8 sm:h-10 w-[2px] flex-shrink-0 ${index === 0 ? 'bg-rose-500' : 'bg-zinc-200 group-hover:bg-rose-500'} transition-colors`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base lg:text-lg text-zinc-900 font-bold leading-tight truncate">
                            {appointment.customer_name}
                          </p>
                          <p className="text-xs sm:text-sm text-zinc-500 truncate">
                            {appointment.service?.name || 'Hizmet belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            Personel
                          </p>
                          <p className="text-sm text-zinc-900 font-medium">
                            {appointment.staff?.full_name || 'Atanmamış'}
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-base sm:text-lg">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6 sm:space-y-8">
            {/* Inventory Alert Card */}
            <div className="bg-zinc-100 p-6 sm:p-8 rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg sm:text-xl mb-2">Envanter Uyarısı</h4>
                <p className="text-zinc-500 text-sm mb-4 sm:mb-6">3 profesyonel ürün stokta azalıyor.</p>
                <button className="text-zinc-900 font-bold text-sm underline decoration-rose-500 underline-offset-4 decoration-2 min-h-[44px] flex items-center">
                  Şimdi Sipariş Ver
                </button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl sm:text-9xl text-zinc-200 opacity-50 group-hover:scale-110 transition-transform">
                inventory_2
              </span>
            </div>

            {/* Top Stylist Card */}
            <div className="bg-zinc-900 p-6 sm:p-8 rounded-xl text-white">
              <h4 className="uppercase tracking-widest text-[10px] text-zinc-400 mb-4 sm:mb-6">
                Personel Performansı
              </h4>
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-rose-500 bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
                  S
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base sm:text-lg truncate">Selin Yıldız</p>
                  <p className="text-rose-500 text-sm font-medium">En İyi Performans</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Aylık Hedefler</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Randevu Linkinizi Paylaşın"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <p className="text-zinc-600">Müşterileriniz bu link üzerinden randevu alabilir:</p>

            <div className="flex items-center gap-2 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <input
                type="text"
                value={bookingLink}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-zinc-700"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Kopyala
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <p className="text-sm text-zinc-500 mb-3">Hızlı Paylaşım:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent('Randevu almak için: ' + bookingLink)}`,
                      '_blank'
                    );
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    window.open(
                      `mailto:?subject=Randevu Linki&body=${encodeURIComponent(bookingLink)}`,
                      '_blank'
                    );
                  }}
                  className="flex-1 px-4 py-3 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Email
                </button>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowLinkModal(false)}>
            Kapat
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
