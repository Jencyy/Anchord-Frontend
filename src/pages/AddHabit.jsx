import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// Simple SVGs
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const suggestedHabits = [
  "Read a book",
  "Drink water",
  "Quick 10m walk",
  "Meditation",
  "Wash my face",
  "Reduce phone scrolling"
];

const AddHabit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 'details' | 'gap_finder'
  const [step, setStep] = useState('details');

  // Step 1 State
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    normal_version: '',
    strategy: '',
    min_version_name: '',
    min_version_time: 5,
    celebration: ''
  });

  // Step 2 State
  const [anchors, setAnchors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState([]);
  
  // To show conflict warning
  const [conflictWarning, setConflictWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Pre-fetch anchors so we have them ready for the gap finder
    const fetchAnchors = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/anchors', {
          headers: { 'x-auth-token': token }
        });
        
        // Also fetch habits to know how many are stacked on each anchor (for conflict check)
        const habitsRes = await axios.get('http://localhost:5000/api/habits', {
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

  const handleNext = async () => {
    setStep('gap_finder');
    // Trigger AI suggestion
    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/ai/suggest-anchors',
        {
          habit: formData,
          anchors: anchors,
          lifeStage: user?.lifeStage
        },
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
      
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        // Auto-select the top suggestion
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
    
    // Check if ANY selected anchor has >= 2 habits
    const hasConflict = newSelection.some(id => {
      const anchor = anchors.find(a => a._id === id);
      return anchor && anchor.habitCount >= 2;
    });
    
    setConflictWarning(hasConflict);
  };

  const handleSave = async () => {
    if (selectedAnchorIds.length === 0) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/habits',
        { ...formData, anchorIds: selectedAnchorIds },
        { headers: { 'x-auth-token': token } }
      );
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        
        <button 
          onClick={() => step === 'gap_finder' ? setStep('details') : navigate('/')}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 mb-8"
        >
          ← {step === 'gap_finder' ? 'Back to Details' : 'Cancel'}
        </button>

        {step === 'details' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              What do you want to improve?
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Small actions compound over time. Be completely honest with yourself—whether it's adding a healthy habit or replacing a minor bad habit (like phone scrolling). What's one thing you want to add to your day?
            </p>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Habit Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Reading, Hydration, No Social Media"
                  className="h-12 rounded-xl border border-border bg-background px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedHabits.map(h => (
                    <button 
                      key={h}
                      onClick={() => setFormData({...formData, name: h})}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.name}
                className="mt-2 w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <SparklesIcon />
                Find the perfect time block
              </button>
            </div>
          </div>
        )}

        {step === 'gap_finder' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2 flex items-center gap-2">
              <SparklesIcon /> The Gap Finder
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We analyzed your schedule to find the perfect place to stack your new <strong>"{formData.name}"</strong> habit. Pick an anchor below.
            </p>

            {formData.min_version_name && !isAiLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Normal & Minimum Target Card */}
                <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground font-extrabold text-sm border-b border-border/50 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    Your Targets
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Normal Day</span>
                    <p className="text-sm font-semibold text-foreground">{formData.normal_version}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-1 flex items-center gap-1"><SparklesIcon /> Lazy Day Minimum</span>
                    <p className="text-sm font-bold text-primary-foreground leading-snug">{formData.min_version_name}</p>
                    <span className="inline-block mt-1.5 text-primary text-[10px] uppercase font-bold opacity-80">
                      Time Cost: {formData.min_version_time}m
                    </span>
                  </div>
                </div>

                {/* Atomic Habits Strategy Card */}
                <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground font-extrabold text-sm border-b border-border/50 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m13.4 2-8.8 8.8a2.1 2.1 0 0 0-.2 2.7l3.6 4.9"/><path d="M11.5 8.5 21 18l-3 3-9.5-9.5"/><path d="M15.5 12.5 12 9"/></svg>
                    Atomic Strategy
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {formData.strategy}
                  </p>
                </div>
              </div>
            )}

            {isAiLoading ? (
              <div className="bg-surface border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 rounded-full border-[3px] border-border border-t-primary animate-spin mb-4" />
                <p className="font-bold text-foreground">AI is scanning your schedule...</p>
                <p className="text-xs text-muted-foreground mt-1">Looking for open gaps of {formData.min_version_time}m or more.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* Suggestions from AI */}
                {suggestions.map((sug, idx) => {
                  const anchor = anchors.find(a => a._id === sug.anchorId);
                  if (!anchor) return null;
                  
                  const isSelected = selectedAnchorIds.includes(anchor._id);

                  return (
                    <div 
                      key={anchor._id}
                      onClick={() => handleSelectAnchor(anchor._id)}
                      className={`cursor-pointer border-2 rounded-2xl p-5 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border bg-surface hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {idx === 0 && <span className="text-[10px] uppercase font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Top Match</span>}
                            <h3 className="font-bold text-foreground text-lg">{anchor.label}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <ClockIcon /> {anchor.time_start} - {anchor.time_end} • {anchor.day_type}
                          </div>
                        </div>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 bg-background border border-border/50 rounded-xl p-3">
                        <span className="font-bold text-primary">Why:</span> {sug.reason}
                      </p>
                    </div>
                  );
                })}

                {/* Conflict Warning */}
                {conflictWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-4 flex gap-3 items-start animate-in fade-in zoom-in-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div className="text-sm font-medium">
                      <strong>Woah there!</strong> One or more of these anchors already has 2 or more habits stacked on it. 
                      Stacking too many things in one block makes it harder to stick with. Are you sure?
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={selectedAnchorIds.length === 0 || isSaving}
                  className="mt-4 w-full h-14 rounded-xl font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 flex items-center justify-center shadow-md"
                >
                  {isSaving ? 'Saving...' : `Lock in "${formData.name}"`}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AddHabit;
