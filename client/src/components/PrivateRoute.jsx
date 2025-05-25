// PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // Normalize the user role: lowercase and remove spaces
  const normalizedUserRole = user.role.toLowerCase().replace(/\s+/g, '');

  // Normalize all allowedRoles similarly
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().replace(/\s+/g, ''));

  // Check if normalized user role is allowed
  return normalizedAllowedRoles.includes(normalizedUserRole) ? <Outlet /> : <Navigate to="/unauthorized" />;
};
