import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import TeamChat from './TeamChat';

const TeamMassage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  console.log('user', user);
  console.log('selectedTeam', selectedTeam);
  console.log('teams', teams);

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
  };

  if (loading) return <p>Loading teams...</p>;
  if (teams.length === 0) return <p>No teams found for user {user.name}</p>;

  return (
    <div>
      <h3>Teams for {user.name}:</h3>
      <select onChange={handleTeamChange} defaultValue="">
        <option value="" disabled>Select a team</option>
        {teams.map(team => (
          <option key={team.team_id} value={team.team_id}>
            {team.team_name}
          </option>
        ))}
      </select>
      {selectedTeam && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <h4>Selected Team Details:</h4>
            <p><strong>Team ID:</strong> {selectedTeam.team_id}</p>
            <p><strong>Team Name:</strong> {selectedTeam.team_name}</p>
            <p><strong>Team Leader ID:</strong>{selectedTeam.team_leader_id}</p>
            <p><strong>Team Member IDs:</strong> {selectedTeam.team_member_ids}</p>
            <p><strong>Team Leader Name:</strong> {selectedTeam.team_leader_name}</p>
          </div>
          <TeamChat selectedTeam={selectedTeam} user={user} />
        </>
      )}

    </div>
  );
};

export default TeamMassage;



// now I can track my team all information team Id team leader team members id so I want to create a massage operation: to chat as a group.
// ->Like when I select a team I can send message on the group all the member and the leaders can see the message and they can also massage on the group.
// ->One team massage is not showing to other group. and
// ->massage should be save on the database. and
// ->previous massage should be shown in the massage box
