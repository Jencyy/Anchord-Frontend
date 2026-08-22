import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ScheduleBuilder from '../components/ScheduleBuilder';
import VisualPlanner from '../components/VisualPlanner';

const ScheduleView = () => {
  const { anchors, habits, user, fetchAnchors, filter } = useOutletContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full px-6 md:px-10 py-4 flex items-center justify-between border-b border-border bg-surface shrink-0">
        <h1 className="text-xl font-bold text-foreground">
          {isEditing ? 'Edit Schedule Blocks' : 'Schedule Overview'}
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            isEditing 
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isEditing ? 'Done Editing' : 'Edit Blocks'}
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col w-full">
        {isEditing ? (
          <ScheduleBuilder 
            existingAnchors={anchors}
            userLifeStage={user?.lifeStage}
            isEmbedded={true}
            onComplete={() => {
              fetchAnchors();
              setIsEditing(false);
            }}
          />
        ) : (
          <VisualPlanner 
            anchors={anchors}
            habits={habits}
            filter={filter}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
