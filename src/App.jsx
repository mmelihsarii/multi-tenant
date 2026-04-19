import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ToastProvider';
import { InlineLoading } from './components/ui';

// Lazy load pages - Code splitting için
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const Staff = lazy(() => import('./pages/Staff'));
const PublicBooking = lazy(() => import('./pages/PublicBooking'));
const Appointments = lazy(() => import('./pages/Appointments'));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ToastProvider />
          <Suspense fallback={<InlineLoading message="Sayfa yükleniyor..." />}>
            <Routes>
              {/* Kök dizin: Direkt login'e yönlendir */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Herkese açık sayfalar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route path="/booking/:companyId" element={<PublicBooking />} />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* KORUMALI BÖLGE: Bekçiyi kapıya diktik */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
