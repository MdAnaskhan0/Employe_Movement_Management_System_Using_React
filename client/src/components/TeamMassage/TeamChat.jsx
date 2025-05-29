import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io(import.meta.env.VITE_API_BASE_URL);

const TeamChat = ({ selectedTeam, user }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!selectedTeam) return;

    // Join Socket.IO room
    socket.emit('joinTeam', selectedTeam.team_id);

    // Fetch previous messages
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/messages/${selectedTeam.team_id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedTeam]);

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    const newMessage = {
      team_id: selectedTeam.team_id,
      sender_name: user.name,
      message: messageText
    };

    socket.emit('sendMessage', newMessage);
    setMessageText('');
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Team Chat</h4>
      <div style={{ border: '1px solid #ccc', padding: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: '5px 0' }}>
            <strong>{msg.sender_name}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default TeamChat;
