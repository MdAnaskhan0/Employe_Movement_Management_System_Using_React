import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
// Admin
import MovementReports from '../pages/roles/admin/MovementReports';
import UserProfile from '../pages/roles/admin/UserProfile';
import Users from '../pages/roles/admin/Users';

// Team Manager
import AllMovementReports from '../pages/roles/manager/MovementReports';

// Team Leader
import UploadReport from '../pages/roles/teamLeader/UploadReportLeader';
import LeaderReport from '../pages/roles/teamLeader/LeaderReport';
import TeamReports from '../pages/roles/teamLeader/TeamReports';

// User
import UploadReportUser from '../pages/roles/user/UploadReportUser';
import UserReport from '../pages/roles/user/UserReport';

export default function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin/MovementReports" element={<MovementReports />} />
          <Route path="/admin/UserProfile" element={<UserProfile />} />
          <Route path="/admin/Users" element={<Users />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['accounce', 'manager']} />}>
          <Route path="/movement-reports" element={<AllMovementReports />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['teamLeader']} />}>
          <Route path="/team/upload-report" element={<UploadReport />} />
          <Route path="/team/LeaderReport" element={<LeaderReport />} />
          <Route path="/team/TeamReports" element={<TeamReports />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['user']} />}>
          <Route path="/user/upload-report" element={<UploadReportUser />} />
          <Route path="/user/UserReport" element={<UserReport />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}