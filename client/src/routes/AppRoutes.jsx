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
import CreateUser from '../pages/roles/admin/CreateUser';
import Users from '../pages/roles/admin/Users';
import UserProfile from '../pages/roles/admin/UserProfile';
import Departments from '../pages/roles/admin/Settings/Departments';
import Branchs from '../pages/roles/admin/Settings/Branchs';
import Designations from '../pages/roles/admin/Settings/Designations';
import VisitingStatus from '../pages/roles/admin/Settings/VisitingStatus';
import Teams from '../pages/roles/admin/Teams/Teams';
import TeamDetails from '../pages/roles/admin/Teams/TeamDetails';
import Companies from '../pages/roles/admin/Settings/Companies';
import Parties from '../pages/roles/admin/Settings/Parties';

// Manager
import AllMovementReports from '../pages/roles/manager/MovementReports';
import UserProfileNoEdit from '../pages/roles/manager/UserProfile';
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
        <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'accounce', 'teamLeader', 'user']} />}>
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
                      <Route path="/admin/create-user" element={<CreateUser />} />
                      <Route path="/admin/Users" element={<Users />} />
                      <Route path="/admin/user-profile/:userID" element={<UserProfile />} />
                      <Route path="/admin/movement-reports" element={<AllMovementReports />} />
                      <Route path="/admin/departments" element={<Departments />} />
                      <Route path="/admin/branchs" element={<Branchs />} />
                      <Route path="/admin/designations" element={<Designations />} />
                      <Route path="/admin/visitingstatus" element={<VisitingStatus />} />
                      <Route path="/admin/teams" element={<Teams />} />
                      <Route path="/team/:teamID" element={<TeamDetails />} />
                      <Route path="/admin/companynames" element={<Companies />} />
                      <Route path="/admin/parties" element={<Parties />} />

                      {/* Manager */}
                      <Route path="/movement-reports" element={<AllMovementReports />} />
                      <Route path="/manager/user-profile/:userID" element={<UserProfileNoEdit />} />

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
