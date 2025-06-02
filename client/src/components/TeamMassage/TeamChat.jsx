import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUser, FaSmile } from 'react-icons/fa';
import { format } from 'date-fns';
import { TailSpin } from 'react-loader-spinner';
import EmojiPicker from 'emoji-picker-react';

const socket = io(import.meta.env.VITE_API_BASE_URL);

const TeamChat = ({ selectedTeam, user, updateUnreadCount }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedTeam) return;

    socket.emit('joinTeam', selectedTeam.team_id);

    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/messages/${selectedTeam.team_id}`)
      .then(res => {
        setMessages(res.data);
        if (res.data.length > 0) {
          setLastSeenMessageId(res.data[res.data.length - 1].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load messages');
        setLoading(false);
      });

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      
      if (message.team_id === selectedTeam.team_id) {
        setLastSeenMessageId(message.id);
      } else {
        const newMessages = messages.filter(m => m.id > lastSeenMessageId);
        updateUnreadCount(message.team_id, newMessages.length);
      }
    };

    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [selectedTeam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (messageText.trim() === '') {
      toast.warning('Message cannot be empty');
      return;
    }

    const newMessage = {
      team_id: selectedTeam.team_id,
      sender_name: user.name,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    socket.emit('sendMessage', newMessage);
    setMessageText('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm">
      <div className="bg-blue-600 text-white px-4 py-3">
        <h4 className="font-semibold text-lg">Team Chat</h4>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <TailSpin color="#3B82F6" height={40} width={40} />
        </div>
      ) : (
        <div 
          className="h-64 md:h-[60vh] overflow-y-auto p-4 bg-gray-50"
          id="chat-messages"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.sender_name === user.name ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.sender_name === user.name 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'}`}
                >
                  <div className="flex items-center mb-1">
                    <FaUser className="text-xs mr-2" />
                    <span className="font-semibold text-xs">{msg.sender_name}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-right mt-1">
                    <span className="text-xs opacity-70">
                      {msg.timestamp ? format(new Date(msg.timestamp), 'hh:mm a') : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className=" border-gray-200 p-3 bg-white relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 z-10">
            <EmojiPicker 
              onEmojiClick={onEmojiClick}
              width={300}
              height={350}
            />
          </div>
        )}
        <div className="flex items-center">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg mr-1"
          >
            <FaSmile className="text-xl" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-r-lg transition duration-200"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;