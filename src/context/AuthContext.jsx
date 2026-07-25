/**
 * AuthContext
 * -----------------------------------------------------------
 * Provides global authentication state (user data, loading status) 
 * and methods (login, register, logout) to the entire React application.
 * -----------------------------------------------------------
 */
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists on load (e.g. when user refreshes the page)
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // If token and user exist in local storage, restore the session
      setUser(JSON.parse(storedUser));
      // Set the default axios header so subsequent requests are authenticated
      axios.defaults.headers.common['x-auth-token'] = token;
    }
    // Done checking
    setLoading(false);
  }, []);

  /**
   * registerUser
   * Sends user data to backend to create an account, then logs them in.
   */
  const registerUser = async (userData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.response?.data?.msg || 'Registration failed' };
    }
  };

  /**
   * loginUser
   * Authenticates user credentials with backend and sets up the session.
   */
  const loginUser = async (credentials) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.response?.data?.msg || 'Login failed' };
    }
  };

  /**
   * logout
   * Clears the user session from local storage, removes the axios auth header,
   * resets state, and redirects to the login page.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    navigate('/login');
  };

  /**
   * updateUserSession
   * Updates the user object in state and local storage after a profile update.
   */
  const updateUserSession = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, registerUser, loginUser, logout, updateUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
