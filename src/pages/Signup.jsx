import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Global Authentication Context
import AuthContext from '../context/AuthContext';

const Signup = () => {
  const { registerUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    lifeStage: 'Student'
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
    
    const res = await registerUser(formData);
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/90 z-0"></div>
        
        {/* Subtle patterned overlay or image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>
        
        {/* Top Branding */}
        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Anchord</span>
        </div>

        {/* Center/Bottom Attractive Line & Social Proof */}
        <div className="relative z-10 p-12 w-full max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Stop floating. <br />
            <span className="text-primary-foreground/80">Get Anchord.</span>
          </h1>
          
          {/* Attractive Quote Line */}
          <blockquote className="border-l-4 border-accent pl-5 mt-10">
            <p className="text-xl italic text-primary-foreground/90 font-medium leading-relaxed">
              "Before Anchord, my schedule was pure chaos. Now, my days are beautifully structured, focused, and actually peaceful."
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface/20 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                E
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white text-base">Elena Rodriguez</p>
                <p className="text-primary-foreground/70">Freelance Designer</p>
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-base text-muted-foreground">
              Enter your details below to get started with Anchord.
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
              
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="h-12 px-4 text-base rounded-lg border-border bg-background focus-visible:ring-primary focus-visible:border-primary transition-colors"
                />
              </div>

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
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
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

              {/* Life Stage Select */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="lifeStage" className="text-sm font-semibold text-foreground">Current Life Stage</Label>
                <div className="relative">
                  <select 
                    id="lifeStage" 
                    name="lifeStage" 
                    value={formData.lifeStage} 
                    onChange={handleChange}
                    className="flex h-12 w-full appearance-none items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <option value="Student">🎓 Student</option>
                    <option value="Working professional">💼 Working professional</option>
                    <option value="Homemaker">🏠 Homemaker</option>
                    <option value="Retired">🌴 Retired</option>
                    <option value="Mixed">🔄 Mixed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
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
                    Creating account...
                  </div>
                ) : 'Create account'}
              </Button>
            </div>
            
            {/* Footer Link */}
            <p className="text-sm text-center text-muted-foreground pt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                Log in here
              </Link>
            </p>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
