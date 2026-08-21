/**
 * Dashboard Component
 * The main view users see after logging in.
 * Displays a 3-column layout: Sidebar, Habit List, and Habit Details.
 */
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchors, setAnchors] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedHabit, setSelectedHabit] = useState(null);

  const fetchAnchors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const [anchorsRes, habitsRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/anchors`, { headers: { 'x-auth-token': token } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/habits`, { headers: { 'x-auth-token': token } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/habits/logs`, { headers: { 'x-auth-token': token } })
      ]);

      setAnchors(anchorsRes.data);
      setHabits(habitsRes.data);
      setHabitLogs(logsRes.data);
      if (anchorsRes.data.length === 0) {
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnchors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background font-sans flex overflow-hidden">
      <Sidebar
        user={user}
        logout={logout}
        filter={filter}
        setFilter={setFilter}
      />
      <Outlet context={{
        user,
        filter,
        habits,
        anchors,
        habitLogs,
        setHabitLogs,
        selectedHabit,
        setSelectedHabit,
        fetchAnchors
      }} />
    </div>
  );
};

export default Dashboard;
