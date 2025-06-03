import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import TeamChat from './TeamChat';
import { toast } from 'react-toastify';
import { FaUsers, FaUserShield, FaIdCard, FaListUl, FaBell, FaEllipsisV, FaSearch } from 'react-icons/fa';
import { TailSpin } from 'react-loader-spinner';
import LogoutButton from '../LogoutButton';

const TeamMassage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [showTeamList, setShowTeamList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
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
    setShowTeamList(false);

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

  const toggleTeamList = () => {
    setShowTeamList(!showTeamList);
  };

  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.team_leader_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <TailSpin color="#3B82F6" height={50} width={50} />
    </div>
  );

  if (teams.length === 0) return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
      <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
        <FaUsers className="text-3xl text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">No Teams Found</h3>
      <p className="text-gray-500 mt-2">You are not assigned to any teams yet.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Team Chat</h1>
        <div className="flex items-center space-x-4">
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Team List Sidebar */}
        <div className={`${showTeamList ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Your Teams ({filteredTeams.length})</h3>
            <div className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto">
              {filteredTeams.map(team => (
                <div
                  key={team.team_id}
                  onClick={() => handleTeamSelect(team)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center
                  ${selectedTeam?.team_id === team.team_id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{team.team_name}</h4>
                      <p className="text-xs text-gray-500">{team.team_leader_name}</p>
                    </div>
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
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={toggleTeamList}
              className="text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            >
              <FaUsers className="text-xl" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedTeam ? selectedTeam.team_name : 'Select a Team'}
            </h3>
            <div className="w-8"></div>
          </div>

          {selectedTeam ? (
            <>
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedTeam.team_name}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedTeam.team_members.split(',').length} members
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTeamDetails}
                  className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <FaEllipsisV />
                </button>
              </div>

              {showTeamDetails && (
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex flex-row gap-4 items-center w-full">

                    {/* Team leader info */}
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <div className="flex items-center mb-2">
                        <FaUserShield className="text-blue-500 mr-2" />
                        <h4 className="font-medium text-gray-700">Team Leader</h4>
                      </div>
                      <p className="text-sm text-gray-600">{selectedTeam.team_leader_name}</p>
                    </div>
                    
                    {/* Team members info */}
                    <div className="bg-white p-3 rounded-lg shadow-xs col-span-2">
                      <div className="flex items-center mb-2">
                        <FaListUl className="text-blue-500 mr-2" />
                        <h4 className="font-medium text-gray-700">Members</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeam.team_members.split(',').map((member, index) => (
                          <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                            {member.trim()}
                          </span>
                        ))}
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
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
              <div className="bg-blue-100 p-6 rounded-full mb-4">
                <FaUsers className="text-4xl text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Team Selected</h3>
              <p className="text-sm">Select a team from the sidebar to start chatting</p>
              <button
                onClick={toggleTeamList}
                className="mt-4 md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Browse Teams
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMassage;