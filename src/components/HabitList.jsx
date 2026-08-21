/**
 * HabitList Component
 * Middle column of the 3-column layout displaying the list of habits.
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

const HabitItem = ({ habit, isSelected, onSelect, todayLog, onLogToggle, yesterdayLog, streak }) => {
  const isCompleted = todayLog?.status === 'completed';
  const isDisrupted = todayLog?.status === 'disrupted';

  return (
    <div
      onClick={() => {
        onSelect(habit);
        let nextStatus = 'completed';
        if (todayLog?.status === 'completed') nextStatus = 'disrupted';
        if (todayLog?.status === 'disrupted') nextStatus = 'skipped';
        onLogToggle(habit._id, nextStatus);
      }}
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors border border-border/10 rounded-xl mb-3 ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-[#18181b] hover:bg-[#202024] dark:bg-[#18181b] bg-white shadow-sm'}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLogToggle(habit._id, isCompleted ? 'skipped' : 'completed');
          }}
          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${isCompleted
              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
              : isDisrupted
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'border-muted-foreground/30 text-transparent hover:border-primary/50 hover:text-primary/20'
            }`}
        >
          {isDisrupted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          ) : (
            <CheckIcon />
          )}
        </button>
        <div>
          <p className={`text-[15px] font-bold ${isSelected ? 'text-primary' : 'text-foreground'} ${isCompleted ? 'line-through opacity-50' : ''}`}>{habit.name}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{habit.min_version_name}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/20 dark:bg-white/5 rounded-md text-muted-foreground">
          <FireIconSmall />
          <span className="text-xs font-bold">{streak}d</span>
        </div>
      </div>
    </div>
  );
};

const HabitList = ({ filter, habits, anchors, habitLogs, setHabitLogs, selectedHabit, setSelectedHabit, user }) => {
  const navigate = useNavigate();

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
  const [celebrationToast, setCelebrationToast] = useState(null);

  const handleLogToggle = async (habitId, status) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const habit = habits.find(h => h._id === habitId);

      if (status === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
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

  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const remainingHabits = habits.length - habitLogs.filter(l => l.date === todayStr && l.status === 'completed').length;

  return (
    <div className="flex-1 min-w-0 bg-background h-full flex flex-col z-10 shadow-sm relative px-4 lg:px-12 py-8 overflow-y-auto">

      {/* TOP HEADER */}
      <div className="mb-10 mt-6 lg:mt-0">
        <p className="text-xs font-bold text-[#e89454] tracking-widest uppercase mb-2">TODAY • {formattedDate.replace(/\//g, '/')}</p>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Good morning, {user?.name?.split(' ')[0] || 'Alex'}</h1>
        <p className="text-sm text-muted-foreground">{remainingHabits} habits remaining to lock in today's anchors.</p>
      </div>

      {/* HABIT LIST */}
      <div className="flex-1">
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
                <div className="flex items-center justify-between mb-3 border-b border-border/30 pb-2">
                  <div className="flex items-center gap-2 text-[#e89454]">
                    <AnchorIcon />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest">{anchor.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">{anchor.time_start} - {anchor.time_end}</span>
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
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {celebrationToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl font-black text-sm tracking-wide z-50 animate-in fade-in slide-in-from-bottom-4">
          ✨ {celebrationToast}
        </div>
      )}

    </div>
  );
};

export default HabitList;
