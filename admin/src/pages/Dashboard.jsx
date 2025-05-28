import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [movementReports, setMovementReports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [companyNames, setCompanyNames] = useState([]);
  const [branchNames , setBranchNames] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [partyNames , setPartyNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;


  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users`);
        const responseMovementReports = await axios.get(`${baseUrl}/get_all_movement`);
        const responseTeams = await axios.get(`${baseUrl}/teams`);
        const responseCompanyNames = await axios.get(`${baseUrl}/companynames`);
        const responseBranchNames = await axios.get(`${baseUrl}/branchnames`);
        const responseDesignations = await axios.get(`${baseUrl}/designations`);
        const responseDepartments = await axios.get(`${baseUrl}/departments`);
        const responseRoles = await axios.get(`${baseUrl}/roles`); 
        const responsePartyNames = await axios.get(`${baseUrl}/partynames`);

        setUsers(response.data.data);
        setMovementReports(responseMovementReports.data);
        setTeams(responseTeams.data.data);
        setCompanyNames(responseCompanyNames.data.data);
        setBranchNames(responseBranchNames.data);
        setDepartments(responseDepartments.data);
        setDesignations(responseDesignations.data);
        setPartyNames(responsePartyNames.data);
        setRoles(responseRoles.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow p-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          {children || (
            <>
              <h2 className="text-3xl font-bold mb-6">Welcome, Admin!</h2>
              <p className="mb-8 text-gray-700">
                Here is the overview of your admin panel.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow" onClick={() => navigate('/dashboard/alluser')}>
                  <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow" onClick={() => navigate('/dashboard/movementreports')}>
                  <h3 className="text-lg font-semibold mb-2">Total Movement Reports</h3>
                  <p className="text-3xl font-bold text-green-600">{movementReports.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/allteam')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Teams</h3>
                  <p className="text-3xl font-bold text-red-600">{teams.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/companynames')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Company Names</h3>
                  <p className="text-3xl font-bold text-red-600">{companyNames.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/branchnames')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Branch Names</h3>
                  <p className="text-3xl font-bold text-red-600">{branchNames.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/designations')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Designations</h3>
                  <p className="text-3xl font-bold text-red-600">{designations.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/departments')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Departments</h3>
                  <p className="text-3xl font-bold text-red-600">{departments.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/partynames')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Party Names</h3>
                  <p className="text-3xl font-bold text-red-600">{partyNames.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow' onClick={() => navigate('/dashboard/roles')}>
                  <h3 className='text-lg font-semibold mb-2'>Total Roles</h3>
                  <p className="text-3xl font-bold text-red-600">{roles.length}</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;