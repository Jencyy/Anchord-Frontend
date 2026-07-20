import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * ForgotPassword Page
 * -----------------------------------------------------------
 * Allows users to request a password reset email if they forgot their password.
 * -----------------------------------------------------------
 */

/**
 * ForgotPassword Component
 * Renders the form to request a password reset link.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  /**
   * handleSubmit
   * Submits the password reset request to the backend.
   * On success, shows a message and starts a 60-second cooldown before allowing another request.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.msg);
      
      // Start 60 second cooldown
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
            Forgot your password? <br />
            <span className="text-secondary-foreground/80">Don't worry, it happens.</span>
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
              Enter your email address and we'll send you a link to reset your password.
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
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99]" 
                disabled={loading || cooldown > 0}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Sending...
                  </div>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : 'Send Reset Link'}
              </Button>
            </div>
            
            <p className="text-sm text-center text-muted-foreground pt-4">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                Log in
              </Link>
            </p>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
