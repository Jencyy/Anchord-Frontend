/**
 * AddHabit Page
 * -----------------------------------------------------------
 * Implements the Frame 28 UI: Full-width 2-column layout.
 * Left: Form details (Name, Category, Duration, Anchor).
 * Right: AI Strategy Generator.
 * -----------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const AddHabit = () => {
  const navigate = useNavigate();
  const { user, fetchAnchors: refreshDashboard } = useOutletContext(); // Access context provided by Dashboard

  const [formData, setFormData] = useState({
    name: '',
    category: 'Health',
    ideal_duration: 30,
    frequency: 'daily',
    normal_version: '',
    strategy: '',
    min_version_name: '',
    min_version_time: 5,
    celebration: ''
  });

  const [anchors, setAnchors] = useState([]);
  const [selectedAnchorId, setSelectedAnchorId] = useState('');
  const [conflictWarning, setConflictWarning] = useState(false);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
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

  const handleSelectAnchor = (anchorId) => {
    setSelectedAnchorId(anchorId);
    const anchor = anchors.find(a => a._id === anchorId);
    setConflictWarning(anchor && anchor.habitCount >= 2);
  };

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
      
      setFormData(prev => ({
        ...prev,
        normal_version: res.data.normal_version,
        strategy: res.data.strategy,
        min_version_name: res.data.min_version_name,
        min_version_time: res.data.min_version_time
      }));
      setHasGenerated(true);
      
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        handleSelectAnchor(res.data.suggestions[0].anchorId);
      }
    } catch (err) {
      console.error('AI Failed', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !selectedAnchorId) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/habits`,
        { ...formData, anchorId: selectedAnchorId },
        { headers: { 'x-auth-token': token } }
      );
      if (refreshDashboard) await refreshDashboard();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ["Health", "Work", "Personal", "Learning", "Finance"];

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="p-8 lg:px-12 flex flex-col lg:flex-row gap-12 lg:gap-24 h-full">
        
        {/* Left Column: Form */}
        <div className="flex-1 max-w-2xl flex flex-col gap-8">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-black/5 rounded-full text-muted-foreground hover:text-foreground transition-colors">
              <BackIcon />
            </button>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create New Habit</h1>
          </div>

          <div className="flex flex-col gap-6">
            
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Habit Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Deep Work, Gym, Reading"
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-medium placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Ideal Duration (mins)</label>
                <input 
                  type="number" 
                  value={formData.ideal_duration}
                  onChange={(e) => setFormData({...formData, ideal_duration: parseInt(e.target.value) || 0})}
                  className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Select Anchor Slot
                <span className="text-[10px] text-primary normal-case font-bold bg-primary/10 px-2 py-0.5 rounded-full">Recommended</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {anchors.map(anchor => (
                  <div 
                    key={anchor._id}
                    onClick={() => handleSelectAnchor(anchor._id)}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col gap-2 ${
                      selectedAnchorId === anchor._id
                        ? 'border-[#e89454] bg-[#e89454]/5 shadow-sm' 
                        : 'border-border bg-surface hover:border-[#e89454]/50 hover:bg-black/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-foreground text-[15px]">{anchor.label}</span>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedAnchorId === anchor._id ? 'border-[#e89454] bg-[#e89454]' : 'border-muted-foreground/30'
                      }`}>
                         {selectedAnchorId === anchor._id && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground bg-background self-start px-2 py-0.5 rounded-md border border-border">
                      {anchor.time_start} - {anchor.time_end}
                    </span>
                  </div>
                ))}
              </div>

              {conflictWarning && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-[13px] font-bold flex items-start gap-3">
                  <div className="mt-0.5"><WarningIcon /></div>
                  <div>
                    <p>Overstacking Warning</p>
                    <p className="text-xs font-medium text-destructive/80 mt-1">This anchor already has 2+ habits. Adding another might decrease your consistency.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!selectedAnchorId || isSaving || !formData.name}
              className="mt-8 w-full h-14 rounded-xl font-extrabold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 shadow-sm text-[15px]"
            >
              {isSaving ? 'Saving Habit...' : 'Save Habit'}
            </button>
            
          </div>
        </div>

        {/* Right Column: AI Strategy Generator */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
          <div className="sticky top-8 bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
            
            <div className="flex items-center gap-3 text-primary border-b border-border/50 pb-6">
              <div className="p-2 bg-primary/10 rounded-xl"><SparklesIcon /></div>
              <h2 className="text-xl font-extrabold">AI Strategy Generator</h2>
            </div>

            {!hasGenerated ? (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                  Generate an AI-powered plan to make your habit stick. We'll suggest the best anchor and create a "Lazy Day" minimum version.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={!formData.name || isAiLoading}
                  className="w-full h-12 rounded-xl font-bold bg-secondary hover:bg-secondary-hover text-secondary-foreground border border-border transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 text-sm shadow-sm"
                >
                  {isAiLoading ? 'Analyzing Routine...' : 'Generate Strategy'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Target Version</label>
                  <input 
                    type="text" 
                    value={formData.normal_version}
                    onChange={(e) => setFormData({...formData, normal_version: e.target.value})}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
                    <SparklesIcon /> Lazy Day Minimum
                  </label>
                  <input 
                    type="text" 
                    value={formData.min_version_name}
                    onChange={(e) => setFormData({...formData, min_version_name: e.target.value})}
                    className="w-full h-12 px-4 bg-surface border border-primary/30 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all mt-2"
                  />
                  <p className="text-[11px] font-medium text-primary/80 mt-2 px-1">This protects your streak on low-energy days.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Atomic Strategy</label>
                  <textarea 
                    value={formData.strategy}
                    onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                    className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl text-[13px] font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isAiLoading}
                  className="text-xs font-bold text-primary hover:text-primary-hover self-center mt-2 transition-colors"
                >
                  Regenerate Strategy
                </button>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddHabit;
