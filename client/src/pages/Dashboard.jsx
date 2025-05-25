import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout();                
    navigate('/');           
  };

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Welcome to the dashboard page</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Dashboard;
