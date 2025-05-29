import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import TeamChat from './TeamChat';
import { toast } from 'react-toastify';
import { FaUsers, FaUserShield, FaIdCard, FaListUl, FaBell, FaEllipsisV } from 'react-icons/fa';
import { TailSpin } from 'react-loader-spinner';

const TeamMassage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseUrl}/teams`);
        const allTeams = res.data.data;

        let filteredTeams = [];
        if (user.role === 'team leader') {
          filteredTeams = allTeams.filter(team => team.team_leader_name === user.name);
        } else if (user.role === 'user') {
          filteredTeams = allTeams.filter(team =>
            team.team_members.split(',').map(name => name.trim()).includes(user.name)
          );
        }

        setTeams(filteredTeams);
        
        const counts = {};
        filteredTeams.forEach(team => {
          counts[team.team_id] = 0;
        });
        setUnreadCounts(counts);
        
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [baseUrl, user.name, user.role]);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(false);
    // toast.success(`Switched to ${team.team_name}`);
    
    setUnreadCounts(prev => ({
      ...prev,
      [team.team_id]: 0
    }));
  };

  const updateUnreadCount = (teamId, count) => {
    if (!selectedTeam || selectedTeam.team_id !== teamId) {
      setUnreadCounts(prev => ({
        ...prev,
        [teamId]: count
      }));
    }
  };

  const toggleTeamDetails = () => {
    setShowTeamDetails(!showTeamDetails);
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
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md flex">
      {/* Team List Sidebar */}
      <div className="w-1/4 border-r border-gray-200 pr-4">
        <div className="flex items-center mb-6">
          <FaUsers className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Your Teams</h3>
        </div>

        <div className="space-y-2">
          {teams.map(team => (
            <div
              key={team.team_id}
              onClick={() => handleTeamSelect(team)}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center
                ${selectedTeam?.team_id === team.team_id 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-100'}`}
            >
              <div>
                <h4 className="font-medium text-gray-800">{team.team_name}</h4>
                <p className="text-xs text-gray-500">{team.team_leader_name}</p>
              </div>
              {unreadCounts[team.team_id] > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts[team.team_id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-3/4 pl-6">
        {selectedTeam ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedTeam.team_name} Chat
              </h3>
              <button 
                onClick={toggleTeamDetails}
                className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
              >
                <FaEllipsisV />
              </button>
            </div>

            {showTeamDetails && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <FaUserShield className="mr-2 text-blue-500" />
                  Team Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <FaIdCard className="text-gray-500 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Team ID</p>
                      <p className="font-medium">{selectedTeam.team_id}</p>
                    </div>
                  </div>
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
                  <div className="flex items-start">
                    <FaListUl className="text-gray-500 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Members</p>
                      <p className="font-medium">{selectedTeam.team_member_ids}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TeamChat 
              selectedTeam={selectedTeam} 
              user={user} 
              updateUnreadCount={updateUnreadCount}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FaUsers className="text-4xl mb-4" />
            <p className="text-lg">Select a team to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMassage;