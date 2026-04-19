import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../utils/validationSchemas';
import { sanitizeInput, checkRateLimit } from '../utils/sanitize';
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from '../components/ToastProvider';
import { handleError } from '../utils/errorHandler';
import { RATE_LIMIT } from '../constants';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (formData) => {
    // Rate limiting kontrolü
    const clientId = `login_${formData.email}`;
    if (!checkRateLimit(clientId, 5, 60000)) {
      showErrorToast('Çok fazla deneme yaptınız. Lütfen 1 dakika bekleyin.');
      return;
    }

    const toastId = showLoadingToast('Giriş yapılıyor...');

    try {
      // Input sanitization
      const sanitizedEmail = sanitizeInput(formData.email.toLowerCase().trim());
      const sanitizedPassword = formData.password; // Şifre sanitize edilmez

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) throw error;

      dismissToast(toastId);
      showSuccessToast('Giriş başarılı! Yönlendiriliyorsunuz...');

      // Başarılı giriş sonrası dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      dismissToast(toastId);

      // Kullanıcı dostu hata mesajları
      let errorMessage = 'Giriş başarısız. Lütfen tekrar deneyin.';

      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email veya şifre hatalı.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email adresinizi doğrulamanız gerekiyor.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.';
      }

      showErrorToast(errorMessage);
      console.error('Login error:', error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#EEEEEE' }}
    >
      {/* Mobile Container */}
      <main
        className="w-full max-w-md min-h-[812px] flex flex-col ambient-shadow rounded-xl overflow-hidden relative"
        style={{ backgroundColor: '#F9F9F9' }}
      >
        {/* Top App Bar */}
        <nav className="flex justify-between items-center w-full px-6 py-8">
          <div className="text-2xl font-black tracking-tighter" style={{ color: '#18181B' }}>
            ePOS CRM
          </div>
          <div className="cursor-pointer" style={{ color: '#5F5E61' }}>
            <span className="material-symbols-outlined">help</span>
          </div>
        </nav>

        {/* Content Canvas */}
        <div className="flex-1 px-8 pt-4 pb-12">
          {/* Hero Header */}
          <header className="mb-12">
            <h1
              className="text-4xl font-extrabold tracking-tight mb-2"
              style={{ color: '#18181B' }}
            >
              Hoş geldin
            </h1>
            <p className="text-lg font-medium" style={{ color: '#5F5E61' }}>
              Hesabına giriş yap
            </p>
          </header>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label
                className="block text-[10px] font-bold tracking-widest uppercase mb-2 ml-1"
                style={{ color: '#A1A1AA' }}
              >
                E-Posta Adresi
              </label>
              <div
                className="relative flex items-center rounded-xl h-14 px-4 signature-focus"
                style={{ backgroundColor: '#EEEEEE' }}
              >
                <span className="material-symbols-outlined mr-3" style={{ color: '#A1A1AA' }}>
                  mail
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-zinc-400"
                  style={{ color: '#18181B', outline: 'none' }}
                  placeholder="isim@sirket.com"
                  type="email"
                  {...register('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium mt-1 ml-1" style={{ color: '#EF4444' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label
                className="block text-[10px] font-bold tracking-widest uppercase mb-2 ml-1"
                style={{ color: '#A1A1AA' }}
              >
                Şifre
              </label>
              <div
                className="relative flex items-center rounded-xl h-14 px-4 signature-focus"
                style={{ backgroundColor: '#EEEEEE' }}
              >
                <span className="material-symbols-outlined mr-3" style={{ color: '#A1A1AA' }}>
                  lock
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-zinc-400"
                  style={{ color: '#18181B', outline: 'none' }}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="transition-colors"
                  style={{ color: '#A1A1AA' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium mt-1 ml-1" style={{ color: '#EF4444' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div
                    className="w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all"
                    style={{
                      borderColor: rememberMe ? '#5F5E61' : '#5F5E61',
                      backgroundColor: rememberMe ? '#5F5E61' : 'transparent',
                    }}
                  >
                    {rememberMe && (
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="ml-3 text-sm font-semibold transition-colors"
                  style={{ color: '#5F5E61' }}
                >
                  Beni hatırla
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-bold transition-opacity hover:opacity-80"
                style={{ color: '#F43F5E' }}
              >
                Şifremi unuttum?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(to right, #F43F5E, #FB7185)',
                boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.2)',
              }}
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E4E4E7' }}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4" style={{ backgroundColor: '#F9F9F9', color: '#A1A1AA' }}>
                Veya devam et
              </span>
            </div>
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            className="w-full h-14 border-2 bg-white rounded-full flex items-center justify-center gap-3 hover:bg-zinc-50 transition-colors active:scale-95 transition-transform"
            style={{ borderColor: '#E4E4E7' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10V12.05H15.4818C15.2273 13.3 14.5091 14.3591 13.4364 15.0682V17.5773H16.7364C18.7091 15.7682 19.8 13.2318 19.8 10.2273Z"
                fill="#4285F4"
              />
              <path
                d="M10 20C12.7 20 14.9636 19.1045 16.7364 17.5773L13.4364 15.0682C12.5182 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2 4.40455 11.8H0.990909V14.3909C2.75455 17.8909 6.10909 20 10 20Z"
                fill="#34A853"
              />
              <path
                d="M4.40455 11.8C4.18182 11.2 4.05455 10.5591 4.05455 9.90909C4.05455 9.25909 4.18182 8.61818 4.40455 8.01818V5.42727H0.990909C0.359091 6.68636 0 8.10909 0 9.90909C0 11.7091 0.359091 13.1318 0.990909 14.3909L4.40455 11.8Z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.10909 0 2.75455 2.10909 0.990909 5.42727L4.40455 8.01818C5.19091 5.6 7.39545 3.97727 10 3.97727Z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-bold" style={{ color: '#18181B' }}>
              Google ile giriş yap
            </span>
          </button>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-4 w-full pb-10">
          <div className="text-sm font-medium" style={{ color: '#71717A' }}>
            Hesabın yok mu?{' '}
            <a
              href="/register"
              className="font-bold hover:underline ml-1"
              style={{ color: '#F43F5E' }}
            >
              Kayıt Ol
            </a>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-xs font-medium transition-all"
              style={{ color: '#A1A1AA' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
            >
              Gizlilik Politikası
            </a>
            <a
              href="#"
              className="text-xs font-medium transition-all"
              style={{ color: '#A1A1AA' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
            >
              Kullanım Şartları
            </a>
          </div>
          <div
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: '#D4D4D8' }}
          >
            © 2024 ePOS CRM
          </div>
        </footer>

        {/* Decorative Elements */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(244, 63, 94, 0.05)' }}
        ></div>
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(95, 94, 97, 0.05)' }}
        ></div>
      </main>
    </div>
  );
}
