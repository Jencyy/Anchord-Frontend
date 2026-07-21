import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);

const SettingsView = () => {
  const { user, updateUserSession } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    lifeStage: user?.lifeStage || 'Working Professional',
    password: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      
      const res = await axios.put('http://localhost:5000/api/users/profile', payload, {
        headers: { 'x-auth-token': token }
      });
      
      if (updateUserSession) updateUserSession(res.data);
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
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
        <div className="max-w-3xl w-full flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
            >
              Account Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'security' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'preferences' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-black/5'}`}
            >
              Preferences
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm h-fit">
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {message.text}
              </div>
            )}
            
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-11 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-11 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Life Stage</label>
                      <select
                        name="lifeStage"
                        value={formData.lifeStage}
                        onChange={handleChange}
                        className="w-full h-11 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                      >
                        <option value="Working Professional">Working Professional</option>
                        <option value="Student">Student</option>
                        <option value="Parent">Parent</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Retired">Retired</option>
                      </select>
                      <p className="text-[10px] font-semibold text-muted-foreground mt-1">Used for AI habit and schedule suggestions.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-border mt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 px-6 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    <SaveIcon />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter a new password"
                        className="w-full h-11 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-border mt-6">
                  <button
                    type="submit"
                    disabled={isSaving || !formData.password}
                    className="h-11 px-6 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    <SaveIcon />
                    {isSaving ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <div className="flex flex-col items-center justify-center text-center py-16 opacity-60 bg-background rounded-xl border border-dashed border-border">
                <p className="text-sm font-semibold mt-2 px-4">Notification & Theme preferences coming soon.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
