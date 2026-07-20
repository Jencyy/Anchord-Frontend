/**
 * HabitDetails Component
 * Right column of the 3-column layout displaying details and stats.
 */
import React from 'react';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const HabitDetails = ({ habit, habitLogs = [] }) => {

  if (!habit) {
    return (
      <div className="w-full lg:w-[400px] xl:w-[500px] bg-sidebar h-full flex items-center justify-center p-6 shrink-0 z-0 border-l border-border/50">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground/30 mb-4 shadow-sm">
            <CalendarIcon />
          </div>
          <p className="text-lg font-bold text-foreground">Select a habit</p>
          <p className="text-sm text-muted-foreground mt-1">Click on a habit in the list to view its statistics.</p>
        </div>
      </div>
    );
  }

  // --- Real Analytics Calculations ---
  // 1. Filter logs for this specific habit
  const logs = habitLogs.filter(l => l.habitId === habit._id);

  // 2. Compute Totals
  const completeCount = logs.filter(l => l.status === 'completed').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;
  const skippedCount = logs.filter(l => l.status === 'skipped').length;
  const totalCount = logs.length;

  // 3. Compute Current Streak
  // We look backwards from today. We stop when we find a 'failed' or a day with NO log (meaning missed).
  // We IGNORE 'disrupted' days (they don't break the streak, but don't add to it).
  // We IGNORE 'skipped' days (if they are allowed skips, but usually skipping breaks a streak unless disrupted).
  // Actually, for simplicity, 'completed' adds 1. 'disrupted' adds 0 but keeps it going.
  // Anything else breaks it.
  
  let currentStreak = 0;
  let streakStartDate = null;
  
  // Create an array of the last 365 days to walk backwards
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const log = logs.find(l => l.date === dateStr);
    
    if (log && log.status === 'completed') {
      currentStreak++;
      streakStartDate = dateStr;
    } else if (log && log.status === 'disrupted') {
      // Free pass! Doesn't break streak, just skips the day
      continue;
    } else {
      // If there's no log (missed) or it's failed/skipped, the streak breaks.
      // Exception: If i === 0 (today) and there's no log yet, we don't break the streak because the day isn't over!
      if (i === 0 && !log) {
        continue;
      }
      break;
    }
  }

  // 4. Generate Calendar Heatmap (Last 35 days)
  const calendarDays = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const log = logs.find(l => l.date === dateStr);
    calendarDays.push({
      dateStr,
      dayOfMonth: d.getDate(),
      status: log ? log.status : 'none'
    });
  }

  return (
    <aside className="w-full lg:w-[400px] xl:w-[500px] bg-sidebar h-full flex flex-col overflow-y-auto shrink-0 z-0 border-l border-border/50">
      
      {/* Top Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
        <h2 className="text-lg font-extrabold text-foreground truncate max-w-[200px] xl:max-w-[300px]">{habit.name}</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-black/5 transition-colors shadow-sm">
            <CalendarIcon /> {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </button>
          <button className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shadow-sm">
            <EditIcon />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Strategy Alert (if exists) */}
        {habit.strategy && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FireIcon />
              <span className="text-sm font-bold text-orange-900">Atomic Strategy</span>
            </div>
            <p className="text-xs font-medium text-orange-800 leading-relaxed">{habit.strategy}</p>
          </div>
        )}

        {/* Current Streak */}
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FireIcon />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-0.5">Current Streak</p>
              <p className="text-2xl font-black text-foreground">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            {streakStartDate ? (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From {new Date(streakStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            ) : (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Today!</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckIcon /> Complete
            </p>
            <p className="text-xl font-black text-foreground">{completeCount} day{completeCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2">✕ Failed</p>
            <p className="text-xl font-black text-foreground">{failedCount} day{failedCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2">→ Skipped</p>
            <p className="text-xl font-black text-foreground">{skippedCount} day{skippedCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2">Total Logs</p>
            <p className="text-xl font-black text-foreground">{totalCount}</p>
          </div>
        </div>

        {/* Calendar Heatmap (Dynamic) */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Last 35 Days</span>
             <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               Disrupted days ignore streak
             </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Generate calendar squares */}
            {calendarDays.map((day, i) => {
              
              let bg = 'bg-sidebar';
              let content = day.dayOfMonth;
              let text = 'text-muted-foreground';
              
              if (day.status === 'completed') {
                bg = 'bg-primary';
                text = 'text-primary-foreground';
              } else if (day.status === 'failed') {
                content = '✕';
                text = 'text-foreground font-bold';
              } else if (day.status === 'skipped') {
                content = '→';
                text = 'text-muted-foreground font-bold';
              } else if (day.status === 'disrupted') {
                bg = 'bg-amber-500';
                content = '!';
                text = 'text-white font-black';
              }

              return (
                <div key={i} title={`${day.dateStr}: ${day.status}`} className={`aspect-square rounded-md flex items-center justify-center text-xs ${bg} ${text} transition-colors hover:opacity-80 cursor-default`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </aside>
  );
};

export default HabitDetails;
