import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Private/ProtectedRoute';
import CreateUser from './pages/CreateUser';
import MovementReports from './pages/MovementReports';
import AllUser from './pages/AllUser';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {/* This will wrap all nested routes */}
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/dashboard/createuser" element={<CreateUser />} />
          <Route path="/dashboard/movementreports" element={<MovementReports />} />
          <Route path="/dashboard/alluser" element={<AllUser />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
