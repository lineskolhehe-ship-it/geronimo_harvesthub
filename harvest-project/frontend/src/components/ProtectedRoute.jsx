import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * - Not logged in  → /login
 * - `roles` given and user's role not included → back to the dashboard
 * Works as a wrapper (children) or as a layout route (Outlet).
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner text="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children ?? <Outlet />;
}
