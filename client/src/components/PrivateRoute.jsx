import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" />;
};
