import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Requests from './pages/Requests';
import HarvestRecords from './pages/HarvestRecords';
import Crops from './pages/Crops';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

/** Login / register are only for guests. */
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      {/* Protected routes (any logged-in user) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="listings" element={<Listings />} />
        <Route path="requests" element={<Requests />} />

        {/* Farmer + admin */}
        <Route element={<ProtectedRoute roles={['farmer', 'admin']} />}>
          <Route path="harvests" element={<HarvestRecords />} />
        </Route>

        {/* Admin-only */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="crops" element={<Crops />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
