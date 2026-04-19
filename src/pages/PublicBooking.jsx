import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { Button, Input, Card, InlineLoading } from '../components/ui';
import { publicBookingSchema } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/sanitize';
import { showSuccessToast, showErrorToast } from '../components/ToastProvider';
import { handleError } from '../utils/errorHandler';
import { WORKING_HOURS, APPOINTMENT_RULES } from '../constants';

export default function PublicBooking() {
  const { companyId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Booking State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(publicBookingSchema),
  });

  const apptDate = watch('appt_date');
  const apptTime = watch('appt_time');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Fetch staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true);

        if (staffError) throw staffError;
        setStaffList(staffData || []);
      } catch (error) {
        setErrorMsg('Veriler yüklenemedi. Link yanlış olabilir.');
        handleError(error, 'fetchPublicBookingData', 'Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchData();
  }, [companyId]);

  const onSubmit = async (formData) => {
    setSubmitting(true);

    try {
      const now = new Date();
      const selectedDateTime = new Date(`${formData.appt_date}T${formData.appt_time}`);

      // Validations
      if (selectedDateTime < now) {
        showErrorToast('Geçmiş bir zamana randevu alamazsınız!');
        setSubmitting(false);
        return;
      }

      const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      if (selectedDateTime < threeHoursLater) {
        showErrorToast('Randevular en az 3 saat sonrası için oluşturulmalıdır!');
        setSubmitting(false);
        return;
      }

      const hour = parseInt(formData.appt_time.split(':')[0], 10);
      if (hour < 9 || hour >= 18) {
        showErrorToast('Sadece 09:00 ile 18:00 saatleri arasında hizmet vermekteyiz!');
        setSubmitting(false);
        return;
      }

      // Check staff availability
      if (selectedStaff?.id !== 'any') {
        const { data: existingAppt, error: checkError } = await supabase
          .from('appointments')
          .select('id')
          .eq('staff_id', selectedStaff.id)
          .eq('appt_date', formData.appt_date)
          .eq('appt_time', formData.appt_time);

        if (checkError) throw checkError;

        if (existingAppt && existingAppt.length > 0) {
          showErrorToast('Bu personelin seçtiğiniz saatteki randevusu doludur.');
          setSubmitting(false);
          return;
        }
      }

      // Sanitize inputs
      const sanitizedData = {
        company_id: companyId,
        service_id: selectedService.id,
        staff_id: selectedStaff?.id === 'any' ? null : selectedStaff.id,
        customer_name: sanitizeInput(formData.customer_name),
        customer_phone: sanitizeInput(formData.customer_phone),
        customer_email: formData.customer_email ? sanitizeInput(formData.customer_email) : null,
        appt_date: formData.appt_date,
        appt_time: formData.appt_time,
        status: 'pending',
      };

      const { error: insertError } = await supabase.from('appointments').insert([sanitizedData]);

      if (insertError) throw insertError;

      showSuccessToast('🎉 Randevunuz başarıyla kaydedildi!');

      // Reset
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedService(null);
        setSelectedStaff(null);
        setValue('customer_name', '');
        setValue('customer_phone', '');
        setValue('customer_email', '');
        setValue('appt_date', '');
        setValue('appt_time', '');
      }, 2000);
    } catch (err) {
      handleError(err, 'createPublicBooking', 'Randevu alınamadı');
    } finally {
      setSubmitting(false);
    }
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
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <InlineLoading text="Yükleniyor..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <p className="text-red-600 text-lg">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Atelier Luxe</h1>
              <p className="text-sm text-zinc-500 font-medium">Soho, London</p>
            </div>
            <div className="flex gap-3">
              <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">info</span>
              </button>
              <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Adım {currentStep} / 3
            </span>
            <span className="text-xs font-semibold text-rose-600">
              {currentStep === 1 && 'Hizmet Seçimi'}
              {currentStep === 2 && 'Tarih & Saat'}
              {currentStep === 3 && 'İletişim Bilgileri'}
            </span>
          </div>
          <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Service & Stylist Selection */}
        {currentStep === 1 && (
          <div className="p-8 max-h-[600px] overflow-y-auto">
            {/* Hero Image */}
            <div className="relative h-48 rounded-xl overflow-hidden mb-8">
              <img
                alt="Luxury salon interior"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-white text-2xl font-bold tracking-tight leading-none">
                  Deneyiminizi
                  <br />
                  Oluşturun
                </h2>
              </div>
            </div>

            {/* Choose Services */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900">Hizmet Seçin</h3>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest cursor-pointer">
                  Tümünü Gör
                </span>
              </div>

              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? 'border-rose-600 bg-rose-50 shadow-lg'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-zinc-900 mb-1">{service.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {service.duration_minutes}dk
                        </span>
                        <span className="font-semibold text-rose-600">₺{service.price}</span>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedService?.id === service.id
                          ? 'bg-rose-600 text-white'
                          : 'border-2 border-zinc-200'
                      }`}
                    >
                      {selectedService?.id === service.id && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose Stylist */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900">Stilist Seçin</h3>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Opsiyonel
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4">
                {/* Any Available */}
                <div
                  onClick={() => setSelectedStaff({ id: 'any', full_name: 'Müsait Olan' })}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-white ${
                      selectedStaff?.id === 'any' ? 'ring-4 ring-rose-600 ring-offset-2' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 text-center">Müsait Olan</span>
                </div>

                {/* Staff Members */}
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700 ${
                        selectedStaff?.id === staff.id ? 'ring-4 ring-rose-600 ring-offset-2' : ''
                      }`}
                    >
                      {getInitials(staff.full_name)}
                    </div>
                    <span className="text-xs font-medium text-zinc-600 text-center">
                      {staff.full_name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Tarih ve Saat Seçin</h3>
            <div className="space-y-4">
              <Input
                label="Tarih"
                type="date"
                {...register('appt_date')}
                error={errors.appt_date?.message}
                min={new Date().toISOString().split('T')[0]}
              />

              <Input
                label="Saat"
                type="time"
                {...register('appt_time')}
                error={errors.appt_time?.message}
                helperText="Çalışma saatleri: 09:00 - 18:00"
              />
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {currentStep === 3 && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">İletişim Bilgileri</h3>
            <div className="space-y-4">
              <Input
                label="Ad Soyad"
                {...register('customer_name')}
                error={errors.customer_name?.message}
                placeholder="Adınız Soyadınız"
                leftIcon="person"
              />

              <Input
                label="Telefon"
                type="tel"
                {...register('customer_phone')}
                error={errors.customer_phone?.message}
                placeholder="555 123 4567"
                leftIcon="call"
              />

              <Input
                label="E-posta (Opsiyonel)"
                type="email"
                {...register('customer_email')}
                error={errors.customer_email?.message}
                placeholder="ornek@email.com"
                leftIcon="mail"
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-200">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Toplam Tutar
                  </span>
                  <p className="text-lg font-extrabold text-zinc-900">
                    ₺{selectedService?.price || '0'}.00
                  </p>
                </div>
                {selectedService && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => selectedService && setCurrentStep(2)}
                disabled={!selectedService}
                size="lg"
                className="w-full"
              >
                Tarih & Saate Devam Et
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                onClick={() => apptDate && apptTime && setCurrentStep(3)}
                disabled={!apptDate || !apptTime}
                size="lg"
                className="flex-1"
              >
                İletişime Devam Et
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={submitting}
                loading={submitting}
                size="lg"
                className="flex-1"
              >
                {submitting ? 'Kaydediliyor...' : 'Randevuyu Onayla'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
