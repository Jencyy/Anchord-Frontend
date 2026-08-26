/**
 * Sidebar Component
 * Left column of the 3-column dashboard layout.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const Sidebar = ({ user, logout, filter, setFilter, habits = [], anchors = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = (toDark) => {
    if (toDark && !isDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (!toDark && isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  };

  const isHabits = location.pathname === '/';

  // Calculate dynamic habit counts for each routine type
  const getRoutineCount = (dayType) => {
    const routineAnchors = anchors.filter(a => a.day_type === dayType);
    return habits.filter(h => {
      const anchorId = h.anchorId?._id || h.anchorId;
      return routineAnchors.some(a => a._id === anchorId);
    }).length;
  };

  const workDayCount = getRoutineCount('weekday');
  const dayOffCount = getRoutineCount('day_off');
  const customCount = getRoutineCount('custom');

  return (
    <>
      <aside className="hidden lg:flex w-64 xl:w-[280px] border-r border-border bg-sidebar h-full flex-col py-6 overflow-y-auto shrink-0 z-10">
        {/* LOGO */}
        <div className="px-8 mb-10 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">Anchord</span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => { setFilter('all'); navigate('/'); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${filter === 'all' && isHabits ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <CalendarIcon />
            Today
          </button>
          <button
            onClick={() => navigate('/schedule')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/schedule' ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <ClockIcon />
            Schedule
          </button>
          <button
            onClick={() => navigate('/add-habit')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/add-habit' ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <PlusCircleIcon />
            Add Habit
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/analytics' ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <BarChartIcon />
            Analytics
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/settings' ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <SettingsIcon />
            Settings
          </button>

          {/* ROUTINE PROFILES */}
          <div className="pt-6">
            <p className="px-4 text-[11px] font-extrabold text-muted-foreground/60 uppercase tracking-widest mb-3">ROUTINE PROFILES</p>
            <button
              onClick={() => { setFilter('weekday'); navigate('/'); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${filter === 'weekday' && isHabits ? 'bg-black/5 dark:bg-white/5 text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${filter === 'weekday' && isHabits ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                 Work Day Routine
              </div>
              <span className="bg-black/5 dark:bg-white/10 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-md">{workDayCount}</span>
            </button>
            <button
              onClick={() => { setFilter('day_off'); navigate('/'); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${filter === 'day_off' && isHabits ? 'bg-black/5 dark:bg-white/5 text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${filter === 'day_off' && isHabits ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                 Day Off Routine
              </div>
              <span className="bg-black/5 dark:bg-white/10 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-md">{dayOffCount}</span>
            </button>
            <button
              onClick={() => { setFilter('custom'); navigate('/'); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${filter === 'custom' && isHabits ? 'bg-black/5 dark:bg-white/5 text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${filter === 'custom' && isHabits ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                 Custom Routine
              </div>
              <span className="bg-black/5 dark:bg-white/10 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-md">{customCount}</span>
            </button>
          </div>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="px-6 mt-auto">
          {/* THEME TOGGLE */}
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1 mb-6 flex items-center">
             <button 
                onClick={() => toggleTheme(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${!isDark ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
                <div className={!isDark ? "text-primary" : ""}><SunIcon /></div>
                Warm
             </button>
             <button 
                onClick={() => toggleTheme(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
                <MoonIcon />
                Pure
             </button>
          </div>

          {/* USER PROFILE */}
          <div className="flex items-center gap-3 group relative cursor-pointer" onClick={logout}>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
               {user?.name ? (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
               ) : (
                  <UserIcon />
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Alex Wong'}</p>
              <p className="text-xs font-medium text-muted-foreground truncate">Pro Operator</p>
            </div>
            
            {/* Hover overlay to show logout */}
            <div className="absolute inset-0 bg-surface/90 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
               <LogOutIcon />
               <span className="text-sm font-bold text-destructive">Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 px-2 py-2 flex justify-around items-center pb-safe">
        <button onClick={() => { setFilter('all'); navigate('/'); }} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${filter === 'all' && isHabits ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <CalendarIcon />
          <span className="text-[10px] font-bold tracking-wide">Today</span>
        </button>
        <button onClick={() => { setFilter('weekday'); navigate('/'); }} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${filter === 'weekday' && isHabits ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <ClockIcon />
          <span className="text-[10px] font-bold tracking-wide">Schedule</span>
        </button>
        <button onClick={() => navigate('/settings')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <SettingsIcon />
          <span className="text-[10px] font-bold tracking-wide">Settings</span>
        </button>
        <button onClick={() => toggleTheme(!isDark)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors min-w-[64px]">
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span className="text-[10px] font-bold tracking-wide">Theme</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
