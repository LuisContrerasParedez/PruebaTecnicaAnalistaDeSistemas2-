// src/components/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectAuth } from '../app/store';

export default function AdminRoute() {
  const { user } = useAppSelector(selectAuth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Determina si es admin (por id de rol o por nombre)
  const rolNombre =
    user?.rol_nombre ??
    (typeof user?.rol === 'string' ? user.rol : user?.rol?.nombre ?? '');

  const isAdmin = user?.CodigoRol === 1 || /admin/i.test(rolNombre || '');

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
