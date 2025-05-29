import { useEffect, useState } from 'react';
import { useSocket } from '../../Socket/SocketContext';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';

export default function TeamMassage() {
  const socket = useSocket();
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [teamAssignmentId, setTeamAssignmentId] = useState(null); // <-- store team_assignment.id here

  useEffect(() => {
    // 1. Fetch user's teamAssignmentId from backend
    const fetchTeamAssignmentId = async () => {
      if (!user?.userID) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/team_assignments`, {
          params: { user_id: user.userID },
        });

        setTeamAssignmentId(res.data.id);
        console.log('Team Assignment ID:', res.data.id);
      } catch (error) {
        console.error('Error fetching team assignment id:', error);
      }
    };

    fetchTeamAssignmentId();
  }, [user?.userID]);

  useEffect(() => {
    // 2. Fetch team info (to get teamId) using user's name like before
    const fetchTeamID = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/teams`);
        const teams = res.data.data || [];

        const userTeam = teams.find(team => {
          const members = team.team_members.split(',').map(m => m.trim().toLowerCase());
          return members.includes(user.name.toLowerCase());
        });

        if (userTeam) {
          setTeamId(userTeam.team_id);
          console.log('User team found:', userTeam.team_name, userTeam.team_id);
        } else {
          console.warn('User team not found');
        }
      } catch (error) {
        console.error('Error fetching team ID:', error);
      }
    };

    if (user?.name) fetchTeamID();
  }, [user?.name]);

  useEffect(() => {
    if (!socket) return;

    console.log('Socket connected:', socket.id);

    socket.on('receive_message', (msg) => {
      if (msg.team_id === teamId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, teamId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!teamAssignmentId || !teamId) {
      alert('User info not available. Cannot send message.');
      return;
    }

    const msgPayload = {
      sender_id: teamAssignmentId, // important: use team_assignments.id here
      receiver_id: 0,
      message,
      team_id: teamId,
    };

    console.log('Sending message:', msgPayload);

    socket.emit('send_message', msgPayload);
    setMessage('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Team Chat</h2>
      <div className="border p-2 h-[300px] overflow-y-scroll bg-gray-100 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg.sender_id}</strong>: {msg.message}
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
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
