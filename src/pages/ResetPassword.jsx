import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * ResetPassword Page
 * -----------------------------------------------------------
 * Allows users to set a new password using a token received via email.
 * -----------------------------------------------------------
 */

/**
 * ResetPassword Component
 * Renders the form to input a new password and confirm it.
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit
   * Submits the new password along with the reset token to the backend.
   * Validates that both passwords match before submitting.
   */
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
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
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
    <div className="min-h-screen flex w-full font-sans">
      
      {/* =========================================
          LEFT SIDE (Branding & Image)
          ========================================= */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Anchord</span>
        </div>

        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Create new password <br />
            <span className="text-secondary-foreground/80">Make it a strong one.</span>
          </h1>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE (Form)
          ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-surface">
        
        <div className="w-full max-w-[400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex flex-col space-y-3 mb-10 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h2>
            <p className="text-base text-muted-foreground">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="p-4 text-sm font-medium text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p>{message}</p>
              </div>
            )}
            
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Resetting...
                  </div>
                ) : 'Reset Password'}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
