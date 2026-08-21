/**
 * Onboarding Page
 * -----------------------------------------------------------
 * This page intercepts new users (who have no anchors) and asks them
 * to map their day either by typing naturally (AI parsed) or by
 * filling time blocks manually.
 */

import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ScheduleBuilder from '../components/ScheduleBuilder';

/**
 * Onboarding Component
 * Renders the onboarding flow for new users to set up their initial schedule.
 * Provides options for AI natural language parsing or manual schedule building.
 */
const Onboarding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [step, setStep] = useState(isEditing ? 'builder' : 'choice');
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditing);
  
  // AI Parsing State
  const [aiText, setAiText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  
  // Data passed from AI to the builder
  const [prefilledBlocks, setPrefilledBlocks] = useState([]);

  // Check if they already have anchors on mount
  useEffect(() => {
    const checkAnchors = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/anchors`, {
          headers: { 'x-auth-token': token },
        });
        
        if (isEditing) {
          // Pass the existing anchors to the builder and jump straight to it
          setPrefilledBlocks(res.data);
          setStep('builder');
        } else if (res.data.length > 0) {
          // If not editing and anchors exist, go to dashboard
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to check anchors', err);
      } finally {
        if (isEditing) setIsLoadingExisting(false);
      }
    };
    checkAnchors();
  }, [navigate, isEditing]);

  /**
   * handleAiParse
   * Sends the user's natural language input to the backend AI parser.
   * If successful, moves the user to the builder step with prefilled blocks.
   */
  const handleAiParse = async () => {
    if (!aiText.trim()) {
      setParseError('Please describe your day first.');
      return;
    }

    setIsParsing(true);
    setParseError('');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/parse-schedule`,
        { text: aiText, lifeStage: user?.lifeStage },
        { headers: { 'x-auth-token': token } }
      );
      
      // Tag the returned blocks as new so the builder knows they need saving
      const blocksWithFlags = res.data.map(b => ({ ...b, isNew: true, _id: `ai_${Math.random()}` }));
      setPrefilledBlocks(blocksWithFlags);
      setStep('builder'); // Move to the builder step to confirm/edit
    } catch (err) {
      console.error(err);
      setParseError(err.response?.data?.msg || 'Failed to process text. Let\'s try doing it manually.');
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * handleComplete
   * Callback fired when the ScheduleBuilder finishes saving anchors.
   * Redirects the user to the main dashboard.
   */
  const handleComplete = () => {
    navigate('/'); // Go to dashboard once saved
  };

  if (isLoadingExisting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading your schedule...</p>
      </div>
    );
  }

  if (step === 'builder') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto pt-6 px-4 mb-[-2rem]">
          <button 
            onClick={() => setStep('choice')}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            ← Back
          </button>
        </div>
        <ScheduleBuilder 
          onComplete={handleComplete} 
          userLifeStage={user?.lifeStage} 
          existingAnchors={prefilledBlocks} 
          onSwitchToAI={() => setStep('ai_input')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      
      {/* ── Header ── */}
      <div className="max-w-xl w-full text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center mb-6">
          <img src="/Anchord-logo.png" alt="Anchord Logo" className="h-16 object-contain" />
        </div>
        <div className="inline-flex items-center gap-2 bg-surface border border-border text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          Onboarding
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">
          How does your day look?
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Most apps ask you to pick a habit first. We start with reality. Show us your normal day, and we'll find the perfect gap for your new habit.
        </p>
      </div>

      {step === 'choice' && (
        <div className="max-w-xl w-full grid sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          
          {/* Option A: AI */}
          <button 
            onClick={() => setStep('ai_input')}
            className="flex flex-col text-left p-6 bg-surface border-2 border-border hover:border-primary rounded-2xl shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Describe it to me</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Just type naturally. Tell us when you wake up, work, and sleep. Our AI will map it into a schedule.
            </p>
          </button>

          {/* Option B: Manual */}
          <button 
            onClick={() => {0.
              setPrefilledBlocks([]);
              setStep('builder');
            }}
            className="flex flex-col text-left p-6 bg-surface border-2 border-border hover:border-secondary rounded-2xl shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
          >
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Fill it manually</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Add your time blocks one by one using a simple form. We'll pre-fill some ideas for {user?.lifeStage || 'you'}.
            </p>
          </button>
        </div>
      )}

      {step === 'ai_input' && (
        <div className="max-w-xl w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            
            <button 
              onClick={() => setStep('choice')}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
            >
              ← Back
            </button>

            <h3 className="text-2xl font-bold text-foreground mb-2">Tell us how your days usually go</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              We know that for a {user?.lifeStage || 'person'} like you, not every day is exactly the same. Just write in your own messy format—no spelling checks needed! 
              Mention your weekdays and days off, and we'll figure it out.
            </p>
  
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="e.g., On weekdays I wake up at 7am, do chores till 9, then deep work till 1pm... On my days off I sleep in till 9:30 and read in the afternoon..."
              className="w-full h-40 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-foreground mb-4"
              disabled={isParsing}
            />

            {parseError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {parseError}
              </div>
            )}

            <button
              onClick={handleAiParse}
              disabled={isParsing || !aiText.trim()}
              className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isParsing || !aiText.trim()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm active:scale-[0.98]'
              }`}
            >
              {isParsing ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  Parsing your schedule...
                </>
              ) : (
                'Generate My Schedule'
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Onboarding;
