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
import Profile from '../pages/roles/user/Profile';
// Admin
import UserProfile from '../pages/roles/admin/UserProfile';
import Users from '../pages/roles/admin/Users';
// Manager
import AllMovementReports from '../pages/roles/manager/MovementReports';
// Team Leader
import ManageTeam from '../pages/roles/teamLeader/ManageTeam';
import TeamReport from '../pages/roles/teamLeader/TeamReport';
// User
import UploadReportUser from '../pages/roles/user/UploadReportUser';
import UserReport from '../pages/roles/user/UserReport';

// Team
import TeamMassage from '../components/TeamMassage/TeamMassage';

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
                  <main className="flex-1 p-4 min-h-[80vh] bg-white overflow-hidden">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/unauthorized" element={<div>Unauthorized</div>} />

                      {/* Admin */}
                      <Route path="/admin/movement-reports" element={<AllMovementReports />} />
                      <Route path="/admin/user-profile" element={<UserProfile />} />
                      <Route path="/admin/Users" element={<Users />} />

                      {/* Manager */}
                      <Route path="/movement-reports" element={<AllMovementReports />} />

                      {/* Team Leader */}
                      <Route path="team/manage-team" element={<ManageTeam />}/>
                      <Route path="team/team-report" element={<TeamReport />}/>
                      <Route path="team/team-massage" element={<TeamMassage />}/>

                      {/* User */}
                      <Route path="/user/profile" element={<Profile />} />
                      <Route path="/user/upload-report" element={<UploadReportUser />} />
                      <Route path="/user/UserReport" element={<UserReport />} />
                      <Route path="/user/team-massage" element={<TeamMassage />} />

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
