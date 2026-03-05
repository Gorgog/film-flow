import { useAuthStore } from '@/stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';

export function GuestOnlyRoute() {
  const { user, loading } = useAuthStore();

  if (loading) return <div>Загрузка...</div>;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}
