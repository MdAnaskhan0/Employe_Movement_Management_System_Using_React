import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

import AdminDashboard from '../pages/roles/admin/Dashboard';
import CreateUser from '../pages/roles/admin/CreateUser';
import MovementReports from '../pages/roles/manager/MovementReports';
import UploadReport from '../pages/roles/teamLeader/UploadReport';
import UserReport from '../pages/roles/user/UserReport';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div>Unauthorized</div>} />

      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-user" element={<CreateUser />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['accounce', 'manager']} />}>
        <Route path="/movement-reports" element={<MovementReports />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['teamLeader']} />}>
        <Route path="/team/upload-report" element={<UploadReport />} />
        <Route path="/team/my-report" element={<UserReport />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['user']} />}>
        <Route path="/user/my-report" element={<UserReport />} />
        <Route path="/user/upload-report" element={<UploadReport />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}