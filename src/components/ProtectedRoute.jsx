import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();

  // Eğer telsizden (session) onay gelmezse, direkt Login'e fırlat
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Patron içerideyse geçişe izin ver
  return children;
}
