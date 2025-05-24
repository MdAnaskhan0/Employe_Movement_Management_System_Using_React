import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';

const ViewTeams = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://192.168.111.140:5137/teams');
        if (response.data.status === 'ok') {
          setTeams(response.data.data);
        } else {
          setError('Failed to load team data');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
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

          <h1 className="text-xl font-semibold text-gray-800">All Team Management</h1>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4">Team Details</h2>

          {isLoading && <p>Loading teams...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {teams.map((team) => (
            <div key={team.leaderID} className="mb-6 p-4 bg-white rounded shadow">
              <h3 className="text-lg font-bold text-blue-700">
                Team Leader: {team.leaderName} <span className="text-sm text-gray-500">({team.leaderDepartment})</span>
              </h3>
              <ul className="mt-2 list-disc list-inside text-gray-700">
                {team.members.map((member) => (
                  <li key={member.memberID}>
                    <span className="font-medium">{member.username}</span> – {member.Designation}, {member.Company_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </main>

      </div>
    </div>
  );
};

export default ViewTeams;