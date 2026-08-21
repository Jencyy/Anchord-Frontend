/**
 * AddHabit Page
 * -----------------------------------------------------------
 * Allows users to create a new habit and attach it to an existing Anchor.
 * Uses an AI gap finder to suggest the best time block based on schedule gaps.
 * -----------------------------------------------------------
 */
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// Simple SVGs used for UI icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const suggestedHabits = [
  "Read", "Hydrate", "Walk", "Meditate"
];

/**
 * AddHabit Component
 */
const AddHabit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    normal_version: '',
    strategy: '',
    min_version_name: '',
    min_version_time: 5,
    celebration: ''
  });

  const [anchors, setAnchors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState([]);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAnchors = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/anchors`, {
          headers: { 'x-auth-token': token }
        });
        
        const habitsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/habits`, {
          headers: { 'x-auth-token': token }
        });
        
        const anchorsWithCounts = res.data.map(a => ({
          ...a,
          habitCount: habitsRes.data.filter(h => h.anchorId && h.anchorId._id === a._id).length
        }));
        
        setAnchors(anchorsWithCounts);
      } catch (err) {
        console.error('Failed to load anchors', err);
      }
    };
    fetchAnchors();
  }, []);

  const handleGenerate = async () => {
    if (!formData.name) return;
    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/suggest-anchors`,
        { habit: formData, anchors: anchors, lifeStage: user?.lifeStage },
        { headers: { 'x-auth-token': token } }
      );
      setSuggestions(res.data.suggestions);
      setFormData(prev => ({
        ...prev,
        normal_version: res.data.normal_version,
        strategy: res.data.strategy,
        min_version_name: res.data.min_version_name,
        min_version_time: res.data.min_version_time
      }));
      setHasGenerated(true);
      
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        const topId = res.data.suggestions[0].anchorId;
        setSelectedAnchorIds([topId]);
        const anchor = anchors.find(a => a._id === topId);
        if (anchor && anchor.habitCount >= 2) {
          setConflictWarning(true);
        }
      }
    } catch (err) {
      console.error('AI Failed', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectAnchor = (anchorId) => {
    let newSelection;
    if (selectedAnchorIds.includes(anchorId)) {
      newSelection = selectedAnchorIds.filter(id => id !== anchorId);
    } else {
      newSelection = [...selectedAnchorIds, anchorId];
    }
    
    setSelectedAnchorIds(newSelection);
    
    const hasConflict = newSelection.some(id => {
      const anchor = anchors.find(a => a._id === id);
      return anchor && anchor.habitCount >= 2;
    });
    
    setConflictWarning(hasConflict);
  };

  const handleSave = async () => {
    if (!formData.name || selectedAnchorIds.length === 0) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/habits`,
        { ...formData, anchorIds: selectedAnchorIds },
        { headers: { 'x-auth-token': token } }
      );
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="w-full lg:w-[400px] xl:w-[500px] bg-sidebar h-full flex flex-col overflow-y-auto shrink-0 z-0 border-l border-border/50">
      
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
        <h2 className="text-lg font-extrabold text-foreground truncate max-w-[200px] xl:max-w-[300px]">Add New Habit</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shadow-sm flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Habit Details Form */}
        <div className="flex flex-col gap-4">
          
          <div>
            <label className="block text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1.5">Habit Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Reading, Hydration"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedHabits.map(h => (
                <button 
                  key={h}
                  onClick={() => setFormData({...formData, name: h})}
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-border bg-background hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {!hasGenerated ? (
            <button
              onClick={handleGenerate}
              disabled={!formData.name || isAiLoading}
              className="w-full h-10 rounded-lg font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-sm text-sm"
            >
              {isAiLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <SparklesIcon /> AI Strategy & Placement
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1.5">Normal Target</label>
                  <input 
                    type="text" 
                    value={formData.normal_version}
                    onChange={(e) => setFormData({...formData, normal_version: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <SparklesIcon /> Lazy Day Minimum
                  </label>
                  <input 
                    type="text" 
                    value={formData.min_version_name}
                    onChange={(e) => setFormData({...formData, min_version_name: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-primary/30 bg-primary/5 text-foreground text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1.5">Atomic Strategy</label>
                <textarea 
                  value={formData.strategy}
                  onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                  className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Anchors Section */}
        <div className="pt-4 border-t border-border flex flex-col gap-3">
          <label className="block text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">Placement</label>
          
          {!hasGenerated ? (
            <div className="flex flex-col items-center justify-center text-center py-6 opacity-60 bg-background rounded-xl border border-dashed border-border">
              <ClockIcon />
              <p className="text-xs font-semibold mt-2 px-4">Generate a strategy first to see AI recommendations.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.length === 0 && (
                 <p className="text-xs text-muted-foreground italic mb-2">No specific suggestions found. Pick any anchor below.</p>
              )}

              {anchors.map((anchor) => {
                const isSelected = selectedAnchorIds.includes(anchor._id);
                const isSuggested = suggestions.some(s => s.anchorId === anchor._id);

                return (
                  <div 
                    key={anchor._id}
                    onClick={() => handleSelectAnchor(anchor._id)}
                    className={`cursor-pointer border-2 rounded-xl p-3 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : isSuggested 
                          ? 'border-primary/30 bg-background hover:border-primary/50'
                          : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-foreground text-sm">{anchor.label}</h3>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                         {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      {anchor.time_start} - {anchor.time_end}
                    </div>
                  </div>
                );
              })}

              {conflictWarning && (
                <div className="mt-1 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs font-semibold leading-relaxed">
                  Warning: Selected anchor already has 2+ habits. Are you sure you want to stack another?
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={selectedAnchorIds.length === 0 || isSaving}
                className="mt-4 w-full h-12 rounded-lg font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 flex items-center justify-center shadow-sm text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Habit'}
              </button>
            </div>
          )}
        </div>
        
      </div>
    </aside>
  );
};

export default AddHabit;
