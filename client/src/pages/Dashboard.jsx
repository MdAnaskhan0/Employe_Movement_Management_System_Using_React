import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiHome, FiUser, FiUpload, FiFileText, FiActivity, FiUserPlus,
  FiUsers, FiMessageSquare, FiBriefcase, FiLayers, FiMapPin,
  FiAward, FiFlag
} from 'react-icons/fi';

// Menu items with meta
const allDashboardMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <FiHome size={20} /> },
  { name: 'Profile', path: '/user/profile', icon: <FiUser size={20} /> },
  { name: 'Upload Report', path: '/user/upload-report', icon: <FiUpload size={20} /> },
  { name: 'My Reports', path: '/user/UserReport', icon: <FiFileText size={20} /> },
  { name: 'Movement Reports', path: '/admin/movement-reports', icon: <FiActivity size={20} /> },
  { name: 'Create User', path: '/admin/create-user', icon: <FiUserPlus size={20} /> },
  { name: 'Users', path: '/admin/Users', icon: <FiUsers size={20} /> },
  { name: 'Teams', path: '/admin/teams', icon: <FiUsers size={20} /> },
  { name: 'Team Messages', path: '/user/team-massage', icon: <FiMessageSquare size={20} /> },
  { name: 'Companies', path: '/admin/companynames', icon: <FiBriefcase size={20} /> },
  { name: 'Departments', path: '/admin/departments', icon: <FiLayers size={20} /> },
  { name: 'Branchs', path: '/admin/branchs', icon: <FiMapPin size={20} /> },
  { name: 'Designations', path: '/admin/designations', icon: <FiAward size={20} /> },
  { name: 'Visiting Status', path: '/admin/visitingstatus', icon: <FiFlag size={20} /> },
  { name: 'Parties', path: '/admin/parties', icon: <FiUsers size={20} /> }
];

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [permissionPage, setPermissionPage] = useState({});
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
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/users/${user.userID}/permissions`);
        setPermissionPage(res.data.data || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.userID]);

  const filteredMenu = allDashboardMenuItems.filter(item => permissionPage[item.path] === 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Hey, {user?.username} 👋</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      <main className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMenu.map(item => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="text-blue-600">{item.icon}</div>
              <span className="text-gray-700 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
