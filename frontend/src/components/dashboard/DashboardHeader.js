import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, FileText, ChevronDown } from 'lucide-react';
import NotificationCenter from '../NotificationCenter';

export default function DashboardHeader({ currentView, onNewComplaint, onRequestLeave, user, notifications = [], onDismissNotification = () => {}, onClearNotifications = () => {} }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const viewTitles = {
    dashboard: 'Dashboard',
    complaints: 'Active Incident Monitor',
    customers: 'Account Directory',
    team: 'Team Management',
    history: 'Service History',
    'work-history': 'Work Time History & Analytics',
    'engineer-analytics': 'Engineer Status & Analytics',
    leaves: user?.role === 'engineer' ? 'My Leave Requests' : 'Leave Management',
    activity: 'Activity Log',
    engineers: 'Engineers',
    messages: 'Team Chat',
    skills: 'Skills Management',
    'my-skills': 'My Skills',
    analytics: 'Analytics',
    settings: 'Settings',
    checklists: 'Service Checklists',
    customize: 'Customize Dashboard'
  };

  const unreadCount = notifications.length;

  const handleDismissNotification = (index) => {
    onDismissNotification(index);
  };

  const handleClearAll = () => {
    onClearNotifications();
  };

  return (
    <header className="header-modern h-20 flex items-center justify-between px-8 z-20 sticky top-0">
      {/* Decorative Blur */}
      <div className="absolute inset-0 bg-white/60 glass-backdrop -z-10" />

      {/* Left Section - Page Title */}
      <div className="flex items-center gap-4 relative">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary-50 items-center justify-center text-primary-600 border border-primary-100/50">
          <FileText className="w-5 h-5 opacity-80" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em]">Platform</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{user?.role || 'Guest'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-neutral-800 tracking-tight">{viewTitles[currentView] || 'Dashboard'}</h2>
        </div>
      </div>
      
      {/* Right Section - Actions & Notifications */}
      <div className="flex items-center gap-5">
        {/* Status Badge */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-success-50/50 rounded-full border border-success-100/50 transition-all hover:bg-success-50 cursor-default">
          <div className="relative">
            <span className="block w-2 h-2 rounded-full bg-success-500 animate-pulse-slow"></span>
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-success-500 animate-ping opacity-75"></span>
          </div>
          <span className="text-[10px] font-bold text-success-700 uppercase tracking-widest">Live System</span>
        </div>
        
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl transition-all relative ${
              showNotifications 
                ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 border border-transparent'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute 0.5 right-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-primary-100 animate-bounce-slow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white/95 glass-backdrop rounded-2xl shadow-2xl border border-white/60 p-1 z-50 animate-slide-up origin-top-right">
              <NotificationCenter 
                notifications={notifications}
                onDismiss={handleDismissNotification}
                onClear={handleClearAll}
                compact={true}
                open={showNotifications}
                onToggle={() => setShowNotifications(!showNotifications)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200/60">
          <button
            onClick={onNewComplaint}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-200/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{(user?.role === 'admin' || user?.role === 'superadmin') ? 'Log Ticket' : 'New Ticket'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
