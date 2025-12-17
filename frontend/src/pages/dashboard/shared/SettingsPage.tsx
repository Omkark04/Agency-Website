// components/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Settings as SettingsIcon, 
  Calendar as CalendarIcon, 
  Clock, 
  Shield, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';
import { changePassword, changeEmail } from '../../../api/auth';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    password: '',
    new_email: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage({ type: 'error', text: "New passwords don't match" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await changePassword(passwordForm);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.old_password?.[0] || 
              error.response?.data?.new_password?.[0] || 
              'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await changeEmail(emailForm);
      setMessage({ type: 'success', text: 'Email updated successfully. Please check your new email for verification if verified.' }); // Note: Simplified outcome
      setEmailForm({ password: '', new_email: '' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.password?.[0] || 
              error.response?.data?.new_email?.[0] || 
              'Failed to update email' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8 bg-gradient-to-br from-purple-50 via-white to-purple-100/50">
      {/* Header Section with Clock & Date */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-500">Manage your account security and preferences</p>
        </div>

        {/* Futuristic Clock Widget - Light Theme */}
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-purple-500/5">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Date</div>
              <div className="font-mono font-semibold text-gray-900">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-purple-500/5">
             <div className="p-2 bg-indigo-50 rounded-lg">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Time</div>
              <div className="font-mono font-semibold text-gray-900 w-20">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {['security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 font-medium ${
                activeTab === tab 
                  ? 'bg-white shadow-md text-purple-600 border border-purple-100' 
                  : 'hover:bg-white/60 text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'security' && <Shield className={`h-5 w-5 ${activeTab === tab ? 'text-purple-600' : 'text-gray-400'}`} />}
              {tab === 'notifications' && <Bell className={`h-5 w-5 ${activeTab === tab ? 'text-purple-600' : 'text-gray-400'}`} />}
              {tab === 'appearance' && <SettingsIcon className={`h-5 w-5 ${activeTab === tab ? 'text-purple-600' : 'text-gray-400'}`} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {message && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                <p className="font-medium">{message.text}</p>
              </div>
            )}

            {activeTab === 'security' && (
              <>
                {/* Change Password Card */}
                <div className="bg-white border border-gray-100/50 rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-gray-200/40">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    Change Password
                  </h3>

                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md relative z-10">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.old ? "text" : "password"}
                          value={passwordForm.old_password}
                          onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter current password"
                        />
                        <button type="button" onClick={() => setShowPassword({...showPassword, old: !showPassword.old})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200/50 transition-colors">
                          {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter new password"
                        />
                        <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200/50 transition-colors">
                          {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordForm.new_password_confirm}
                          onChange={(e) => setPasswordForm({...passwordForm, new_password_confirm: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="Confirm new password"
                        />
                         <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200/50 transition-colors">
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Change Email Card */}
                <div className="bg-white border border-gray-100/50 rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-gray-200/40">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    Change Email Address
                  </h3>

                  <form onSubmit={handleEmailChange} className="space-y-5 max-w-md relative z-10">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={emailForm.new_email}
                          onChange={(e) => setEmailForm({...emailForm, new_email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="new@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm with Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="current-password"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 text-gray-500" />
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-lg shadow-gray-200/40">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Notification Preferences</h3>
                <p className="text-gray-500">Granular notification controls coming soon.</p>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-lg shadow-gray-200/40">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Appearance Settings</h3>
                <p className="text-gray-500">Theme customization options coming soon.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
