/**
 * ResetPassword Page
 * -----------------------------------------------------------
 * Allows users to set a new password using a token received via email.
 * Rebuilt to perfectly match the split-screen auth design.
 * -----------------------------------------------------------
 */
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * EyeOffIcon Component
 */
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-white transition-colors"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const AnchorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
);

/**
 * ResetPassword Component
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.msg);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white dark:bg-[#101014] selection:bg-[#e89454] selection:text-white">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[#FDF7F1] dark:bg-[#161311] flex-col justify-between p-12 lg:p-16 xl:p-20 relative overflow-hidden">
        
        {/* Top Logo Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-[#e89454] p-2 rounded-xl flex items-center justify-center shadow-sm">
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
              <span className="text-[#e89454] text-[11px] font-bold uppercase tracking-wide">Morning Block</span>
              <span className="text-gray-300 dark:text-white/30 text-[11px] font-semibold tracking-wide">07:00 AM — 11:00 AM</span>
            </div>
            
            {/* Row 1: Normal */}
            <div className="bg-[#F8F8F9] dark:bg-[#242222] rounded-xl p-3.5 mb-3 flex items-center gap-3.5">
              <div className="w-[3px] h-[18px] bg-gray-200 dark:bg-white/10 rounded-full"></div>
              <span className="text-gray-500 dark:text-white/60 text-[13px] font-semibold">School Dropoff & Commute</span>
            </div>

            {/* Row 2: Anchored Habit (Dashed Orange) */}
            <div className="bg-[#FFF8F3] dark:bg-[#1c1a1a] rounded-xl p-3.5 border border-dashed border-[#e89454]/50 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-[3px] h-[18px] bg-[#e89454] rounded-full"></div>
                <span className="text-gray-900 dark:text-white font-bold text-[13px]">Anchor: Read 10 Pages</span>
              </div>
              <div className="bg-[#e89454] text-white text-[9px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
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
          <div className="w-1.5 h-1.5 rounded-full bg-[#e89454]"></div>
          <span className="text-gray-400 dark:text-white/40 text-[12px] font-semibold tracking-wide">Trusted by over 40,000 mindful operators</span>
        </div>
      </div>

      {/* RIGHT PANEL (Reset Password) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-[#101014]">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex flex-col space-y-2 mb-10 text-left">
            <h2 className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-[#f2f2f2]">Reset Password</h2>
            <p className="text-[14px] text-gray-500 dark:text-white/40 font-medium">
              Please enter your new password below.
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
              
              {/* New Password Field */}
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="password" className="text-[12px] font-bold text-gray-700 dark:text-white/60">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[46px] px-4 pr-12 text-[14px] font-medium rounded-[8px] bg-[#F4F4F5] dark:bg-[#1c1a1a] border border-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#e89454] focus:ring-1 focus:ring-[#e89454] transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 tracking-[0.2em]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <EyeOffIcon />
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="confirmPassword" className="text-[12px] font-bold text-gray-700 dark:text-white/60">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[46px] px-4 pr-12 text-[14px] font-medium rounded-[8px] bg-[#F4F4F5] dark:bg-[#1c1a1a] border border-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#e89454] focus:ring-1 focus:ring-[#e89454] transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 tracking-[0.2em]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <EyeOffIcon />
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-[46px] bg-[#e89454] hover:bg-[#d68549] text-white text-[14px] font-bold rounded-[8px] transition-all active:scale-[0.99]"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <p className="text-[12px] text-center text-gray-500 dark:text-white/50 font-medium pt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-[#e89454] hover:text-[#d68549] hover:underline transition-colors ml-1 font-semibold">
                Log In
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
