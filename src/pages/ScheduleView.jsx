import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ScheduleBuilder from '../components/ScheduleBuilder';

const ScheduleView = () => {
  const { anchors, user, fetchAnchors } = useOutletContext();
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full px-8 py-5 flex items-center justify-between border-b border-border bg-surface shrink-0">
        <h1 className="text-2xl font-extrabold text-foreground">Edit Schedule</h1>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col w-full">
        <ScheduleBuilder 
          existingAnchors={anchors}
          userLifeStage={user?.lifeStage}
          isEmbedded={true}
          onComplete={() => {
            fetchAnchors();
            navigate('/');
          }}
        />
      </div>
    </div>
  );
};

export default ScheduleView;
