import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HabitDetails from '../components/HabitDetails';

const HabitsView = () => {
  const contextProps = useOutletContext();
  
  return (
    <HabitDetails 
      habit={contextProps.selectedHabit} 
      habitLogs={contextProps.habitLogs} 
    />
  );
};

export default HabitsView;
