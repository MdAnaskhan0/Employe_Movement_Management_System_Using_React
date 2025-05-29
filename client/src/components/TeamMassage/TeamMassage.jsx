import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import TeamChat from './TeamChat';
import { toast } from 'react-toastify';
import { FaUsers, FaUserShield, FaIdCard, FaListUl } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { TailSpin } from 'react-loader-spinner';

const TeamMassage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseUrl}/teams`);
        const allTeams = res.data.data;

        if (user.role === 'team leader') {
          const teamLeaderTeams = allTeams.filter(team => team.team_leader_name === user.name);
          setTeams(teamLeaderTeams);
        } else if (user.role === 'user') {
          const userTeams = allTeams.filter(team =>
            team.team_members.split(',').map(name => name.trim()).includes(user.name)
          );
          setTeams(userTeams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [baseUrl, user.name, user.role]);

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    const team = teams.find(t => String(t.team_id) === teamId);
    setSelectedTeam(team || null);
    toast.success(`Switched to ${team?.team_name || 'no team'}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <TailSpin color="#3B82F6" height={50} width={50} />
    </div>
  );

  if (teams.length === 0) return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700">No Teams Found</h3>
      <p className="text-gray-500 mt-2">You are not assigned to any teams yet.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <FaUsers className="text-blue-500 text-2xl mr-3" />
        <h3 className="text-2xl font-bold text-gray-800">Team Communication</h3>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Team
        </label>
        <div className="relative">
          <select
            onChange={handleTeamChange}
            defaultValue=""
            className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Choose a team</option>
            {teams.map(team => (
              <option key={team.team_id} value={team.team_id}>
                {team.team_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <FiChevronDown />
          </div>
        </div>
      </div>

      {selectedTeam && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <FaUserShield className="mr-2 text-blue-500" />
              Team Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaUsers className="text-gray-500 mt-1 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Team Name</p>
                  <p className="font-medium">{selectedTeam.team_name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaUserShield className="text-gray-500 mt-1 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Team Leader</p>
                  <p className="font-medium">{selectedTeam.team_leader_name}</p>
                </div>
              </div>
            </div>
          </div>

          <TeamChat selectedTeam={selectedTeam} user={user} />
        </div>
      )}
    </div>
  );
};

export default TeamMassage;