import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import JsonUpdater from './components/JsonUpdate/JsonUpdater';
import Home from './pages/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Private/ProtectedRoute';
import CreateUser from './pages/CreateUser';
import MovementReports from './pages/MovementReports';
import AllUser from './pages/AllUser';
import UserProfile from './pages/UserProfile';
import CompanyNames from './pages/SettingsPages/CompanyNames';
import Departments from './pages/SettingsPages/Departments';
import Designations from './pages/SettingsPages/Designations';
import BranchNames from './pages/SettingsPages/BranchNames';
import PartyNames from './pages/SettingsPages/PartyNames';
import Roles from './pages/SettingsPages/Roles';
import VisitingStatus from './pages/SettingsPages/VisitingStatus';
import CreateTeams from './pages/TeamManagement/CreateTeams';
import ViewTeams from './pages/TeamManagement/ViewTeams';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes Under /dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="createuser" element={<CreateUser />} />
          <Route path="alluser" element={<AllUser />} />
          <Route path="userprofile/:userID" element={<UserProfile />} />
          <Route path="createteam" element={<CreateTeams />} />
          <Route path="allteam" element={<ViewTeams />} />
          <Route path="movementreports" element={<MovementReports />} />
          <Route path="jsonupdater" element={<JsonUpdater />} />
          <Route path="companynames" element={<CompanyNames />} />
          <Route path="branchnames" element={<BranchNames />} />
          <Route path="designations" element={<Designations />} />
          <Route path="departments" element={<Departments />} />
          <Route path="partynames" element={<PartyNames />} />
          <Route path="visitingstatus" element={<VisitingStatus />} />
          <Route path="roles" element={<Roles />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
