import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUniversity } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const LogReport = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/departments'); // Update endpoint as needed
      console.log(response.data); // Process or set state with the data
      toast.success('Departments refreshed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow-sm p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden hover:text-gray-800"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <div className="flex items-center">
            <FaUniversity className="text-blue-600 mr-2 text-xl" />
            <h1 className="text-xl font-semibold text-gray-800">User Logs Report</h1>
          </div>

          <button
            onClick={fetchDepartments}
            className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition"
            disabled={isLoading}
          >
            <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Your page content goes here */}
        <main className="flex-1 p-4 overflow-auto">
          
        </main>

        <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
};

export default LogReport;
