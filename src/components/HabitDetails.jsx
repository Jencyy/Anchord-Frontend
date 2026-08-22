/**
 * HabitDetails Component
 * Right column of the 3-column layout displaying details and stats.
 */
import React from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const AnchorIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e89454]"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
);

/**
 * CheckIcon Component
 * Renders an SVG checkmark icon for completed habit days in the calendar.
 */
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const HabitDetails = ({ habit, habitLogs = [], anchors = [], setSelectedHabit }) => {

  if (!habit) {
    return (
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-sidebar h-full flex items-center justify-center p-6 shrink-0 z-0 border-l border-border/50">
        <div className="text-center text-muted-foreground/50">
          <p className="text-sm font-bold">Select a habit to view details.</p>
        </div>
      </div>
    );
  }

  // --- Real Analytics Calculations ---
  const logs = habitLogs.filter(l => l.habitId === habit._id);

  // Compute Streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let isCurrentStreakActive = true;

  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const log = logs.find(l => l.date === dateStr);

    // Current Streak logic
    if (isCurrentStreakActive) {
      if (log && log.status === 'completed') {
        currentStreak++;
      } else if (log && log.status === 'disrupted') {
        // continues
      } else {
        if (i === 0 && !log) {
          // don't break if today is just unlogged
        } else {
          isCurrentStreakActive = false;
        }
      }
    }

    // Max Streak logic
    if (log && log.status === 'completed') {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else if (log && log.status === 'disrupted') {
      // continues
    } else {
      tempStreak = 0;
    }
  }

  // Generate Calendar Heatmap (Last 35 days)
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

  const anchorId = habit.anchorId?._id || habit.anchorId;
  const anchor = anchors.find(a => a._id === anchorId);
  const anchorLabel = anchor?.label || 'Wake Up';

  return (
    <aside className="w-full lg:w-[400px] xl:w-[450px] bg-background h-full flex flex-col overflow-y-auto shrink-0 z-0 border-l border-border/50 px-8 py-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-10 mt-6 lg:mt-0">
        <h2 className="text-3xl font-extrabold text-foreground">{habit.name}</h2>
        <button 
          onClick={() => setSelectedHabit && setSelectedHabit(null)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Behavioral Bridge */}
      <div className="mb-8">
        <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3">Behavioral Bridge</p>
        <div className="bg-[#18181b] dark:bg-[#18181b] bg-white border border-border/10 p-5 rounded-2xl shadow-sm">
          <p className="text-foreground text-[15px] font-medium leading-relaxed">
            After I complete <span className="font-bold text-[#e89454]">{anchorLabel}</span>, I will <span className="font-bold">{habit.name}</span>.
          </p>
        </div>
      </div>

      {/* Motif */}
      <div className="mb-8">
        <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3">Motif</p>
        <div className="bg-[#18181b] dark:bg-[#18181b] bg-white border border-border/10 p-5 rounded-2xl shadow-sm">
          <p className="text-foreground text-[15px] font-medium flex items-center gap-2">
            {habit.strategy || "🧘‍♂️ Mindfulness"}
          </p>
        </div>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#18181b] dark:bg-[#18181b] bg-white border border-border/10 p-5 rounded-2xl shadow-sm text-center">
          <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Current Streak</p>
          <p className="text-3xl font-black text-foreground">{currentStreak} <span className="text-lg font-bold text-muted-foreground">Days</span></p>
        </div>
        <div className="bg-[#18181b] dark:bg-[#18181b] bg-white border border-border/10 p-5 rounded-2xl shadow-sm text-center">
          <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Longest Streak</p>
          <p className="text-3xl font-black text-foreground">{maxStreak} <span className="text-lg font-bold text-muted-foreground">Days</span></p>
        </div>
      </div>

      {/* Calendar Flow */}
      <div>
        <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3">Current Month Flow</p>
        <div className="bg-[#18181b] dark:bg-[#18181b] bg-white border border-border/10 p-5 rounded-2xl shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((day, i) => {
              let bg = 'bg-black/5 dark:bg-white/5';
              let text = 'text-muted-foreground';

              if (day.status === 'completed') {
                bg = 'bg-[#e89454]';
                text = 'text-white';
              } else if (day.status === 'failed') {
                bg = 'bg-red-500/10 border border-red-500/20';
                text = 'text-red-500 font-bold';
              } else if (day.status === 'disrupted') {
                bg = 'bg-amber-500/10 border border-amber-500/20';
                text = 'text-amber-500 font-bold';
              }

              return (
                <div key={i} title={`${day.dateStr}: ${day.status}`} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${bg} ${text} cursor-default`}>
                  {day.status === 'completed' ? <CheckIcon /> : day.dayOfMonth}
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
