/**
 * Dashboard Page
 * -----------------------------------------------------------
 * Main view for authenticated users.
 * -----------------------------------------------------------
 */

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Small Icon helpers ─────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

// ─── AnchorBlock ───────────────────────────────────────────────────────────────
const AnchorBlock = ({ block, accent, habits = [] }) => (
  <div className="flex flex-col bg-surface rounded-xl border border-border hover:border-primary/30 transition-all duration-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 p-4">
      <div className={`h-10 w-1.5 rounded-full flex-shrink-0 ${accent}`} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{block.label}</p>
      </div>
      <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg flex-shrink-0">
        <ClockIcon />
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          {block.time_start} – {block.time_end}
        </span>
      </div>
    </div>
    
    {habits.length > 0 && (
      <div className="bg-background/50 border-t border-border px-4 py-3 flex flex-col gap-2">
        {habits.map(h => (
          <div key={h._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface border border-border/60 rounded-lg p-3 gap-3">
            
            {/* 1. Habit Name */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-5 w-5 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm font-semibold text-foreground">{h.name}</p>
            </div>

            {/* 2. Min Version Pill */}
            <div className="flex-1 flex sm:justify-end min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-background px-2.5 py-1.5 rounded-md border border-border/50 inline-flex items-start sm:items-center gap-1.5 max-w-full text-left leading-snug">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0 mt-0.5 sm:mt-0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                <span className="line-clamp-2">{h.min_version_name} <span className="whitespace-nowrap ml-1 shrink-0">({h.min_version_time}m)</span></span>
              </span>
            </div>
            
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── ScheduleColumn ────────────────────────────────────────────────────────────
const ScheduleColumn = ({ title, icon, blocks, accentBar, emptyMsg }) => (
  <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
    <div className={`h-1.5 w-full ${accentBar}`} />
    <div className="px-6 py-5 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {blocks.length > 0 && (
        <span className="text-xs font-bold bg-background text-muted-foreground px-2.5 py-1 rounded-full border border-border">
          {blocks.length}
        </span>
      )}
    </div>

    <div className="p-6 flex-1 flex flex-col space-y-3 bg-background/30">
      {blocks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <ClockIcon />
          <p className="mt-2 text-sm font-semibold">{emptyMsg}</p>
        </div>
      ) : (
        blocks.map(b => (
          <AnchorBlock key={b._id} block={b} accent={accentBar} habits={b.habits} />
        ))
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchors, setAnchors] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnchors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [anchorsRes, habitsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/anchors', { headers: { 'x-auth-token': token } }),
        axios.get('http://localhost:5000/api/habits', { headers: { 'x-auth-token': token } })
      ]);
      
      setAnchors(anchorsRes.data);
      setHabits(habitsRes.data);
      if (anchorsRes.data.length === 0) {
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('Failed to fetch anchors:', err);
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
        <p className="text-muted-foreground font-medium">Loading schedule...</p>
      </div>
    );
  }

  // Attach habits to their respective anchors
  const anchorsWithHabits = anchors.map(anchor => ({
    ...anchor,
    habits: habits.filter(h => h.anchorId && h.anchorId._id === anchor._id)
  }));

  const weekdayBlocks = anchorsWithHabits.filter(a => a.day_type === 'weekday');
  const dayOffBlocks  = anchorsWithHabits.filter(a => a.day_type === 'day_off');

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10 lg:py-16">
        
        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left/Center: Main Schedule Area */}
          <div className="flex-1 w-full flex flex-col min-w-0">
            
            {/* Welcome & Stats Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground text-base">
                  Here's your current schedule structure.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/add-habit')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Habit
                </button>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-surface border border-border hover:bg-surface-hover transition-colors shadow-sm text-foreground"
                >
                  <EditIcon />
                  Edit Schedule
                </button>
              </div>
            </div>

            {/* Schedule Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ScheduleColumn
                title="Weekday Routine"
                icon={<CalendarIcon />}
                blocks={weekdayBlocks}
                accentBar="bg-primary"
                emptyMsg="No weekday blocks set"
              />
              <ScheduleColumn
                title="Day Off Routine"
                icon={<SunIcon />}
                blocks={dayOffBlocks}
                accentBar="bg-secondary"
                emptyMsg="No day off blocks set"
              />
            </div>

            {/* Empty State Overlay */}
            {anchors.length === 0 && (
              <div className="mt-12 p-10 bg-surface rounded-2xl border-2 border-dashed border-border text-center">
                <p className="text-lg font-bold text-foreground mb-2">No schedule yet</p>
                <p className="text-muted-foreground mb-6">Build your routine to get started.</p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary-hover transition-colors"
                >
                  Build My Schedule
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Habit Strategies Section */}
          {habits.some(h => h.strategy) && (
            <aside className="w-full xl:w-80 2xl:w-[22rem] shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <div className="bg-surface/50 border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m13.4 2-8.8 8.8a2.1 2.1 0 0 0-.2 2.7l3.6 4.9"/><path d="M11.5 8.5 21 18l-3 3-9.5-9.5"/><path d="M15.5 12.5 12 9"/></svg>
                  Atomic Strategies
                </h2>
                <div className="flex flex-col gap-4">
                  {habits.filter(h => h.strategy).map(h => (
                    <div key={h._id} className="bg-background border border-border/80 hover:border-amber-500/30 transition-all rounded-xl p-4 shadow-sm group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3 className="font-bold text-foreground text-sm truncate">{h.name}</h3>
                      </div>
                      <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">
                        {h.strategy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
