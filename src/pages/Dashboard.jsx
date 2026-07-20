/**
 * Dashboard Component
 * The main view users see after logging in.
 * Displays a 3-column layout: Sidebar, Habit List, and Habit Details.
 */
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import Sidebar from '../components/Sidebar';
import HabitList from '../components/HabitList';
import HabitDetails from '../components/HabitDetails';
import ScheduleBuilder from '../components/ScheduleBuilder';
import SettingsView from '../components/SettingsView';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchors, setAnchors] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the 3-column UI vs Full-Page Tools
  const [currentView, setCurrentView] = useState('habits'); // 'habits' | 'edit_schedule' | 'settings'
  const [filter, setFilter] = useState('all'); // 'all', 'weekday', 'day_off'
  const [selectedHabit, setSelectedHabit] = useState(null);

  /**
   * fetchAnchors
   * Retrieves the user's anchors, habits, and logs from the backend.
   */
  const fetchAnchors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [anchorsRes, habitsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/anchors', { headers: { 'x-auth-token': token } }),
        axios.get('http://localhost:5000/api/habits', { headers: { 'x-auth-token': token } }),
        axios.get('http://localhost:5000/api/habits/logs', { headers: { 'x-auth-token': token } })
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
      
      {/* 1. Left Sidebar */}
      <Sidebar 
        user={user} 
        logout={logout} 
        filter={filter} 
        setFilter={setFilter} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area */}
      {currentView === 'habits' ? (
        <>
          {/* 2. Middle Column: Habit List */}
          <HabitList 
            filter={filter} 
            habits={habits} 
            anchors={anchors} 
            habitLogs={habitLogs}
            setHabitLogs={setHabitLogs}
            selectedHabit={selectedHabit}
            setSelectedHabit={setSelectedHabit}
          />

          {/* 3. Right Column: Habit Details */}
          <HabitDetails 
            habit={selectedHabit} 
            habitLogs={habitLogs}
          />
        </>
      ) : currentView === 'settings' ? (
        <SettingsView onClose={() => setCurrentView('habits')} />
      ) : (
        <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
           {/* Header for Edit Schedule */}
           <div className="w-full px-8 py-5 flex items-center justify-between border-b border-border bg-surface shrink-0">
             <h1 className="text-2xl font-extrabold text-foreground">Edit Schedule</h1>
             <button 
               onClick={() => setCurrentView('habits')}
               className="text-sm font-bold bg-background border border-border px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shadow-sm"
             >
               Close
             </button>
           </div>
           
           <div className="flex-1 overflow-hidden flex flex-col w-full">
             <ScheduleBuilder 
               existingAnchors={anchors}
               userLifeStage={user?.lifeStage}
               isEmbedded={true}
               onComplete={() => {
                 fetchAnchors();
                 setCurrentView('habits');
               }}
             />
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
