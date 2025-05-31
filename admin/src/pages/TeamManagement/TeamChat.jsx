import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaTrash, FaUserPlus, FaUserMinus, FaUsers, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const TeamChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const navigate = useNavigate();
  const { teamID } = useParams();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

 

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex items-center justify-start bg-white shadow-sm p-4 border-b border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 focus:outline-none md:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Team Details</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-grow overflow-auto p-4 md:p-6">
          
        </main>
      </div>
    </div>
  );
};

export default TeamChat;