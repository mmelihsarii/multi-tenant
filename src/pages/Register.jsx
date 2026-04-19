import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { registerSchema } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/sanitize';
import { showSuccessToast, showErrorToast, showPromiseToast } from '../components/ToastProvider';
import { handleError } from '../utils/errorHandler';
import { BUSINESS_TYPES, VALIDATION } from '../constants';

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Şifre gücü hesaplama
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Step validasyonları
  const validateStep1 = async () => {
    const result = await trigger(['fullName', 'email', 'password', 'confirmPassword']);
    return result;
  };

  const validateStep2 = async () => {
    const result = await trigger(['companyName', 'phoneNumber']);
    if (!businessType) {
      showErrorToast('Lütfen işletme tipini seçin');
      return false;
    }
    return result;
  };

  const validateStep3 = () => {
    if (!termsAccepted) {
      showErrorToast('Lütfen kullanım şartlarını kabul edin');
      return false;
    }
    return true;
  };

  // Next butonu
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await validateStep2();
      if (isValid) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) {
        // Form submit edilecek
        handleSubmit(onSubmit)();
      }
    }
  };

  // Back butonu
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final kayıt işlemi
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        companyName: sanitizeInput(formData.companyName),
        phoneNumber: sanitizeInput(formData.phoneNumber),
        address: formData.address ? sanitizeInput(formData.address) : null,
      };

      // Supabase kayıt işlemi
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      // Company oluştur
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: sanitizedData.companyName,
            phone: sanitizedData.phoneNumber,
            business_type: businessType,
            address: sanitizedData.address,
          },
        ])
        .select()
        .single();
      if (companyError) throw companyError;

      // User ekle
      const { error: userError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          company_id: companyData.id,
          full_name: sanitizedData.fullName,
          role: 'admin',
        },
      ]);
      if (userError) throw userError;

      showSuccessToast('🎉 Tebrikler! İşletmeniz başarıyla oluşturuldu');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      handleError(error, 'registerUser', 'Kayıt işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Top App Bar */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-md mx-auto">
          <span
            className="material-symbols-outlined cursor-pointer active:scale-95 transition-transform"
            style={{ color: '#F43F5E' }}
            onClick={() => navigate('/login')}
          >
            close
          </span>
          <h1 className="text-2xl font-black tracking-tighter" style={{ color: '#18181B' }}>
            ePOS CRM
          </h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-md mx-auto px-6 pt-8 pb-32">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10 h-1">
          <div
            className="flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: currentStep >= 1 ? '#F43F5E' : '#EEEEEE' }}
          ></div>
          <div
            className="flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: currentStep >= 2 ? '#F43F5E' : '#EEEEEE' }}
          ></div>
          <div
            className="flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: currentStep >= 3 ? '#F43F5E' : '#EEEEEE' }}
          ></div>
        </div>

        {/* Step Indicator & Title */}
        <div className="mb-12">
          <span
            className="text-sm font-bold uppercase tracking-widest mb-2 block"
            style={{ color: '#5F5E61' }}
          >
            Adım {currentStep} / 3
          </span>
          <h2
            className="text-4xl font-extrabold tracking-tighter leading-tight"
            style={{ color: '#18181B' }}
          >
            {currentStep === 1 && 'Hesabını oluştur'}
            {currentStep === 2 && 'İşletmen hakkında bilgi ver'}
            {currentStep === 3 && 'Son dokunuşlar'}
          </h2>
          <p className="mt-2" style={{ color: '#5F5E61' }}>
            {currentStep === 1 && 'Kişisel bilgilerinizi girerek başlayın'}
            {currentStep === 2 && "Dashboard'unuzu özelleştirmek için birkaç detay daha paylaşın"}
            {currentStep === 3 && 'Neredeyse hazırsınız! Son birkaç detay kaldı'}
          </p>
        </div>

        {/* STEP 1 - Kişisel Bilgiler */}
        {currentStep === 1 && (
          <form className="space-y-6">
            <Input
              label="Ad Soyad"
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="Ahmet Yılmaz"
            />

            <Input
              label="E-Posta"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="ahmet@sirket.com"
              leftIcon="mail"
            />

            <Input
              label="Şifre"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              leftIcon="lock"
            />

            {/* Password Strength Indicator */}
            {password && (
              <>
                <div className="flex gap-1.5 px-1 -mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        backgroundColor: passwordStrength >= level ? '#F43F5E' : '#EEEEEE',
                        opacity: passwordStrength >= level ? 1 : 0.4,
                      }}
                    ></div>
                  ))}
                </div>
                <p
                  className="text-[10px] font-medium tracking-wide px-1 -mt-2"
                  style={{ color: '#5F5E61' }}
                >
                  {passwordStrength === 0 && 'ÇOK ZAYIF • EN AZ 8 KARAKTER'}
                  {passwordStrength === 1 && 'ZAYIF • BÜYÜK HARF VE RAKAM EKLEYİN'}
                  {passwordStrength === 2 && 'ORTA • DAHA UZUN YAPABILIRSINIZ'}
                  {passwordStrength === 3 && 'İYİ • GÜVENLI BİR ŞİFRE'}
                  {passwordStrength === 4 && 'MÜKEMMEL • ÇOK GÜVENLİ'}
                </p>
              </>
            )}

            <Input
              label="Şifre Tekrar"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
              leftIcon="lock"
            />
          </form>
        )}

        {/* STEP 2 - İşletme Bilgileri */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Input
              label="İşletme Adı"
              {...register('companyName')}
              error={errors.companyName?.message}
              placeholder="örn. Altın Makas Kuaför"
            />

            <Input
              label="Telefon Numarası"
              type="tel"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              placeholder="+90 (555) 000-0000"
              leftIcon="call"
            />

            {/* Business Type Selection */}
            <div className="space-y-4">
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1"
                style={{ color: '#5F5E61' }}
              >
                İşletme Tipi
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* Barber Option */}
                <button
                  type="button"
                  onClick={() => setBusinessType('barber')}
                  className={`flex items-center justify-between p-6 rounded-xl transition-all active:scale-[0.98] ${
                    businessType === 'barber'
                      ? 'ring-2 ring-offset-2 shadow-lg'
                      : 'hover:bg-zinc-100'
                  }`}
                  style={{
                    backgroundColor: businessType === 'barber' ? '#5F5E61' : '#EEEEEE',
                    color: businessType === 'barber' ? '#FAFAFA' : '#18181B',
                    ringColor: businessType === 'barber' ? '#F43F5E' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: businessType === 'barber' ? '#FB7185' : '#F43F5E' }}
                    >
                      content_cut
                    </span>
                    <span className="font-bold text-lg">Berber</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: businessType === 'barber' ? '#F43F5E' : 'transparent',
                      border:
                        businessType === 'barber' ? 'none' : '2px solid rgba(244, 63, 94, 0.2)',
                    }}
                  >
                    {businessType === 'barber' && (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    )}
                  </div>
                </button>

                {/* Salon Option */}
                <button
                  type="button"
                  onClick={() => setBusinessType('salon')}
                  className={`flex items-center justify-between p-6 rounded-xl transition-all active:scale-[0.98] ${
                    businessType === 'salon'
                      ? 'ring-2 ring-offset-2 shadow-lg'
                      : 'hover:bg-zinc-100'
                  }`}
                  style={{
                    backgroundColor: businessType === 'salon' ? '#5F5E61' : '#EEEEEE',
                    color: businessType === 'salon' ? '#FAFAFA' : '#18181B',
                    ringColor: businessType === 'salon' ? '#F43F5E' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: businessType === 'salon' ? '#FB7185' : '#F43F5E' }}
                    >
                      face_3
                    </span>
                    <span className="font-bold text-lg">Kuaför / Salon</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: businessType === 'salon' ? '#F43F5E' : 'transparent',
                      border:
                        businessType === 'salon' ? 'none' : '2px solid rgba(244, 63, 94, 0.2)',
                    }}
                  >
                    {businessType === 'salon' && (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    )}
                  </div>
                </button>

                {/* Spa Option */}
                <button
                  type="button"
                  onClick={() => setBusinessType('spa')}
                  className={`flex items-center justify-between p-6 rounded-xl transition-all active:scale-[0.98] ${
                    businessType === 'spa' ? 'ring-2 ring-offset-2 shadow-lg' : 'hover:bg-zinc-100'
                  }`}
                  style={{
                    backgroundColor: businessType === 'spa' ? '#5F5E61' : '#EEEEEE',
                    color: businessType === 'spa' ? '#FAFAFA' : '#18181B',
                    ringColor: businessType === 'spa' ? '#F43F5E' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: businessType === 'spa' ? '#FB7185' : '#F43F5E' }}
                    >
                      spa
                    </span>
                    <span className="font-bold text-lg">Spa / Masaj</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: businessType === 'spa' ? '#F43F5E' : 'transparent',
                      border: businessType === 'spa' ? 'none' : '2px solid rgba(244, 63, 94, 0.2)',
                    }}
                  >
                    {businessType === 'spa' && (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1"
                style={{ color: '#5F5E61' }}
              >
                İşletme Logosu{' '}
                <span className="font-medium" style={{ color: '#A1A1AA' }}>
                  (Opsiyonel)
                </span>
              </label>
              <div
                className="w-full aspect-[3/1] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-100 transition-all"
                style={{
                  borderColor: '#E3BDBF',
                  backgroundColor: '#EEEEEE',
                }}
                onClick={() => document.getElementById('logo-upload').click()}
              >
                <span className="material-symbols-outlined text-3xl" style={{ color: '#5F5E61' }}>
                  add_a_photo
                </span>
                <span className="text-sm font-semibold" style={{ color: '#5F5E61' }}>
                  {logoFile ? logoFile.name : 'Yüksek çözünürlüklü logo yükle'}
                </span>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 - Son Adım */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-10">
            {/* Progress Labels */}
            <div className="flex justify-between px-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#F43F5E' }}
              >
                Kimlik
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#F43F5E' }}
              >
                Detaylar
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#F43F5E' }}
              >
                Tamamla
              </span>
            </div>

            {/* Decorative Image */}
            <div className="w-full h-48 rounded-xl overflow-hidden relative group">
              <div
                className="w-full h-full grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700"
                style={{
                  background: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 50%, #18181B 100%)',
                  backgroundSize: 'cover',
                }}
              ></div>
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(24, 24, 27, 0.4), transparent)',
                }}
              ></div>
            </div>

            {/* Address Input */}
            <Input.Textarea
              label="İşletme Adresi"
              {...register('address')}
              error={errors.address?.message}
              placeholder="İşletmeniz nerede bulunuyor?"
              rows={4}
            />

            {/* Terms & Conditions Checkbox */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  className="peer appearance-none w-6 h-6 rounded-md border-2 checked:bg-zinc-900 focus:ring-offset-0 focus:ring-0 transition-all"
                  style={{ borderColor: '#18181B' }}
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="material-symbols-outlined absolute text-white text-lg scale-0 peer-checked:scale-100 transition-transform pointer-events-none">
                  check
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium leading-relaxed" style={{ color: '#18181B' }}>
                  Kullanım Şartlarını kabul ediyorum
                </span>
                <span className="text-sm" style={{ color: '#5F5E61' }}>
                  Bu kutuyu işaretleyerek hizmet sözleşmemizi kabul etmiş olursunuz.
                </span>
              </div>
            </label>

            {/* Security Info Card */}
            <div
              className="rounded-lg p-6 flex items-center gap-5"
              style={{ backgroundColor: 'rgba(226, 226, 226, 0.5)' }}
            >
              <div className="bg-white rounded-full p-3 shadow-sm">
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: '#F43F5E',
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  verified_user
                </span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#18181B' }}>
                  Güvenli Kurulum
                </p>
                <p className="text-xs" style={{ color: '#5F5E61' }}>
                  Verileriniz kurumsal düzeyde güvenlik protokolleri ile şifrelenir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already have account */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium" style={{ color: '#5F5E61' }}>
            Zaten hesabın var mı?{' '}
            <a href="/login" className="font-bold hover:underline" style={{ color: '#F43F5E' }}>
              Giriş yap
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full pb-8 bg-transparent">
        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto text-sm font-medium">
          <div className="flex gap-6" style={{ color: '#71717A' }}>
            <a href="#" className="hover:opacity-80 transition-all">
              Kayıt Ol
            </a>
            <a href="#" className="hover:opacity-80 transition-all">
              Gizlilik
            </a>
            <a href="#" className="hover:opacity-80 transition-all">
              Şartlar
            </a>
          </div>
          <p style={{ color: '#71717A' }}>© 2024 ePOS CRM</p>
        </div>
      </footer>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 w-full z-50 rounded-t-[3rem] backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(250, 250, 250, 0.8)',
          boxShadow: '0 -10px 40px -10px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex justify-between items-center w-full px-8 pb-10 pt-4 max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center justify-center px-8 py-4 h-14 transition-all ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-80 active:scale-95'
            }`}
            style={{ color: '#71717A' }}
          >
            <span className="material-symbols-outlined mr-2">arrow_back</span>
            <span className="text-sm font-bold uppercase tracking-widest">Geri</span>
          </button>

          {/* Next Button */}
          <Button onClick={handleNext} disabled={loading} size="lg" className="shadow-xl">
            {loading ? 'İşleniyor...' : currentStep === 3 ? 'İşletmemi Oluştur' : 'İleri'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
        </div>
      </nav>

      {/* Decorative Background Element */}
      <div className="fixed top-1/2 -right-24 -translate-y-1/2 w-64 h-96 opacity-10 pointer-events-none rotate-12 overflow-hidden rounded-xl">
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
            filter: 'blur(60px)',
          }}
        ></div>
      </div>

      {/* Custom CSS for input focus */}
      <style>{`
        .input-focus-accent:focus-within {
          border-left: 2px solid #F43F5E;
        }
        input:focus + .focus-indicator {
          opacity: 1 !important;
        }
        .ghost-border-focus:focus-within {
          background-color: #ffffff;
          border-left: 2px solid #F43F5E;
        }
      `}</style>
    </div>
  );
}
