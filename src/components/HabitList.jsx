/**
 * HabitList Component
 * Middle column of the 3-column layout displaying the list of habits.
 * Includes Disrupted Day Logic (Normal, Lazy, Skip modes).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const AnchorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e89454]"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
);

const FireIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

// We need a function to calculate the streak for the habit item to display "14d"
const getStreak = (habit, habitLogs) => {
  const logs = habitLogs.filter(l => l.habitId === habit._id);
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateStr);
    
    if (log && log.status === 'completed') {
      currentStreak++;
    } else if (log && log.status === 'disrupted') {
      continue;
    } else {
      if (i === 0 && !log) {
        continue;
      }
      break;
    }
  }
  return currentStreak;
};

/**
 * HabitItem Component
 * Renders an individual habit card with an interactive checkbox and hover state.
 */
const HabitItem = ({ habit, isSelected, onSelect, todayLog, onLogToggle, yesterdayLog, streak, dayMode }) => {
  const isCompleted = todayLog?.status === 'completed';
  const isDisrupted = todayLog?.status === 'disrupted';

  const mainText = dayMode === 'lazy' ? habit.min_version_name : habit.name;
  const subText = dayMode === 'lazy' ? `Instead of ${habit.normal_version || habit.name}` : habit.min_version_name;

  return (
    <div
      onClick={() => {
        onSelect(habit);
        let nextStatus = 'completed';
        if (todayLog?.status === 'completed') nextStatus = 'disrupted';
        if (todayLog?.status === 'disrupted') nextStatus = 'skipped';
        onLogToggle(habit._id, nextStatus);
      }}
      className={`group flex items-center justify-between p-4 cursor-pointer transition-all border rounded-xl mb-3 ${isSelected ? 'bg-primary/5 border-primary' : 'bg-surface border-border hover:border-primary/50 hover:bg-black/5 shadow-sm'}`}
    >
      <div className="flex items-center gap-4">
        {/* Left vertical indicator pill */}
        <div className={`w-1 h-6 rounded-full transition-colors ${isSelected || isCompleted ? 'bg-[#e89454]' : 'bg-border group-hover:bg-[#e89454]/50'}`} />
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            onLogToggle(habit._id, isCompleted ? 'skipped' : 'completed');
          }}
          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${isCompleted
              ? 'bg-[#e89454] border-[#e89454] text-white shadow-sm'
              : isDisrupted
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'border-border text-transparent hover:border-[#e89454]/50 hover:text-[#e89454]/20'
            }`}
        >
          {isDisrupted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          ) : (
            <CheckIcon />
          )}
        </button>
        <div>
          <p className={`text-[15px] font-bold transition-colors ${isSelected ? 'text-foreground' : 'text-foreground group-hover:text-primary'} ${isCompleted ? 'line-through opacity-50' : ''}`}>{mainText}</p>
          <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{subText}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-md text-[#e89454] transition-colors shadow-sm">
          <FireIconSmall />
          <span className="text-xs font-bold text-foreground">{streak}d</span>
        </div>
      </div>
    </div>
  );
};

const HabitList = ({ filter, habits, anchors, habitLogs, setHabitLogs, selectedHabit, setSelectedHabit, user }) => {
  const navigate = useNavigate();
  const [dayMode, setDayMode] = useState('normal'); // 'normal' | 'lazy' | 'skip'
  const [celebrationToast, setCelebrationToast] = useState(null);

  const filteredAnchors = anchors.filter(a => {
    if (filter === 'all') return true;
    return a.day_type === filter;
  });

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  const handleLogToggle = async (habitId, status) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const habit = habits.find(h => h._id === habitId);

      if (status === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e89454', '#fcd34d', '#3b82f6', '#ef4444']
        });

        const message = habit?.celebration || "Great job!";
        setCelebrationToast(message);
        setTimeout(() => setCelebrationToast(null), 3000);
      }

      setHabitLogs(prev => {
        const filtered = prev.filter(l => !(l.habitId === habitId && l.date === todayStr));
        if (status !== 'skipped') {
          filtered.push({ habitId, date: todayStr, status });
        }
        return filtered;
      });

      await fetch(`${import.meta.env.VITE_API_URL}/api/habits/${habitId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ date: todayStr, status })
      });
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  };

  const dateOpts = { month: '2-digit', day: '2-digit', year: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOpts).replace(/\//g, '/');
  const remainingHabits = habits.length - habitLogs.filter(l => l.date === todayStr && l.status === 'completed').length;

  return (
    <div className="flex-1 min-w-0 bg-background h-full flex flex-col z-10 shadow-sm relative px-4 lg:px-12 py-8 overflow-y-auto">

      {/* DYNAMIC HEADER BASED ON DAY MODE */}
      {dayMode === 'normal' && (
        <>
          <div className="mb-6 mt-6 lg:mt-0 animate-in fade-in slide-in-from-top-4">
            <p className="text-[11px] font-extrabold text-[#e89454] tracking-widest uppercase mb-2">TODAY • {formattedDate}</p>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Good morning, {user?.name?.split(' ')[0] || 'Alex'}</h1>
            <p className="text-[14px] text-muted-foreground font-medium">{remainingHabits} habits remaining to lock in today's anchors.</p>
          </div>
          
          <div className="mb-10 p-4 border border-border bg-surface rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e89454]/10 rounded-full text-[#e89454]"><WarningIcon /></div>
              <div>
                <h4 className="font-bold text-[14px] text-foreground">Routine broken today?</h4>
                <p className="text-[12px] font-medium text-muted-foreground mt-0.5">Today's different. Here are your minimum versions — do what you can.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={() => setDayMode('lazy')} className="flex-1 md:flex-none px-4 py-2 bg-[#e89454]/10 hover:bg-[#e89454]/20 text-[#e89454] rounded-lg text-[13px] font-bold transition-colors">Minimum Habits</button>
              <button onClick={() => setDayMode('skip')} className="flex-1 md:flex-none px-4 py-2 border border-border hover:bg-black/5 rounded-lg text-[13px] font-bold text-foreground transition-colors">Skip Today</button>
            </div>
          </div>
        </>
      )}

      {dayMode === 'lazy' && (
        <div className="mb-10 mt-6 lg:mt-0 animate-in fade-in slide-in-from-top-4">
          <div className="mb-6 p-3 border border-border bg-surface rounded-xl flex items-center gap-3 text-sm shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#e89454]"></div>
            <span className="font-bold text-foreground text-[13px]">Disrupted Day Mode Active</span>
            <span className="text-muted-foreground text-[13px] hidden md:inline">· Today's different. Here are your minimum versions — do what you can.</span>
            <button onClick={() => setDayMode('normal')} className="ml-auto text-[12px] font-extrabold text-[#e89454] hover:underline uppercase tracking-wider">Exit</button>
          </div>
          
          <p className="text-[11px] font-extrabold text-[#e89454] tracking-widest uppercase mb-2">TODAY • {formattedDate}</p>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Lazy Day Mode</h1>
          <p className="text-[14px] font-medium text-muted-foreground">Streaks are anchored to your day, scaled down to protect consistency.</p>
        </div>
      )}

      {dayMode === 'skip' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 rounded-full border border-border bg-surface flex items-center justify-center mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e89454" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-4">Taking a break today.</h1>
          <p className="text-[15px] font-medium text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
            Today is logged as Disrupted — not Missed. Your streaks are protected and will remain paused until tomorrow. Enjoy your day!
          </p>
          <div className="px-5 py-2.5 border border-border bg-surface rounded-xl text-[13px] font-bold text-foreground mb-8 shadow-sm flex items-center">
            <span className="text-[#e89454] mr-2 text-lg leading-none">●</span> {formattedDate} marked as Disrupted
          </div>
          <button onClick={() => setDayMode('normal')} className="px-8 py-3.5 bg-[#e89454] hover:bg-[#d68549] text-white rounded-xl font-bold shadow-sm transition-colors text-[14px]">
            Resume Tomorrow
          </button>
        </div>
      )}

      {/* HABIT LIST (Only show if not skipping) */}
      {dayMode !== 'skip' && (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <AnchorIcon /> Scaled Anchors
            </span>
            {dayMode === 'lazy' && (
               <span className="text-[10px] font-bold text-muted-foreground">Minimum Viable Daily Progress</span>
            )}
          </div>

          {filteredAnchors.length === 0 ? (
             <div className="p-10 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-xl">
               <p className="font-bold text-foreground mb-4">No habits scheduled</p>
               <button
                 onClick={() => navigate('/add-habit')}
                 className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm"
               >
                 Create Habit
               </button>
             </div>
          ) : (
            filteredAnchors.map(anchor => {
              const anchorHabits = habits.filter(h => {
                const id = h.anchorId?._id || h.anchorId;
                return id === anchor._id;
              });
              if (anchorHabits.length === 0) return null;
  
              return (
                <div key={anchor._id} className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[#e89454]">
                      <AnchorIcon />
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-foreground">{anchor.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground bg-surface px-2 py-1 rounded border border-border">{anchor.time_start} - {anchor.time_end}</span>
                  </div>
                  <div>
                    {anchorHabits.map(habit => {
                      const todayLog = habitLogs.find(l => l.habitId === habit._id && l.date === todayStr);
                      const yesterdayLog = habitLogs.find(l => l.habitId === habit._id && l.date === yesterdayStr);
                      const streak = getStreak(habit, habitLogs);
                      return (
                        <HabitItem
                          key={habit._id}
                          habit={habit}
                          isSelected={selectedHabit?._id === habit._id}
                          onSelect={setSelectedHabit}
                          todayLog={todayLog}
                          yesterdayLog={yesterdayLog}
                          onLogToggle={handleLogToggle}
                          streak={streak}
                          dayMode={dayMode}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {celebrationToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl font-black text-[13px] tracking-wide z-50 animate-in fade-in slide-in-from-bottom-4">
          ✨ {celebrationToast}
        </div>
      )}

    </div>
  );
};

export default HabitList;
