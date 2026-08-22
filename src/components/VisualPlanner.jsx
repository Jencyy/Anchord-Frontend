/**
 * VisualPlanner Component
 * Renders a timeline of the user's schedule, highlighting busy blocks, 
 * anchor slots (where habits live), and free gaps.
 */
import React from 'react';

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const calculateDurationStr = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const VisualPlanner = ({ anchors = [], habits = [], filter = 'weekday' }) => {
  
  // 1. Filter anchors by day type (e.g., 'weekday'). If 'all', default to 'weekday' or the first available type.
  let activeFilter = filter === 'all' ? 'weekday' : filter;
  let dayAnchors = anchors.filter(a => a.day_type === activeFilter);
  
  // Fallback if the user has anchors but none match the active filter
  if (dayAnchors.length === 0 && anchors.length > 0) {
    activeFilter = anchors[0].day_type;
    dayAnchors = anchors.filter(a => a.day_type === activeFilter);
  }
  
  // 2. Sort anchors chronologically
  const sortedAnchors = [...dayAnchors].sort((a, b) => parseTime(a.time_start) - parseTime(b.time_start));

  // 3. Generate timeline blocks (including gaps)
  const timelineBlocks = [];
  
  for (let i = 0; i < sortedAnchors.length; i++) {
    const anchor = sortedAnchors[i];
    const prevAnchor = i > 0 ? sortedAnchors[i - 1] : null;
    
    // Check for gaps before this anchor
    if (prevAnchor) {
      const prevEnd = parseTime(prevAnchor.time_end);
      const currStart = parseTime(anchor.time_start);
      if (currStart > prevEnd) {
        timelineBlocks.push({
          type: 'gap',
          _id: `gap_${i}`,
          time_start: prevAnchor.time_end,
          time_end: anchor.time_start,
          durationMins: currStart - prevEnd,
          label: `${calculateDurationStr(currStart - prevEnd)} FREE GAP`
        });
      }
    }

    // Attach habits to the anchor
    const anchorHabits = habits.filter(h => {
      const hAnchorId = h.anchorId?._id || h.anchorId;
      return hAnchorId === anchor._id;
    });

    if (anchorHabits.length > 0) {
      timelineBlocks.push({
        type: 'anchor_slot',
        ...anchor,
        habits: anchorHabits
      });
    } else {
      timelineBlocks.push({
        type: 'busy_block',
        ...anchor
      });
    }
  }

  // Generate the timeline UI
  return (
    <div className="w-full h-full flex-1 overflow-y-auto bg-background p-6 md:p-10 text-foreground">
      
      {/* Legend & Title */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div>
          <p className="text-[#e89454] text-xs font-bold uppercase tracking-widest mb-2">Visual Planner</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Your Schedule</h2>
          <p className="text-muted-foreground text-sm">Find gaps in your real day to dock new habits naturally.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-[#18181b] border border-border px-5 py-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-muted-foreground/30 shadow-sm"></div>
            <span className="text-xs font-semibold text-muted-foreground">Busy Blocks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded border border-dashed border-[#e89454] bg-transparent"></div>
            <span className="text-xs font-semibold text-muted-foreground">Free Gaps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-[#e89454]"></div>
            <span className="text-xs font-semibold text-muted-foreground">Anchored Habits</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="max-w-5xl mx-auto space-y-4 pb-20">
        {timelineBlocks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface/30">
            <p className="text-muted-foreground font-semibold">No blocks on this day yet.</p>
          </div>
        ) : (
          timelineBlocks.map(block => {
            // Render specific block types
            
            // 1. BUSY BLOCK
            if (block.type === 'busy_block') {
              return (
                <div key={block._id} className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-8 group">
                  <div className="w-20 shrink-0 flex items-center md:items-start pt-4 justify-end">
                    <span className="text-xs font-bold text-muted-foreground">{formatTime(block.time_start)}</span>
                  </div>
                  <div className="flex-1 bg-[#25252d] border border-transparent rounded-xl p-4 px-5 flex items-center shadow-sm">
                    <div className="w-1 h-5 bg-muted-foreground/30 rounded-full mr-4 shrink-0"></div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground/90">{block.label}</span>
                      <span className="text-xs font-bold text-muted-foreground/60">{formatTime(block.time_start)} – {formatTime(block.time_end)}</span>
                    </div>
                  </div>
                </div>
              );
            }
            
            // 2. ANCHOR SLOT
            if (block.type === 'anchor_slot') {
              return (
                <div key={block._id} className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-8 group">
                  <div className="w-20 shrink-0 flex items-center md:items-start pt-4 justify-end">
                    <span className="text-xs font-bold text-[#e89454]">{formatTime(block.time_start)}</span>
                  </div>
                  <div className="flex-1 bg-surface border border-[#e89454]/30 rounded-xl p-4 px-5 shadow-sm relative overflow-hidden">
                    {/* Tiny colored dot at top left like in mockup */}
                    <div className="absolute top-5 left-4 w-1 h-1 rounded-full bg-[#e89454]"></div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs tracking-wider text-[#e89454] uppercase">{block.label} (ANCHOR SLOT)</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/60">{formatTime(block.time_start)} – {formatTime(block.time_end)}</span>
                    </div>
                    
                    {/* Habit Pills */}
                    <div className="flex flex-wrap gap-2 mt-4 ml-3">
                      {block.habits.map(habit => (
                        <div key={habit._id} className="bg-[#e89454] text-[#18181b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                          {habit.name}
                          <div className="flex items-center gap-0.5 opacity-90 ml-1">
                            <CheckIcon /> <span className="font-bold tracking-tight text-[10px]">fits</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // 3. FREE GAP
            if (block.type === 'gap') {
              return (
                <div key={block._id} className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-8 group">
                  <div className="w-20 shrink-0 flex items-center md:items-start pt-4 justify-end">
                    <span className="text-xs font-bold text-[#e89454]">{formatTime(block.time_start)}</span>
                  </div>
                  <div className="flex-1 border border-dashed border-[#e89454]/40 bg-transparent rounded-xl p-4 px-5 relative overflow-hidden flex flex-col justify-center">
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span className="font-bold text-[11px] tracking-wider text-[#e89454] uppercase">{block.label}</span>
                      <span className="text-[11px] font-semibold text-[#e89454]/60 hidden sm:block">Perfect time to slot learning habits</span>
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          })
        )}
      </div>
    </div>
  );
};

export default VisualPlanner;
