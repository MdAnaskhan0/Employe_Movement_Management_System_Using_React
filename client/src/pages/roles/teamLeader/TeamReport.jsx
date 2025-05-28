import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast } from 'react-toastify';

const TeamReport = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [movementData, setMovementData] = useState([]);

  useEffect(() => {
    const fetchMovementData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/get_all_movement`);
        setMovementData(res.data);
      } catch (error) {
        console.error('Error fetching movement data:', error);
      }
    };
    fetchMovementData();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/teams`);
        const userTeams = res.data.data.filter(
          team => team.team_leader_name === user.name
        );

        setTeams(userTeams.map(team => ({
          ...team,
          membersArray: typeof team.team_members === 'string'
            ? team.team_members.split(',').map(member => member.trim())
            : team.team_members,
          memberIDsArray: typeof team.team_member_ids === 'string'
            ? team.team_member_ids.split(',').map(id => Number(id.trim()))
            : team.team_member_ids
        })));
      } catch (error) {
        toast.error('Failed to load teams');
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) fetchTeams();
  }, [user?.name, baseUrl]);

  const currentTeam = teams.find(team => team.team_name === selectedTeam);

  const filteredMovements = movementData.filter(movement => {
    if (selectedTeam === '') return false;
    if (selectedTeam === 'all') return true;

    const team = currentTeam;
    if (!team) return false;

    const memberIDs = team.memberIDsArray;
    const movementDate = new Date(movement.dateTime);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(new Date(toDate).setHours(23, 59, 59, 999)) : null;

    let matchesDate = true;
    if (from && movementDate < from) matchesDate = false;
    if (to && movementDate > to) matchesDate = false;

    if (selectedMember === 'all' || selectedMember === '') {
      return memberIDs.includes(movement.userID) && matchesDate;
    }

    const memberIndex = team.membersArray.findIndex(member => member === selectedMember);
    const selectedMemberID = team.memberIDsArray[memberIndex];
    return movement.userID === selectedMemberID && matchesDate;
  });


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Team Reports</h1>

      <div className="space-y-4 bg-white p-6 rounded-md shadow-md border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Team
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
              setSelectedMember('');
            }}
          >
            <option value="">Select a team</option>
            <option value="all">All teams</option>
            {teams.map((team, index) => (
              <option key={index} value={team.team_name}>
                {team.team_name} {team.team_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Team Member
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            disabled={selectedTeam === ''}
          >
            <option value="">Select a team member</option>
            <option value="all">All team members</option>
            {selectedTeam !== 'all' && currentTeam?.membersArray?.map((member, index) => (
              <option key={index} value={member}>{member}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={() => {
              toast.success('Report generated successfully.');
            }}
            disabled={!fromDate || !toDate || !selectedTeam}
          >
            Generate Report
          </button>
        </div>
      </div>

      {filteredMovements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Movement Data</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1">Username</th>
                <th className="border border-gray-300 px-2 py-1">Date</th>
                <th className="border border-gray-300 px-2 py-1">Punch</th>
                <th className="border border-gray-300 px-2 py-1">Time</th>
                <th className="border border-gray-300 px-2 py-1">Place</th>
                <th className="border border-gray-300 px-2 py-1">Purpose</th>
                <th className="border border-gray-300 px-2 py-1">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((item, index) => (
                <tr key={index} className="text-sm text-gray-700">
                  <td className="border px-2 py-1">{item.username}</td>
                  <td className="border px-2 py-1">{item.dateTime?.slice(0, 10)}</td>
                  <td className="border px-2 py-1">{item.punchTime}</td>
                  <td className="border px-2 py-1">{item.punchingTime}</td>
                  <td className="border px-2 py-1">{item.placeName}</td>
                  <td className="border px-2 py-1">{item.purpose}</td>
                  <td className="border px-2 py-1">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamReport;
