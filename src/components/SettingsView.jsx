import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);

const SettingsView = ({ onClose }) => {
  const { user, updateUserSession } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    lifeStage: user?.lifeStage || 'Working Professional',
    password: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      // only send password if it's not empty
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      
      const res = await axios.put('http://localhost:5000/api/users/profile', payload, {
        headers: { 'x-auth-token': token }
      });
      
      updateUserSession(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="w-full px-8 py-5 flex items-center justify-between border-b border-border bg-surface shrink-0">
        <h1 className="text-2xl font-extrabold text-foreground">App Settings</h1>
        <button 
          onClick={onClose}
          className="text-sm font-bold bg-background border border-border px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shadow-sm"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        <div className="max-w-2xl mx-auto">
          
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-foreground mb-6 pb-4 border-b border-border">Profile Information</h2>
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Life Stage</label>
                <select
                  name="lifeStage"
                  value={formData.lifeStage}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="Working Professional">Working Professional</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">This helps us tailor habit suggestions and schedules for you.</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border mt-6">
                <label className="text-sm font-semibold text-foreground">Change Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  <SaveIcon />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
