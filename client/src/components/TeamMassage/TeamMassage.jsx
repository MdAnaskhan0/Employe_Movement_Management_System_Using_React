import { useEffect, useState } from 'react';
import { useSocket } from '../../Socket/SocketContext';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function TeamMassage() {
  const socket = useSocket();
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamAssignmentId, setTeamAssignmentId] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch teams for user
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user?.name) return;

      try {
        const res = await axios.get(`${baseUrl}/teams`);
        const teamsArray = res.data.data || [];

        const userTeams = teamsArray.filter((team) => {
          const isLeader = team.team_leader_name === user.name;
          const members = typeof team.team_members === 'string'
            ? team.team_members.split(',').map((m) => m.trim())
            : [];
          const isMember = members.includes(user.name);
          return isLeader || isMember;
        });

        setTeams(userTeams);
        if (userTeams.length > 0) {
          setSelectedTeamId(userTeams[0].team_id);
        }
      } catch (err) {
        toast.error('Failed to load teams');
      }
    };

    fetchTeams();
  }, [user?.name]);

  // 2. Fetch teamAssignmentId for user
  useEffect(() => {
    if (!user?.userID) return;

    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`${baseUrl}/team_assignments`, {
          params: { user_id: user.userID },
        });
        setTeamAssignmentId(res.data.id);
      } catch (err) {
        console.error('Team assignment error:', err);
      }
    };

    fetchAssignment();
  }, [user?.userID]);

  // 3. Join room and listen for messages
  useEffect(() => {
    if (!socket || !selectedTeamId || !teamAssignmentId) return;

    const teamId = Number(selectedTeamId);

    // Setup listeners BEFORE emitting
    socket.on('load_messages', (msgs) => {
      console.log('Loaded messages:', msgs);
      setMessages(msgs);
    });

    socket.on('load_messages_error', (errMsg) => {
      console.error('Load error:', errMsg);
    });

    socket.on('receive_message', (msg) => {
      console.log('New message received:', msg);
      if (Number(msg.team_id) === teamId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('join_error', (msg) => {
      console.error('Join error:', msg);
    });

    socket.emit('join_team', { user_id: teamAssignmentId, team_id: teamId });

    return () => {
      socket.off('load_messages');
      socket.off('load_messages_error');
      socket.off('receive_message');
      socket.off('join_error');
    };
  }, [socket, selectedTeamId, teamAssignmentId]);

  // 4. Send message
  const sendMessage = () => {
    if (!message.trim()) return;
    if (!teamAssignmentId || !selectedTeamId) {
      alert('Missing user or team info');
      return;
    }

    socket.emit('send_message', {
      sender_id: teamAssignmentId,
      message,
      team_id: selectedTeamId,
    });

    setMessage('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Team Chat</h2>

      <select
        value={selectedTeamId || ''}
        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
        className="border p-2 mb-4"
      >
        <option value="" disabled>Select a team</option>
        {teams.map((team) => (
          <option key={team.team_id} value={team.team_id}>
            {team.team_name}
          </option>
        ))}
      </select>

      <div className="border p-2 h-[300px] overflow-y-scroll bg-gray-100 mb-4">
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.sender_name || msg.sender_id}</strong>: {msg.message}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-1 mr-2"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          disabled={!message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
