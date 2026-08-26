/**
 * SettingsView Component
 * -----------------------------------------------------------
 * Fully functional System Settings exactly matching Frame 29.
 * Saves all preferences, handles account deletion, and data export.
 * -----------------------------------------------------------
 */
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SettingsView = () => {
  const { user, updateUserSession, logout } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    lifeStage: user?.lifeStage || 'Working Professional',
    oledMode: user?.preferences?.oledMode || 'Warm',
    defaultRoutine: user?.preferences?.defaultRoutine || 'Work Day Routine',
    startOfDay: user?.preferences?.startOfDay || '06:00 AM',
    quietHours: user?.preferences?.quietHours || '10:00 PM - 06:00 AM',
    password: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const payload = { 
        name: formData.name,
        email: formData.email,
        lifeStage: formData.lifeStage,
        preferences: {
          oledMode: formData.oledMode,
          defaultRoutine: formData.defaultRoutine,
          startOfDay: formData.startOfDay,
          quietHours: formData.quietHours
        }
      };

      if (formData.password) {
        payload.password = formData.password;
      }
      
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, payload, {
        headers: { 'x-auth-token': token }
      });
      
      if (updateUserSession) updateUserSession(res.data);
      setMessage({ type: 'success', text: 'Settings and preferences saved successfully!' });
      
      if (formData.oledMode === 'Warm') {
        document.documentElement.classList.remove('dark', 'oled-mode');
      } else if (formData.oledMode === 'Pure') {
        document.documentElement.classList.add('dark', 'oled-mode');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('oled-mode');
      }

      setFormData(prev => ({ ...prev, password: '' }));
      setShowPasswordInput(false);

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const [habitsRes, anchorsRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/habits`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/anchors`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/habits/logs`, { headers })
      ]);

      const exportData = {
        profile: user,
        habits: habitsRes.data,
        anchors: anchorsRes.data,
        logs: logsRes.data,
        exportDate: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `anchord_export_${new Date().getTime()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Export failed', err);
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This will erase all habits, anchors, and logs forever. This cannot be undone.")) {
      setIsDeleting(true);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { 'x-auth-token': token }
        });
        if (logout) logout();
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to delete account.' });
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="px-8 lg:px-16 py-12 max-w-[1100px] w-full mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <p className="text-[11px] font-extrabold text-primary tracking-widest uppercase mb-2">CONTROL ROOM</p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">System Settings</h1>
          <p className="text-[14px] text-muted-foreground font-medium">Configure your habits profiles, stage, notifications, and local security.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-[13px] font-bold flex items-center justify-between animate-in fade-in ${
            message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Card 1: Profile Details */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-8">Profile Details</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="shrink-0 flex justify-center md:justify-start">
              <div className="w-28 h-28 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden relative group shadow-inner">
                 <span className="text-4xl font-extrabold text-muted-foreground uppercase">{formData.name.charAt(0) || 'U'}</span>
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Upload</span>
                 </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground">Current Life Stage</label>
                <select
                  name="lifeStage"
                  value={formData.lifeStage}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="Working Professional">Working Professional</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: User Preferences */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-8">User Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground">Default Routine Selector</label>
              <select
                name="defaultRoutine"
                value={formData.defaultRoutine}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="Work Day Routine">Work Day Routine</option>
                <option value="Day Off Routine">Day Off Routine</option>
                <option value="Custom Routine">Custom Routine</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground">Start of Day Window</label>
              <input
                type="text"
                name="startOfDay"
                value={formData.startOfDay}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground">Quiet Hours Buffer</label>
              <input
                type="text"
                name="quietHours"
                value={formData.quietHours}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

          </div>
        </div>

        {/* Card 3: Account Security & Storage */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-8">Account Security & Storage</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button 
              onClick={() => setShowPasswordInput(!showPasswordInput)}
              className="flex-1 h-12 rounded-xl border border-border bg-background hover:bg-black/5 text-[14px] font-bold transition-colors"
            >
              Change Password
            </button>
            <button 
              onClick={handleExportData}
              disabled={isExporting}
              className="flex-1 h-12 rounded-xl border border-border bg-background hover:bg-black/5 text-[14px] font-bold transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export Local JSON Data'}
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-[14px] font-bold transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
          
          {showPasswordInput && (
             <div className="animate-in fade-in slide-in-from-top-4 mt-6 p-6 border border-border bg-background rounded-xl">
                <div className="space-y-2 w-full md:w-1/2">
                  <label className="text-[11px] font-bold text-muted-foreground">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a new secure password"
                    className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">Enter your new password above and click "Save All Changes" below to update it.</p>
                </div>
             </div>
          )}
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 mb-12">
          <button
             onClick={handleSave}
             disabled={isSaving}
             className="h-12 px-10 rounded-xl font-extrabold bg-primary hover:bg-primary-hover text-primary-foreground transition-all disabled:opacity-50 shadow-sm text-[14px]"
          >
             {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
