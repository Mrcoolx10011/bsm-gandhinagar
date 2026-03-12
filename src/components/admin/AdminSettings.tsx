import React, { useState, useEffect, useCallback } from 'react';
import { Save, User, Lock, Bell, Shield, Database, Download, RefreshCw, Trash2, RotateCcw, PlusCircle, KeyRound, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const login = useAuthStore(state => state.login);
  const { apiCall } = useApi();

  const [activeTab, setActiveTab] = useState('profile');

  // Backup state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    setBackupsLoading(true);
    const result = await apiCall('consolidated?endpoint=backup', { requiresAuth: true, showToast: false });
    if (result.data) setBackups(Array.isArray(result.data) ? result.data : []);
    setBackupsLoading(false);
  }, [apiCall]);

  useEffect(() => { if (activeTab === 'data') loadBackups(); }, [activeTab]);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    const result = await apiCall('consolidated?endpoint=backup&action=create', { method: 'POST', requiresAuth: true, showToast: false });
    setCreatingBackup(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success('Backup created!');
    loadBackups();
  };

  const handleDownload = async (id: string, label: string) => {
    const result = await apiCall(`consolidated?endpoint=backup&action=download&id=${id}`, { requiresAuth: true, showToast: false });
    if (result.error) { toast.error(result.error); return; }
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `backup-${label.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleRestore = async (id: string) => {
    setIsRestoring(true);
    const result = await apiCall(`consolidated?endpoint=backup&action=restore&id=${id}`, { method: 'POST', requiresAuth: true, showToast: false });
    setIsRestoring(false);
    setRestoreConfirmId(null);
    if (result.error) { toast.error(result.error); return; }
    toast.success('Restore completed! A pre-restore snapshot was saved.');
    loadBackups();
  };

  const handleDeleteBackup = async (id: string) => {
    setDeletingId(id);
    await apiCall(`consolidated?endpoint=backup&action=delete&id=${id}`, { method: 'DELETE', requiresAuth: true, showToast: false });
    setDeletingId(null);
    loadBackups();
  };

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;
  const formatDate = (d: string) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const typeBadge: Record<string, string> = {
    auto: 'bg-blue-100 text-blue-700',
    manual: 'bg-green-100 text-green-700',
    'pre-restore': 'bg-yellow-100 text-yellow-800',
  };

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: false,
      sms: false
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  const handleSave = async () => {
    const result = await apiCall('consolidated?endpoint=admin-users&action=update-profile', {
      method: 'POST',
      body: { username: formData.username, email: formData.email },
      requiresAuth: true,
      showToast: false,
    });
    if (result.error) { toast.error(result.error); return; }
    localStorage.setItem('token', result.data.token);
    login(result.data.user);
    toast.success('Profile saved!');
  };

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [notificationKey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestOtp = async () => {
    if (!pwForm.currentPassword) { toast.error('Enter your current password first'); return; }
    if (!pwForm.newPassword || pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }

    setPwLoading(true);
    const result = await apiCall('consolidated?endpoint=admin-users&action=request-otp', {
      method: 'POST',
      body: { currentPassword: pwForm.currentPassword },
      requiresAuth: true,
      showToast: false,
    });
    setPwLoading(false);

    if (result.error) { toast.error(result.error); return; }
    toast.success('OTP sent to Slack! Check your Slack channel.');
    setOtpSent(true);
  };

  const handleChangePassword = async () => {
    if (!pwForm.otp) { toast.error('Enter the OTP from Slack'); return; }

    setPwLoading(true);
    const result = await apiCall('consolidated?endpoint=admin-users&action=change-password', {
      method: 'POST',
      body: { otp: pwForm.otp, newPassword: pwForm.newPassword },
      requiresAuth: true,
      showToast: false,
    });
    setPwLoading(false);

    if (result.error) { toast.error(result.error); return; }

    toast.success('Password updated! Logging you out...');
    setTimeout(() => logout(), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">An OTP will be sent to Slack to confirm the change. Your session will end after updating.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="password" name="currentPassword" value={pwForm.currentPassword}
                          onChange={handlePwChange} disabled={otpSent}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-gray-400 font-normal">(min 8 chars)</span></label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="password" name="newPassword" value={pwForm.newPassword}
                          onChange={handlePwChange} disabled={otpSent}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="password" name="confirmPassword" value={pwForm.confirmPassword}
                          onChange={handlePwChange} disabled={otpSent}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                    </div>

                    {!otpSent ? (
                      <div className="flex justify-end">
                        <button onClick={handleRequestOtp} disabled={pwLoading}
                          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-5 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>{pwLoading ? 'Sending OTP…' : 'Send OTP to Slack'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 space-y-4">
                        <p className="text-sm text-orange-800 font-medium">✅ OTP sent to Slack. Enter the 6-digit code below (valid 10 min).</p>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">OTP from Slack</label>
                          <input type="text" name="otp" value={pwForm.otp} onChange={handlePwChange}
                            maxLength={6} placeholder="123456"
                            className="w-40 px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-xl tracking-widest font-mono" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={handleChangePassword} disabled={pwLoading}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-5 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                            <Lock className="w-4 h-4" />
                            <span>{pwLoading ? 'Updating…' : 'Update Password & Log Out'}</span>
                          </button>
                          <button onClick={() => { setOtpSent(false); setPwForm(prev => ({ ...prev, otp: '' })); }}
                            className="text-sm text-gray-500 hover:text-gray-700 underline">
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.push"
                          checked={formData.notifications.push}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.sms"
                          checked={formData.notifications.sms}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Backups</h3>
                    <p className="text-sm text-gray-500">Auto-backup runs every 3 days on login. Keeps 3 most recent auto-backups.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={loadBackups} disabled={backupsLoading} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <RefreshCw className={`w-4 h-4 ${backupsLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleCreateBackup} disabled={creatingBackup}
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                      <PlusCircle className="w-4 h-4" />
                      <span>{creatingBackup ? 'Creating…' : 'Create Backup Now'}</span>
                    </button>
                  </div>
                </div>

                {backupsLoading && backups.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Loading backups…</div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    No backups yet. Click "Create Backup Now" to create your first one.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Label</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Date (IST)</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Size</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {backups.map((b: any) => (
                          <tr key={b._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{b.label}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[b.type] || 'bg-gray-100 text-gray-600'}`}>
                                {b.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                            <td className="px-4 py-3 text-gray-600">{formatBytes(b.sizeBytes || 0)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button onClick={() => handleDownload(b._id, b.label)}
                                  title="Download JSON"
                                  className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded">
                                  <Download className="w-4 h-4" />
                                </button>
                                <button onClick={() => setRestoreConfirmId(b._id)}
                                  title="Restore"
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteBackup(b._id)} disabled={deletingId === b._id}
                                  title="Delete backup"
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-40">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Restore confirmation */}
                {restoreConfirmId && (
                  <div className="border border-red-300 bg-red-50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-red-900">⚠️ Confirm Restore</p>
                    <p className="text-sm text-red-700">This will <strong>replace ALL live data</strong> (members, events, donations, posts, etc.) with the selected backup. Your current live data will be saved as a pre-restore safety snapshot first so you can undo.</p>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleRestore(restoreConfirmId)} disabled={isRestoring}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                        {isRestoring ? 'Restoring…' : 'Yes, Restore Now'}
                      </button>
                      <button onClick={() => setRestoreConfirmId(null)} className="text-sm text-gray-600 hover:text-gray-900 underline">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
                  <p className="font-semibold">What is backed up:</p>
                  <p className="text-blue-700">Members · Events · Event Registrations · Donations · Campaigns · Inquiries · Posts · Content · Admin Users</p>
                  <p className="font-semibold mt-2">Retention policy:</p>
                  <p className="text-blue-700">Auto-backups: max 3 kept (oldest deleted when 4th is created). Manual &amp; pre-restore snapshots: never auto-deleted.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

