import { useAuthStore } from '@/stores/auth.store';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
