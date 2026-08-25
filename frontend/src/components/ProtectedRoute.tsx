import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { LoadingSpinner } from './ui';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <LoadingSpinner />;
  const map: Record<Role, string> = {
    CLIENT: '/dashboard/client',
    AGENT: '/dashboard/agent',
    MANAGER: '/dashboard/manager',
    ADMIN: '/dashboard/admin',
  };
  return <Navigate to={map[user.role]} replace />;
}
