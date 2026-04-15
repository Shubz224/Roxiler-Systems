import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { injectAuthHelpers } from '../api/axios';

const AuthContext = createContext();

// Simple JWT decoder (no external lib needed)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setTokenObj] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = (newToken) => {
    setTokenObj(newToken);
    if (newToken) {
      setUser(decodeJWT(newToken));
    } else {
      setUser(null);
    }
  };

  // Wire Axios interceptors to our state using useRef to avoid stale closures
  const tokenRef = React.useRef(token);
  
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    injectAuthHelpers(
      () => tokenRef.current,
      (newToken) => setToken(newToken)
    );
  }, []);

  // Initial load: Attempt silent refresh to restore session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        setToken(res.data.data.accessToken);
      } catch (err) {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Listen for forced logouts from Axios interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      setToken(null);
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    setToken(res.data.data.accessToken);
    return res.data;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setToken(null);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
