/**
 * ScheduleBuilder Component
 * -----------------------------------------------------------
 * A two-tab form that lets users build their Weekday and Day-Off
 * schedules by adding named time blocks.
 * -----------------------------------------------------------
 */

import { useState } from 'react';
import axios from 'axios';

const SUGGESTIONS = {
  'Student': [
    { label: 'Morning Routine', start: '07:00', end: '08:00' },
    { label: 'Classes / Lectures', start: '09:00', end: '14:00' },
    { label: 'Study Block', start: '15:00', end: '17:00' },
    { label: 'Free Time', start: '18:00', end: '20:00' },
  ],
  'Working professional': [
    { label: 'Morning Routine', start: '06:30', end: '07:30' },
    { label: 'Commute', start: '08:00', end: '09:00' },
    { label: 'Deep Work', start: '10:00', end: '12:00' },
    { label: 'Lunch Break', start: '12:00', end: '13:00' },
    { label: 'Evening Relaxation', start: '19:00', end: '22:00' },
  ],
  'Homemaker': [
    { label: 'Morning Chores', start: '06:00', end: '08:00' },
    { label: 'School Drop-Off', start: '08:00', end: '09:00' },
    { label: 'Afternoon Break', start: '13:00', end: '15:00' },
    { label: 'Family Time', start: '18:00', end: '20:00' },
  ],
  'Retired': [
    { label: 'Morning Walk', start: '07:00', end: '08:30' },
    { label: 'Leisure / Reading', start: '10:00', end: '12:00' },
    { label: 'Nap / Rest', start: '14:00', end: '15:00' },
    { label: 'Evening', start: '17:00', end: '21:00' },
  ],
  'Mixed': [
    { label: 'Morning', start: '08:00', end: '10:00' },
    { label: 'Afternoon', start: '13:00', end: '16:00' },
    { label: 'Evening', start: '18:00', end: '21:00' },
  ],
};

const ClockIcon = ({ size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const TrashIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
);

const PlusIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const Spinner = () => (
  <div className="h-5 w-5 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
);

const SparklesIcon = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

const ScheduleBuilder = ({ onComplete, userLifeStage, existingAnchors = [], onSwitchToAI }) => {
  const [activeTab, setActiveTab] = useState('weekday');
  const [blocks, setBlocks] = useState(existingAnchors);
  
  const [formLabel, setFormLabel] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formError, setFormError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const tabBlocks = blocks.filter(b => b.day_type === activeTab);
  const suggestions = SUGGESTIONS[userLifeStage] || SUGGESTIONS['Mixed'];

  const handleSuggestionClick = (sug) => {
    setFormLabel(sug.label);
    setFormStart(sug.start);
    setFormEnd(sug.end);
    setFormError('');
  };

  const handleAddBlock = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formLabel.trim()) {
      setFormError('Please enter a block name.');
      return;
    }
    if (formStart >= formEnd) {
      setFormError('End time must be after start time.');
      return;
    }

    const newBlock = {
      _id: `local_${Date.now()}`,
      label: formLabel.trim(),
      time_start: formStart,
      time_end: formEnd,
      day_type: activeTab,
      isNew: true,
    };

    setBlocks(prev => [...prev, newBlock]);
    setFormLabel('');
    setFormStart(formEnd);
  };

  const handleRemoveBlock = (id) => {
    setBlocks(prev => prev.filter(b => b._id !== id));
  };

  const handleSave = async () => {
    const newBlocks = blocks.filter(b => b.isNew);
    if (newBlocks.length === 0) {
      setSaveError('Add at least one time block before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      for (const b of newBlocks) {
        await axios.post('http://localhost:5000/api/anchors', {
          label: b.label,
          time_start: b.time_start,
          time_end: b.time_end,
          day_type: b.day_type,
        }, { headers });
      }
      onComplete();
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError('Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const newBlockCount = blocks.filter(b => b.isNew).length;

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center gap-2 bg-surface border border-border text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          Step 1 of 3 — Map Your Routine
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Structure your day.
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Add the fixed blocks in your day. We'll use the gaps between them to suggest the best time for your habits.
        </p>
      </div>

      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="p-4 bg-background border-b border-border">
            <div className="flex bg-surface border border-border p-1.5 rounded-xl gap-1">
              {[
                { key: 'weekday', label: 'Weekday', sub: 'Mon – Fri' },
                { key: 'day_off', label: 'Day Off', sub: 'Weekend / Holiday' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1 ${
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs font-medium ${activeTab === tab.key ? 'text-primary-foreground/80' : 'text-muted-foreground/70'}`}>{tab.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-10">
            
            {/* Left side: Blocks List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-foreground">
                  {activeTab === 'weekday' ? 'Weekday' : 'Day Off'} Schedule
                </h3>
                {tabBlocks.length > 0 && (
                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {tabBlocks.length} block{tabBlocks.length !== 1 && 's'}
                  </span>
                )}
              </div>

              {tabBlocks.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl py-12 flex flex-col items-center gap-3 text-muted-foreground bg-background/50">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center">
                    <ClockIcon size={24} className="text-muted-foreground/50" />
                  </div>
                  <div className="text-center mb-1">
                    <p className="text-sm font-semibold text-foreground">No blocks yet</p>
                    <p className="text-xs mt-1">Use the form to add your first time block</p>
                  </div>
                  {onSwitchToAI && (
                    <button
                      type="button"
                      onClick={onSwitchToAI}
                      className="mt-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
                    >
                      {/* <SparklesIcon size={16} /> */}
                      Auto-fill with AI
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {tabBlocks.map(b => (
                    <div key={b._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface border border-border rounded-xl hover:border-primary/30 transition-all duration-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-1.5 rounded-full flex-shrink-0 ${b.isNew ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <p className="font-bold text-foreground">{b.label}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                            <ClockIcon size={12} />
                            <span className="text-xs font-semibold">{b.time_start} – {b.time_end}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        {b.isNew ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(b._id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove block"
                          >
                            <TrashIcon size={16} />
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                            Saved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Add Form */}
            <div className="flex-1 lg:max-w-sm">
              <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-base font-bold text-foreground mb-6">Add New Block</h3>
                
                {/* Suggestions */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    Quick add for {userLifeStage || 'you'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        className="text-xs font-medium bg-surface text-foreground border border-border hover:border-primary/50 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all text-left flex items-center gap-1.5"
                      >
                        <PlusIcon size={12} className="text-primary" />
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddBlock} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Block Name</label>
                    <input
                      type="text"
                      value={formLabel}
                      onChange={e => setFormLabel(e.target.value)}
                      placeholder="e.g. Deep Work"
                      className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Start Time</label>
                      <input
                        type="time"
                        value={formStart}
                        onChange={e => setFormStart(e.target.value)}
                        className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">End Time</label>
                      <input
                        type="time"
                        value={formEnd}
                        onChange={e => setFormEnd(e.target.value)}
                        className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-foreground hover:bg-foreground/90 text-background font-semibold text-sm transition-all"
                  >
                    <PlusIcon size={16} />
                    Add Block
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Footer Save */}
          <div className="px-6 py-5 md:px-8 bg-background border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-muted-foreground text-center sm:text-left">
              {saveError && <p className="text-destructive mb-1 font-semibold">{saveError}</p>}
              {newBlockCount === 0 
                ? 'Add blocks to build your schedule' 
                : `${newBlockCount} unsaved block${newBlockCount !== 1 ? 's' : ''}`}
            </div>
            
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || newBlockCount === 0}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-lg font-semibold text-base transition-all
                ${isSaving || newBlockCount === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow active:scale-[0.98]'
                }`}
            >
              {isSaving ? (
                <><Spinner /> Saving...</>
              ) : (
                'Save Schedule'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScheduleBuilder;
