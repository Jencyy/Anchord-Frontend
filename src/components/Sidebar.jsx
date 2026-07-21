/**
 * Sidebar Component
 * Left column of the 3-column dashboard layout.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
);

const Sidebar = ({ user, logout, filter, setFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHabits = location.pathname === '/' || location.pathname === '/add-habit';

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 border-r border-border bg-sidebar h-full flex-col pt-4 overflow-y-auto shrink-0 z-10">
      <div className="px-6 mb-8 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <img src="/Anchord-logo.png" alt="Anchord Logo" className="h-16 object-contain" />
      </div>

      <div className="px-4 mb-6">
        <div className="bg-surface shadow-sm border border-border/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'Settings & Profile'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-4 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Habits</p>
        
        <button
          onClick={() => { setFilter('all'); navigate('/'); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' && isHabits ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
        >
          <UserIcon />
          All Habits
        </button>
        
        <button
          onClick={() => { setFilter('weekday'); navigate('/'); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'weekday' && isHabits ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
        >
          <CalendarIcon />
          Weekday Routine
        </button>

        <button
          onClick={() => { setFilter('day_off'); navigate('/'); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'day_off' && isHabits ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
        >
          <SunIcon />
          Day Off Routine
        </button>
      </nav>

      <div className="p-3 mt-auto border-t border-border space-y-1">
        <p className="px-4 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 mt-2">Preferences</p>
        <button
          onClick={() => navigate('/schedule')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/schedule' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-black/5'}`}
        >
          <CalendarIcon />
          Edit Schedule
        </button>
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-black/5'}`}
        >
          <SettingsIcon />
          App Settings
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-2"
        >
          <LogOutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
