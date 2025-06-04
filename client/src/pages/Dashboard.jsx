import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import UserDashboard from '../components/dashboard/UserDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import TeamLeaderDashboard from '../components/dashboard/TeamLeaderDashboard';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [movementData, setMovementData] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = async () => {
    try {
      await axios.post(`${baseUrl}/logout`, {
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error('Logout logging failed:', error);
    }
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchMovementData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/get_movement/${user.userID}`);
        setMovementData(res.data);
      } catch (error) {
        console.error('Error fetching movement data:', error);
      }
    };

    if (user?.userID) {
      fetchMovementData();
    }
  }, [user]);

  const role = user?.role?.toLowerCase();

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Welcome</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <main>
        {role === 'user' && <UserDashboard movementData={movementData} />}
        {role === 'admin' && <AdminDashboard />}
        {(role === 'manager' || role === 'accounce') && <ManagerDashboard />}
        {role === 'team leader' && <TeamLeaderDashboard movementData={movementData} />}
      </main>
    </div>
  );
};

export default Dashboard;
