import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';

const ManageTeam = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [teams, setTeams] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseUrl}/teams`);
        const allTeams = res.data.data;

        const userTeams = allTeams.filter(team => team.team_leader_name === user.name);
        setTeams(userTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    if (user?.name) {
      fetchTeams();
    }
  }, [user?.name, baseUrl]);

  return (
    <>
      <h1>Teams Management</h1>
      <div>
        <h2>Teams</h2>
        <ul>
          {teams.map((team, index) => (
            <li key={index}>
              <strong>{index + 1}.</strong>
              <strong>{team.team_name}</strong> — Leader: {team.team_leader_name} — Members: {team.team_members}
            </li>
          ))}
        </ul>
        {teams.length > 0 && (
          <div>
            <button>Add member</button>
            <button>Remove member</button>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageTeam;
