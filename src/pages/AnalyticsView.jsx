/**
 * AnalyticsView Component
 * Displays Performance Overview matching Frame 33.
 */
import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

// Utility to format dates to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const CATEGORY_TO_IDENTITY = {
  'Health': { name: 'Exerciser', icon: '🏃' },
  'Productivity': { name: 'Doer', icon: '⚡' },
  'Mindfulness': { name: 'Meditator', icon: '🧘' },
  'Learning': { name: 'Reader', icon: '📖' },
  'Finance': { name: 'Investor', icon: '💰' },
  'Relationships': { name: 'Connector', icon: '🤝' },
  'Hobbies': { name: 'Creator', icon: '🎨' },
  'Default': { name: 'Achiever', icon: '⭐' }
};

const CircularProgress = ({ percentage, colorClass }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="6"
          className="text-border/30"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{percentage}%</span>
    </div>
  );
};

const AnalyticsView = () => {
  const { habits = [], habitLogs = [] } = useOutletContext();

  // 1. Calculate Identity Tracks (Categories)
  const identityStats = useMemo(() => {
    const stats = {};
    const today = new Date();
    
    // Group habits by category
    habits.forEach(habit => {
      const cat = habit.category || 'Default';
      if (!stats[cat]) stats[cat] = { habits: [], expectedDays: 0, completedDays: 0 };
      stats[cat].habits.push(habit);
    });

    // Calculate rates
    Object.keys(stats).forEach(cat => {
      const catHabits = stats[cat].habits;
      // Find oldest habit in category to determine max possible days
      let oldestDate = today;
      catHabits.forEach(h => {
        const hDate = new Date(h.createdAt);
        if (hDate < oldestDate) oldestDate = hDate;
      });

      // Cap at 30 days for display purposes
      const msPerDay = 1000 * 60 * 60 * 24;
      let diffDays = Math.floor((today - oldestDate) / msPerDay) + 1;
      if (diffDays > 30) diffDays = 30;
      if (diffDays < 1) diffDays = 1;

      // Count unique completed days for these habits
      const catHabitIds = catHabits.map(h => h._id.toString());
      const completedLogs = habitLogs.filter(log => 
        catHabitIds.includes(log.habitId.toString()) && 
        log.status === 'completed'
      );
      
      const uniqueCompletedDays = new Set(completedLogs.map(l => l.date)).size;

      stats[cat].expectedDays = diffDays;
      stats[cat].completedDays = uniqueCompletedDays > diffDays ? diffDays : uniqueCompletedDays;
      stats[cat].percentage = Math.round((stats[cat].completedDays / stats[cat].expectedDays) * 100) || 0;
    });

    return Object.entries(stats)
      .map(([cat, data]) => ({
        category: cat,
        identity: CATEGORY_TO_IDENTITY[cat] || CATEGORY_TO_IDENTITY['Default'],
        ...data
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3); // Top 3
  }, [habits, habitLogs]);

  // 2. Calculate Monthly Consistency Flow
  const monthlyFlow = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    const flow = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), i);
      const dateStr = formatDate(d);
      const logsForDay = habitLogs.filter(l => l.date === dateStr);
      
      let status = 'future';
      if (d <= today) {
        if (logsForDay.length === 0) {
          status = 'missed';
        } else {
          const hasFailed = logsForDay.some(l => l.status === 'failed');
          const hasSkip = logsForDay.some(l => l.status === 'skip');
          const allCompleted = logsForDay.every(l => l.status === 'completed');

          if (hasFailed) status = 'missed';
          else if (hasSkip && !hasFailed) status = 'disrupted';
          else if (allCompleted) status = 'completed';
          else status = 'missed'; // Default catch
        }
      }
      
      flow.push({ day: i, status });
    }
    return flow;
  }, [habitLogs]);

  // 3. Calculate Streaks
  const streakData = useMemo(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const allDatesStr = [...new Set(habitLogs.map(l => l.date))].sort();

    // Map all unique days to a "success" boolean
    // A day is successful if it has NO 'failed' logs and AT LEAST ONE 'completed' or 'skip' log
    const dateSuccessMap = {};
    allDatesStr.forEach(date => {
      const logs = habitLogs.filter(l => l.date === date);
      const hasFailed = logs.some(l => l.status === 'failed');
      dateSuccessMap[date] = !hasFailed && logs.length > 0;
    });

    // Calculate best streak
    allDatesStr.forEach(date => {
      if (dateSuccessMap[date]) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak backwards from today or yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const checkCurrentStreak = (startDate) => {
      let streak = 0;
      let d = new Date(startDate);
      while (true) {
        const dStr = formatDate(d);
        if (dateSuccessMap[dStr]) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    };

    const todayStreak = checkCurrentStreak(today);
    const yesterdayStreak = checkCurrentStreak(yesterday);
    
    currentStreak = todayStreak > 0 ? todayStreak : yesterdayStreak;

    return { current: currentStreak, best: bestStreak };
  }, [habitLogs]);

  // 4. Calculate Velocity Sparkline (last 10 days)
  const sparklineData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      
      const completedCount = habitLogs.filter(l => l.date === dStr && l.status === 'completed').length;
      data.push(completedCount);
    }
    
    const maxCount = Math.max(...data, 1); // Avoid div by zero
    return data.map(count => (count / maxCount) * 100);
  }, [habitLogs]);

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="px-8 lg:px-16 py-12 max-w-[1100px] w-full mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <p className="text-[11px] font-extrabold text-primary tracking-widest uppercase mb-2">PERFORMANCE OVERVIEW</p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Your Habits Identity</h1>
          <p className="text-[14px] text-muted-foreground font-medium">Track your identity streaks. Disrupted days are excluded from consistency rates.</p>
        </div>

        {/* Identity Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {identityStats.map((stat, idx) => {
            const colors = [
              'text-primary', // Orange
              'text-[#14B8A6]', // Cyan
              'text-primary'  // Orange
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div key={stat.category} className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-border/80 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-muted-foreground mb-1">Identity Track</span>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{stat.identity.icon}</span>
                    <h3 className="text-xl font-extrabold text-foreground">{stat.identity.name}</h3>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{stat.completedDays}/{stat.expectedDays} days</span>
                </div>
                <CircularProgress percentage={stat.percentage} colorClass={colorClass} />
              </div>
            );
          })}
        </div>

        {/* Monthly Consistency Flow */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Monthly Consistency Flow</h2>
              <p className="text-sm font-medium text-muted-foreground">Visual breakdown of completed, missed, and protected disrupted days.</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#14B8A6]"></div> Completed</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border border-primary"></div> Disrupted</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-black/10 dark:bg-white/5"></div> Missed</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {monthlyFlow.map((dayObj) => {
              let classNames = "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ";
              if (dayObj.status === 'completed') {
                classNames += "bg-[#14B8A6] text-black shadow-sm";
              } else if (dayObj.status === 'disrupted') {
                classNames += "border border-primary text-primary bg-primary/5";
              } else if (dayObj.status === 'missed') {
                classNames += "bg-black/5 dark:bg-white/5 text-muted-foreground opacity-50";
              } else {
                classNames += "border border-border/50 text-muted-foreground/30";
              }

              return (
                <div key={dayObj.day} className={classNames}>
                  {dayObj.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Streaks & Velocity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-12">
          
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between h-48">
             <span className="text-sm font-bold text-muted-foreground">Current Streak</span>
             <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold text-primary">{streakData.current} Days</span>
                <span className="text-sm font-bold text-muted-foreground">Best: {streakData.best} days</span>
             </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between h-48">
             <span className="text-sm font-bold text-muted-foreground mb-4">Habit Velocity Sparkline</span>
             <div className="flex items-end justify-between h-full gap-2 mt-auto">
               {sparklineData.map((heightPercent, idx) => (
                 <div key={idx} className="w-full bg-black/5 dark:bg-white/5 rounded-t-sm relative group overflow-hidden" style={{ height: '100%' }}>
                   <div 
                     className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-700 ease-out"
                     style={{ height: `${Math.max(heightPercent, 10)}%` }} // Min 10% for visual presence if > 0, actually let's just use what's calculated
                   />
                 </div>
               ))}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AnalyticsView;
