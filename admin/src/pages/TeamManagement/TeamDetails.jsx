import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const TeamDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { teamID } = useParams();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.111.140:5137/teams/${teamID}`);
        setTeamData(response.data.data);
      } catch (err) {
        setError('Failed to fetch team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamID]);


  const handleDeleteTeam = async () => {
    try {
      await axios.delete(`http://192.168.111.140:5137/teams/${teamID}`);
      alert('Team deleted successfully');
      navigate('/dashboard/allteam');
    } catch (err) {
      alert('Failed to delete team');
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axios.get(`http://192.168.111.140:5137/unassigned-users`);
      const unassignedUsers = response.data.data;

      if (unassignedUsers.length === 0) {
        alert("No unassigned users available.");
        return;
      }

      const userOptions = unassignedUsers.map(u => `${u.userID}: ${u.Name}`).join('\n');
      const selectedId = prompt(`Select a user by ID:\n${userOptions}`);

      const memberId = parseInt(selectedId);
      if (!memberId) return;

      await axios.patch(`http://192.168.111.140:5137/teams/${teamID}/add-member`, {
        member_id: memberId
      });

      alert('Member added successfully');
      window.location.reload();
    } catch (err) {
      alert('Failed to add member');
    }
  };


  const handleRemoveMember = async () => {
    try {
      // Fetch team details again to get current members
      const response = await axios.get(`http://192.168.111.140:5137/teams/${teamID}`);
      const teamMembers = response.data.data?.team_members;

      if (!teamMembers || teamMembers.length === 0) {
        alert("No team members found.");
        return;
      }

      // In case team_members is a string like "Alice,Bob,Charlie", split it
      const memberNames = teamMembers.split(',');
      const memberOptions = memberNames.map((name, index) => `${index + 1}: ${name}`).join('\n');

      const selectedIndex = prompt(`Select a member to remove:\n${memberOptions}`);
      const index = parseInt(selectedIndex) - 1;

      if (index < 0 || index >= memberNames.length) return;

      const selectedName = memberNames[index];

      // Fetch userID for the selected member name
      const userRes = await axios.get(`http://192.168.111.140:5137/users/by-name/${encodeURIComponent(selectedName)}`);
      const member_id = userRes.data.data?.userID;

      if (!member_id) {
        alert('User not found');
        return;
      }

      // Remove the selected member
      await axios.patch(`http://192.168.111.140:5137/teams/${teamID}/remove-member`, {
        member_id
      });

      alert('Member removed successfully');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to remove member');
    }
  };


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Team Details</h1>
        </header>

        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          {loading && <p className="text-gray-600">Loading team information...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {teamData && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Team ID: {teamData.team_id}</h2>
              <p className="mb-2"><strong>Team Leader:</strong> {teamData.team_leader_name}</p>
              <p><strong>Team Members:</strong> {teamData.team_members}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={handleAddMember}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Team Member
            </button>

            <button
              onClick={handleRemoveMember}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Remove Team Member
            </button>
            
            <button
              onClick={handleDeleteTeam}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Team
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default TeamDetails;
