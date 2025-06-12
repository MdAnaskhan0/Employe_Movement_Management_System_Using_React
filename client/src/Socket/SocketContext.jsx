import React, { createContext, useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    socketRef.current = io(baseURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [baseURL]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};