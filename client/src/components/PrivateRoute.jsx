// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  const normalizedUserRole = user.role.toLowerCase().replace(/\s+/g, '');
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().replace(/\s+/g, ''));

  return normalizedAllowedRoles.includes(normalizedUserRole)
    ? <Outlet />
    : <Navigate to="/unauthorized" />;
};
