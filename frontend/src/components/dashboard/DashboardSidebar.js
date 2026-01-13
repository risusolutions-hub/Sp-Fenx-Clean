import React from 'react';
import { Zap, Edit2, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, ENGINEER_NAV_ITEMS, SUPER_ADMIN_NAV_ITEMS } from '../../constants';
import { useSettings, NAV_TO_FEATURE } from '../../context/SettingsContext';

export default function DashboardSidebar({ user, currentView, setCurrentView, currentUser, onLogout, onCheckIn, onCheckOut, onEditName }) {
  const role = user?.role;
  const { isFeatureEnabled } = useSettings();
  
  // Get navigation items based on role
  const getNavItems = () => {
    if (role === 'engineer') return ENGINEER_NAV_ITEMS;
    if (role === 'superadmin') return [...ADMIN_NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS];
    return ADMIN_NAV_ITEMS;
  };
  
  // Filter nav items based on feature settings
  const navItems = getNavItems().filter(item => {
    // Settings always visible for superadmin
    if (item.id === 'settings') return true;

    // Check if this nav item has a feature flag
    const featureKey = NAV_TO_FEATURE[item.id] || item.featureFlag; // Include featureFlag from nav item
    if (featureKey) {
      return isFeatureEnabled(featureKey);
    }

    // No feature flag = always visible
    return true;
  });
  
  const location = useLocation();

  // Format work time display
  const formatWorkTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <aside className="sidebar-modern w-64 flex flex-col transition-all duration-500 relative overflow-hidden group">
      {/* Decorative Gradient Glows */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary-200/20 blur-[64px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary-200/20 blur-[64px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center gap-4 relative z-10 border-b border-primary-100/30">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
          <Zap className="text-white w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-neutral-800 text-base leading-tight tracking-tight truncate">Sparkel</h1>
          <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest truncate">Service Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
        {navItems.map(item => {
          const Icon = item.icon;
          const path = item.id === 'dashboard' ? '/' : `/${item.id}`;
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={item.id}
              to={path}
              end={path === '/'}
              onClick={() => setCurrentView && setCurrentView(item.id)}
              className={`w-full group/nav flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-semibold relative ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-100/50' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-primary-600 scale-110' : 'text-neutral-400 group-hover/nav:scale-110'}`} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User / Settings Profile Footer */}
      <div className="p-4 mt-auto relative z-10 border-t border-primary-100/30">
        <div className="bg-white/40 glass-backdrop p-3 rounded-2xl border border-white/60 shadow-sm group-hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-neutral-600 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-neutral-100 uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div 
                className="text-xs font-bold text-neutral-800 truncate cursor-pointer hover:text-primary-600 flex items-center gap-1.5 transition-colors"
                onClick={onEditName}
              >
                {user?.name || 'User'}
                <Edit2 className="w-3 h-3 text-neutral-400" />
              </div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{user?.role || 'Guest'}</div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg text-error-400 hover:text-error-600 hover:bg-error-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicators / Sub-stats */}
          {role === 'engineer' && currentUser && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-neutral-400 uppercase tracking-widest">Shift Progress</span>
                <span className="text-primary-600 font-mono">{formatWorkTime(currentUser.dailyTotalWorkTime || 0)}</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${Math.min(100, (currentUser.dailyTotalWorkTime || 0) / 4.8)}%` }}
                />
              </div>
              
              <button
                onClick={currentUser.isCheckedIn ? onCheckOut : onCheckIn}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest mt-2 transition-all duration-300 shadow-sm ${
                  currentUser.isCheckedIn 
                    ? 'bg-error-50 text-error-600 border border-error-100 hover:bg-error-100 active:scale-95' 
                    : 'bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100 active:scale-95'
                }`}
              >
                {currentUser.isCheckedIn ? 'End Shift' : 'Punch In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
