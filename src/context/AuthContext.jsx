import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['x-auth-token'] = token;
    }
    setLoading(false);
  }, []);

  const registerUser = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
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

  const loginUser = async (credentials) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, registerUser, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
