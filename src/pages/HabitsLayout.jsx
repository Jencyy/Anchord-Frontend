import React from 'react';
import { useOutletContext, Outlet } from 'react-router-dom';
import HabitList from '../components/HabitList';

const HabitsLayout = () => {
  const contextProps = useOutletContext();

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <div className={`flex-1 min-w-0 h-full ${contextProps.selectedHabit ? 'hidden lg:block' : 'block'}`}>
        <HabitList
          filter={contextProps.filter}
          habits={contextProps.habits}
          anchors={contextProps.anchors}
          habitLogs={contextProps.habitLogs}
          setHabitLogs={contextProps.setHabitLogs}
          selectedHabit={contextProps.selectedHabit}
          setSelectedHabit={contextProps.setSelectedHabit}
          user={contextProps.user}
        />
      </div>
      {/* Habit Details Section - Simple toggle on mobile, fixed width on desktop */}
      <div className={`
        absolute lg:relative inset-0 lg:inset-auto h-full z-30 
        bg-background lg:bg-transparent
        ${contextProps.selectedHabit ? 'block' : 'hidden lg:block'}
      `}>
        <Outlet context={contextProps} />
      </div>
    </div>
  );
};

export default HabitsLayout;
