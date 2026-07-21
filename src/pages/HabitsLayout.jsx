import React from 'react';
import { useOutletContext, Outlet } from 'react-router-dom';
import HabitList from '../components/HabitList';

const HabitsLayout = () => {
  const contextProps = useOutletContext();
  
  return (
    <div className="flex h-full w-full overflow-hidden">
      <HabitList 
        filter={contextProps.filter} 
        habits={contextProps.habits} 
        anchors={contextProps.anchors} 
        habitLogs={contextProps.habitLogs} 
        setHabitLogs={contextProps.setHabitLogs} 
        selectedHabit={contextProps.selectedHabit} 
        setSelectedHabit={contextProps.setSelectedHabit} 
      />
      <Outlet context={contextProps} />
    </div>
  );
};

export default HabitsLayout;
