/**
 * HabitList Component
 * Middle column of the 3-column layout displaying the list of habits.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const HabitItem = ({ habit, isSelected, onSelect, todayLog, onLogToggle }) => {
  const isCompleted = todayLog?.status === 'completed';
  const isDisrupted = todayLog?.status === 'disrupted';

  return (
    <div 
      onClick={() => onSelect(habit)}
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-border/50 last:border-b-0
        ${isSelected ? 'bg-primary/5' : 'bg-surface hover:bg-black/5'}
      `}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLogToggle(habit._id, isCompleted ? 'skipped' : 'completed');
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
            isCompleted 
              ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
              : isDisrupted 
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'border-muted-foreground/30 text-transparent hover:border-primary/50 hover:text-primary/20'
          }`}
        >
          {isDisrupted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ) : (
            <CheckIcon />
          )}
        </button>
        <div>
          <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'} ${isCompleted ? 'line-through opacity-70' : ''}`}>{habit.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{habit.min_version_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            // Cycle through statuses for testing: completed -> disrupted -> skipped
            let nextStatus = 'completed';
            if (todayLog?.status === 'completed') nextStatus = 'disrupted';
            if (todayLog?.status === 'disrupted') nextStatus = 'skipped';
            onLogToggle(habit._id, nextStatus);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-black/5 text-xs font-semibold text-foreground transition-colors shadow-sm"
        >
          {todayLog?.status ? (
            <span className="capitalize">{todayLog.status}</span>
          ) : (
            <>Log</>
          )}
        </button>
      </div>
    </div>
  );
};

const HabitList = ({ filter, habits, anchors, habitLogs, setHabitLogs, selectedHabit, setSelectedHabit }) => {
  const navigate = useNavigate();

  // Determine title based on filter
  let title = "All Habits";
  if (filter === 'weekday') title = "Weekday Routine";
  if (filter === 'day_off') title = "Day Off Routine";

  // Filter anchors/habits based on selection
  const filteredAnchors = anchors.filter(a => {
    if (filter === 'all') return true;
    return a.day_type === filter;
  });

  // Get today's date string in YYYY-MM-DD local time
  const getTodayString = () => {
    const today = new Date();
    // Use local date parts to avoid UTC shift
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  const handleLogToggle = async (habitId, status) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistically update UI
      setHabitLogs(prev => {
        const filtered = prev.filter(l => !(l.habitId === habitId && l.date === todayStr));
        if (status !== 'skipped') {
          filtered.push({ habitId, date: todayStr, status });
        }
        return filtered;
      });

      // API Call
      // We will send 'skipped' to backend if we want to explicitly record a skip, 
      // but for toggle logic, let's say 'skipped' means we don't care, just record it.
      // Wait, if it's 'skipped', we still want to save it as skipped or deleted.
      // The backend upserts it.
      await fetch(`http://localhost:5000/api/habits/${habitId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ date: todayStr, status })
      });
    } catch (error) {
      console.error('Failed to log habit:', error);
      // Revert optimistic update? For now just log error.
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-surface border-r border-border h-full flex flex-col z-10 shadow-sm relative">
      
      {/* Top Header Section */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">{title}</h1>
        
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border rounded-lg bg-surface text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
            <SearchIcon />
          </button>
          <button className="p-2 border border-border rounded-lg bg-surface text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
            <FilterIcon />
          </button>
          <button 
            onClick={() => navigate('/add-habit')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon /> Add
          </button>
        </div>
      </div>

      {/* Habit List */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        
        {filter === 'all' ? (
          // ── FLAT LIST FOR "ALL HABITS" ──
          <div className="bg-surface">
            {habits.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-sm">
                  <CheckIcon />
                </div>
                <p className="font-bold text-foreground text-sm mb-1">No habits yet</p>
                <p className="text-xs text-muted-foreground max-w-[200px] mb-4">Start by adding your first habit to your routine.</p>
                <button 
                  onClick={() => navigate('/add-habit')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
                >
                  Create Habit
                </button>
              </div>
            ) : (
              habits.map(habit => {
                const todayLog = habitLogs.find(l => l.habitId === habit._id && l.date === todayStr);
                return (
                  <HabitItem 
                    key={habit._id} 
                    habit={habit} 
                    isSelected={selectedHabit?._id === habit._id}
                    onSelect={setSelectedHabit}
                    todayLog={todayLog}
                    onLogToggle={handleLogToggle}
                  />
                );
              })
            )}
          </div>
        ) : (
          // ── GROUPED LIST FOR ROUTINES ──
          filteredAnchors.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm font-medium">
              No routines found for this filter.
            </div>
          ) : (
            filteredAnchors.map(anchor => {
              const anchorHabits = habits.filter(h => {
                 const id = h.anchorId?._id || h.anchorId;
                 return id === anchor._id;
              });

              return (
                <div key={anchor._id} className="mb-4">
                  <div className="px-4 py-2 bg-sidebar border-y border-border/50 sticky top-0 flex items-center justify-between shadow-sm z-10">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">{anchor.label}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{anchor.time_start} - {anchor.time_end}</span>
                  </div>
                  <div className="bg-surface">
                    {anchorHabits.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground italic bg-surface/50">
                        No habits in this block yet.
                      </div>
                    ) : (
                      anchorHabits.map(habit => {
                        const todayLog = habitLogs.find(l => l.habitId === habit._id && l.date === todayStr);
                        return (
                          <HabitItem 
                            key={habit._id} 
                            habit={habit} 
                            isSelected={selectedHabit?._id === habit._id}
                            onSelect={setSelectedHabit}
                            todayLog={todayLog}
                            onLogToggle={handleLogToggle}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

    </div>
  );
};

export default HabitList;
