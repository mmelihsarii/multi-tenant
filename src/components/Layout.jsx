import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { showSuccessToast } from './ToastProvider';

export default function Layout({ children }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      const name = session.user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showSuccessToast('Başarıyla çıkış yaptınız');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation - Desktop */}
      <aside className="h-screen w-64 hidden lg:flex flex-col bg-zinc-900 py-8 shadow-2xl sticky top-0">
        <div className="px-8 mb-12">
          <h1 className="text-white font-black italic tracking-tighter text-2xl">Atelier Luxe</h1>
          <p className="uppercase tracking-widest text-[10px] text-zinc-500 mt-1">
            Premium Management
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-4 ${isActive('/dashboard') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <Link
            to="/appointments"
            className={`flex items-center gap-4 ${isActive('/appointments') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">event_upcoming</span>
            <span className="uppercase tracking-widest text-[10px]">Randevular</span>
          </Link>
          <Link
            to="/services"
            className={`flex items-center gap-4 ${isActive('/services') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">content_cut</span>
            <span className="uppercase tracking-widest text-[10px]">Hizmetler</span>
          </Link>
          <Link
            to="/staff"
            className={`flex items-center gap-4 ${isActive('/staff') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="uppercase tracking-widest text-[10px]">Personel</span>
          </Link>
          <button
            disabled
            className="flex items-center gap-4 text-zinc-600 pl-4 py-3 cursor-not-allowed opacity-50"
            title="Yakında aktif olacak"
          >
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="uppercase tracking-widest text-[10px]">Raporlar</span>
          </button>
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <button className="w-full h-14 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            <span>Yeni Randevu</span>
          </button>

          <div className="pt-8 space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 text-zinc-400 hover:text-zinc-100 pl-4 py-2 text-[10px] uppercase tracking-widest hover:bg-zinc-800 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-zinc-900 py-8 shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-8 mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-white font-black italic tracking-tighter text-2xl">Atelier Luxe</h1>
            <p className="uppercase tracking-widest text-[10px] text-zinc-500 mt-1">
              Premium Management
            </p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:text-rose-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-4 ${isActive('/dashboard') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <Link
            to="/appointments"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-4 ${isActive('/appointments') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">event_upcoming</span>
            <span className="uppercase tracking-widest text-[10px]">Randevular</span>
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-4 ${isActive('/services') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">content_cut</span>
            <span className="uppercase tracking-widest text-[10px]">Hizmetler</span>
          </Link>
          <Link
            to="/staff"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-4 ${isActive('/staff') ? 'text-white font-bold border-l-2 border-rose-500' : 'text-zinc-400 hover:text-zinc-100'} pl-4 py-3 hover:bg-zinc-800 transition-all ease-in-out duration-300`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="uppercase tracking-widest text-[10px]">Personel</span>
          </Link>
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-zinc-400 hover:text-zinc-100 pl-4 py-2 text-[10px] uppercase tracking-widest hover:bg-zinc-800 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-y-auto pb-20 lg:pb-0">
        {/* Top App Bar */}
        <header className="w-full top-0 sticky z-40 bg-zinc-50 flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-700 hover:bg-zinc-100 transition-colors rounded-lg active:scale-95 duration-200"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-zinc-900 lg:hidden">
              Atelier Luxe
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 transition-colors rounded-full active:scale-95 duration-200">
              <span className="material-symbols-outlined text-xl sm:text-2xl">calendar_today</span>
            </button>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 transition-colors rounded-full active:scale-95 duration-200 relative">
              <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-zinc-50"></span>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-zinc-200 ml-2 bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}

        {/* Footer */}
        <footer className="mt-auto py-8 sm:py-12 px-4 sm:px-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-zinc-400 text-xs sm:text-sm text-center md:text-left">
            © 2024 Atelier Luxe SaaS. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-zinc-400 text-xs sm:text-sm font-medium">
            <a className="hover:text-rose-600 transition-colors" href="#">
              Gizlilik Politikası
            </a>
            <a className="hover:text-rose-600 transition-colors" href="#">
              Kullanım Şartları
            </a>
            <a className="hover:text-rose-600 transition-colors" href="#">
              Yardım Merkezi
            </a>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 sm:px-6 pb-4 sm:pb-6 pt-3 bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] lg:hidden rounded-t-xl">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] ${isActive('/dashboard') ? 'bg-rose-500 text-white' : 'text-zinc-400'} rounded-full p-3 transition-transform active:scale-90`}
        >
          <span className="material-symbols-outlined">home</span>
        </Link>
        <Link
          to="/appointments"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] ${isActive('/appointments') ? 'bg-rose-500 text-white' : 'text-zinc-400'} rounded-full p-3 transition-transform active:scale-90`}
        >
          <span className="material-symbols-outlined">calendar_month</span>
        </Link>
        <Link
          to="/services"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] ${isActive('/services') ? 'bg-rose-500 text-white' : 'text-zinc-400'} rounded-full p-3 transition-transform active:scale-90`}
        >
          <span className="material-symbols-outlined">content_cut</span>
        </Link>
        <Link
          to="/staff"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] ${isActive('/staff') ? 'bg-rose-500 text-white' : 'text-zinc-400'} rounded-full p-3 transition-transform active:scale-90`}
        >
          <span className="material-symbols-outlined">badge</span>
        </Link>
      </nav>
    </div>
  );
}
