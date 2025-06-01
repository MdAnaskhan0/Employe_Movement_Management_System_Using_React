import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import { FaUser, FaPersonWalkingDashedLineArrowRight, FaCodeBranch } from 'react-icons/fa6';
import { RiTeamFill } from "react-icons/ri";
import { FaBuilding, FaUserCog } from "react-icons/fa";
import { MdDesignServices } from "react-icons/md";
import { TbScanPosition } from "react-icons/tb";
import { SiGooglecolab } from "react-icons/si";

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [movementReports, setMovementReports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [companyNames, setCompanyNames] = useState([]);
  const [branchNames, setBranchNames] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [partyNames, setPartyNames] = useState([]);
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
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer" onClick={() => navigate('/dashboard/alluser')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <FaUser className='text-white text:base md:text-5xl' />
                      <h3 className="text-lg md:text-xl font-bold text-white">Users</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{users.length}</p>
                  </div>

                </div>
                <div className="bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer" onClick={() => navigate('/dashboard/movementreports')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <FaPersonWalkingDashedLineArrowRight className='text-white text:base md:text-5xl' />
                      <h3 className="text-lg md:text-xl font-bold text-white">Movement Reports</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{movementReports.length}</p>
                  </div>
                </div>
                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/allteam')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <RiTeamFill className='text-white text:base md:text-5xl' />
                      <h3 className="text-lg md:text-xl font-bold text-white">Teams</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{teams.length}</p>
                  </div>

                </div>
                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/companynames')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <FaBuilding className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Company Names</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{companyNames.length}</p>
                  </div>
                </div>

                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/branchnames')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <FaCodeBranch className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Branch Names</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{branchNames.length}</p>
                  </div>
                </div>


                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/departments')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <TbScanPosition className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Departments</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{departments.length}</p>
                  </div>
                </div>

                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/designations')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <MdDesignServices className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Designations</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{designations.length}</p>
                  </div>
                </div>

                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/partynames')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <SiGooglecolab className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Party Names</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{partyNames.length}</p>
                  </div>
                </div>

                <div className='bg-red-600 hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 p-6 rounded-lg shadow cursor-pointer' onClick={() => navigate('/dashboard/roles')}>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col items-start gap-1'>
                      <FaUserCog className='text-white text:base md:text-5xl' />
                      <h3 className='text-lg md:text-xl font-bold text-white'>Roles</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-100">{roles.length}</p>
                  </div>
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