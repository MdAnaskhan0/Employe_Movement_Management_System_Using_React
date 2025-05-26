import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  const timeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Done checking
  }, []);

  useEffect(() => {
    if (user) {
      startInactivityTimer();
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
    }

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      clearTimeout(timeoutRef.current);
    };
  }, [user]);

  const startInactivityTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      logout(true); // auto logout
    }, 3 * 60 * 1000); // 3 minutes
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://192.168.111.140:5137/login', { username, password });
      if (res.data.status === 'success') {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, role: res.data.user.role };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = (auto = false) => {
    setUser(null);
    localStorage.removeItem('user');
    clearTimeout(timeoutRef.current);
    if (auto) {
      alert('You have been logged out due to inactivity.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
