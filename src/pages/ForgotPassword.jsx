/**
 * ForgotPassword Page
 * -----------------------------------------------------------
 * Allows users to request a password reset email if they forgot their password.
 * Rebuilt to perfectly match the split-screen auth design.
 * -----------------------------------------------------------
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AnchorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
);

/**
 * ForgotPassword Component
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.msg);
      
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white dark:bg-[#101014] selection:bg-primary selection:text-white">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#FEF0E6] to-[#FFF9F4] dark:from-[#161311] dark:to-[#100D0B] flex-col justify-between p-12 lg:p-16 xl:p-20 relative overflow-hidden">
        
        {/* Top Logo Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-primary p-2 rounded-xl flex items-center justify-center shadow-sm">
               <AnchorIcon />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">Anchord</span>
          </div>
        </div>

        {/* Middle Graphic Section */}
        <div className="flex flex-col items-center justify-center -mt-10 relative z-10 w-full max-w-[440px] mx-auto">
          {/* Mock UI Graphic */}
          <div className="bg-white dark:bg-[#1c1a1a] rounded-[24px] p-6 border border-gray-100 dark:border-white/5 w-full mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <span className="text-primary text-[11px] font-bold uppercase tracking-wide">Morning Block</span>
              <span className="text-gray-300 dark:text-white/30 text-[11px] font-semibold tracking-wide">07:00 AM — 11:00 AM</span>
            </div>
            
            {/* Row 1: Normal */}
            <div className="bg-[#F8F8F9] dark:bg-[#242222] rounded-xl p-3.5 mb-3 flex items-center gap-3.5">
              <div className="w-[3px] h-[18px] bg-gray-200 dark:bg-white/10 rounded-full"></div>
              <span className="text-gray-500 dark:text-white/60 text-[13px] font-semibold">School Dropoff & Commute</span>
            </div>

            {/* Row 2: Anchored Habit (Dashed Orange) */}
            <div className="bg-[#FFF8F3] dark:bg-[#1c1a1a] rounded-xl p-3.5 border border-dashed border-primary/50 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-[3px] h-[18px] bg-primary rounded-full"></div>
                <span className="text-gray-900 dark:text-white font-bold text-[13px]">Anchor: Read 10 Pages</span>
              </div>
              <div className="bg-primary text-white text-[9px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                Fits Here
              </div>
            </div>
          </div>

          <div className="w-full text-left">
            <h1 className="text-[40px] font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-5">
              Your habits, anchored to your real day.
            </h1>
            <p className="text-gray-500 dark:text-white/50 text-[16px] leading-relaxed font-medium pr-8">
              Ditch the rigid alarms. Anchord bridges your schedule with your goals, automatically slotting habits where they actually fit.
            </p>
          </div>
        </div>

        {/* Bottom Social Proof Section */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <span className="text-gray-400 dark:text-white/40 text-[12px] font-semibold tracking-wide">Trusted by over 40,000 mindful operators</span>
        </div>
      </div>

      {/* RIGHT PANEL (Reset Password) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-[#101014]">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex flex-col space-y-2 mb-10 text-left">
            <h2 className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-[#f2f2f2]">Reset password</h2>
            <p className="text-[14px] text-gray-500 dark:text-white/40 font-medium">
              Enter your email address and we'll send you a password reset link so you can log back in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-400/10 rounded-xl border border-red-200 dark:border-red-400/20 flex items-start gap-3">
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="p-4 text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-400/10 rounded-xl border border-green-200 dark:border-green-400/20 flex items-start gap-3">
                <p>{message}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[12px] font-bold text-gray-700 dark:text-white/60">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] px-4 text-[14px] font-medium rounded-[8px] bg-[#F4F4F5] dark:bg-[#1c1a1a] border border-transparent text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-[46px] bg-primary hover:bg-primary-hover text-white text-[14px] font-bold rounded-[8px] transition-all active:scale-[0.99] disabled:opacity-50"
                disabled={loading || cooldown > 0}
              >
                {loading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Reset Link'}
              </button>
            </div>

            <p className="text-[12px] text-center text-gray-500 dark:text-white/50 font-medium pt-4">
              <Link to="/login" className="text-gray-500 hover:text-primary transition-colors">
                &lt; Back to Login
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
