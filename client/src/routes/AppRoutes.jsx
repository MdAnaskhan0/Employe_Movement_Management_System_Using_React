import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
// Admin
import MovementReports from '../pages/roles/admin/MovementReports';
import UserProfile from '../pages/roles/admin/UserProfile';
import Users from '../pages/roles/admin/Users';
// Manager
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
        {/* Public Home Route (with Login Form) */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'teamLeader', 'user']} />}>
          <Route
            path="*"
            element={
              <>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-4 min-h-[80vh] bg-white">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/unauthorized" element={<div>Unauthorized</div>} />

                      {/* Admin */}
                      <Route path="/admin/MovementReports" element={<MovementReports />} />
                      <Route path="/admin/UserProfile" element={<UserProfile />} />
                      <Route path="/admin/Users" element={<Users />} />

                      {/* Manager */}
                      <Route path="/movement-reports" element={<AllMovementReports />} />

                      {/* Team Leader */}
                      <Route path="/team/upload-report" element={<UploadReport />} />
                      <Route path="/team/LeaderReport" element={<LeaderReport />} />
                      <Route path="/team/TeamReports" element={<TeamReports />} />

                      {/* User */}
                      <Route path="/user/upload-report" element={<UploadReportUser />} />
                      <Route path="/user/UserReport" element={<UserReport />} />

                      {/* Not Found */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
                <ToastContainer position="bottom-right" autoClose={3000} />
              </>
            }
          />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}
