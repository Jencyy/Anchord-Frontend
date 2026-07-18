import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Global Authentication Context
import AuthContext from '../context/AuthContext';

const Login = () => {
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await loginUser(formData);
    if (!res.success) {
      setError(res.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* =========================================
          LEFT SIDE (Branding & Image)
          Hidden on mobile, takes 50% width on desktop
          ========================================= */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-primary">
        {/* Deep colored gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 z-0"></div>
        
        {/* Subtle patterned overlay or image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>
        
        {/* Top Branding */}
        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto flex items-center gap-3">
          <img src="/Anchord-logo.png" alt="Anchord Logo" className="h-16 object-contain brightness-0 invert" />
        </div>

        {/* Center/Bottom Attractive Line & Social Proof */}
        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Master your time. <br />
            <span className="text-secondary-foreground/80">Design your life.</span>
          </h1>
          
          {/* Attractive Quote Line */}
          <blockquote className="border-l-4 border-secondary pl-5 mt-10">
            <p className="text-xl italic text-primary-foreground/90 font-medium leading-relaxed">
              "Anchord is my absolute secret weapon. It completely eliminated my procrastination and finally gave me my weekends back."
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface/20 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                A
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white text-base">Alex Mercer</p>
                <p className="text-primary-foreground/70">Software Engineer</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE (Form)
          Takes 100% width on mobile, 50% on desktop
          Pure white surface for a modern, clean look
          ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-surface">
        
        {/* Form Container (No card border, just clean spacing) */}
        <div className="w-full max-w-[400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header section */}
          <div className="flex flex-col space-y-3 mb-10 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Log in</h2>
            <p className="text-base text-muted-foreground">
              Enter your email and password to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Banner */}
            {error && (
              <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p>{error}</p>
              </div>
            )}
            
            {/* Form Fields Container */}
            <div className="space-y-5">
              
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  placeholder="••••••••" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>
              
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Logging in...
                  </div>
                ) : 'Log In'}
              </Button>
            </div>
            
            {/* Footer Link */}
            <p className="text-sm text-center text-muted-foreground pt-4">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                Sign up for free
              </Link>
            </p>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
