import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, LogOut, Zap, Plus } from 'lucide-react';

export default function EngineerAnalyticsView({ users, appState, setModal, user }) {
  const engineers = appState.engineers || [];
  const allUsers = users || [];
  const [liveActiveTime, setLiveActiveTime] = useState({});

  // Get detailed engineer info including check-in status
  const engineerStats = engineers.map(eng => {
    const userDetails = allUsers.find(u => u.id === eng.id || String(u.id) === String(eng.id));
    const baseActiveTime = userDetails?.activeTime || 0;
    const isCheckedIn = userDetails?.isCheckedIn || false;
    
    // Use live-updated time if available, otherwise use base
    const displayActiveTime = liveActiveTime[eng.id] !== undefined ? liveActiveTime[eng.id] : baseActiveTime;
    
    return {
      ...eng,
      ...userDetails,
      isCheckedIn,
      activeTime: displayActiveTime,
      baseActiveTime,
      lastCheckIn: userDetails?.lastCheckIn,
      lastCheckOut: userDetails?.lastCheckOut
    };
  });

  // Live timer for checked-in engineers
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActiveTime(prev => {
        const updated = { ...prev };
        engineerStats.forEach(engineer => {
          if (engineer.isCheckedIn && engineer.lastCheckIn) {
            const checkInTime = new Date(engineer.lastCheckIn).getTime();
            const now = new Date().getTime();
            const elapsedMinutes = Math.floor((now - checkInTime) / 60000);
            updated[engineer.id] = engineer.baseActiveTime + elapsedMinutes;
          }
        });
        return updated;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [engineerStats]);

  const checkedInEngineers = engineerStats.filter(e => e.isCheckedIn);
  const checkedOutEngineers = engineerStats.filter(e => !e.isCheckedIn);

  const totalActiveTimeCheckedIn = checkedInEngineers.reduce((sum, e) => sum + (e.activeTime || 0), 0);
  const avgActiveTimeCheckedIn = checkedInEngineers.length > 0 
    ? Math.floor(totalActiveTimeCheckedIn / checkedInEngineers.length) 
    : 0;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Engineer Status & Analytics</h2>
          <p className="text-sm text-slate-500">Real-time attendance and activity monitoring</p>
        </div>
        <div className="flex gap-2 items-center">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Updates
            </span>
            {(user?.role !== 'engineer') && (
              <button 
                onClick={() => setModal('complaint')} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors shadow-sm"
                title="Create New Ticket"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Engineers</p>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{engineers.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active in system</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked In</p>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{checkedInEngineers.length}</p>
          <p className="text-xs text-slate-500 mt-1">Working now</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked Out</p>
            <LogOut className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{checkedOutEngineers.length}</p>
          <p className="text-xs text-slate-500 mt-1">Off duty</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Active Time</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatTime(avgActiveTimeCheckedIn)}</p>
          <p className="text-xs text-slate-500 mt-1">For checked-in staff</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Checked In */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50/30 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Active Staff
            </h3>
            <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
               {checkedInEngineers.length}
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold tracking-wider">Engineer</th>
                  <th className="px-6 py-3 font-semibold tracking-wider">Check In</th>
                  <th className="px-6 py-3 font-semibold tracking-wider text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checkedInEngineers.length > 0 ? (
                  checkedInEngineers.map(engineer => (
                    <tr key={engineer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{engineer.name}</div>
                        <div className="text-xs text-slate-400">{engineer.email}</div>
                      </td>
                      <td className="px-6 py-3 text-emerald-700 font-medium whitespace-nowrap">
                        {formatDateTime(engineer.lastCheckIn)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-700 font-medium">
                        {formatTime(engineer.activeTime || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic">
                      No engineers currently checked in
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checked Out Engineers */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
              <LogOut className="w-4 h-4 text-slate-400" />
              Off Duty Staff
            </h3>
            <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
               {checkedOutEngineers.length}
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold tracking-wider">Engineer</th>
                  <th className="px-6 py-3 font-semibold tracking-wider">Last Out</th>
                  <th className="px-6 py-3 font-semibold tracking-wider text-right">Today's Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checkedOutEngineers.length > 0 ? (
                  checkedOutEngineers.map(engineer => (
                    <tr key={engineer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{engineer.name}</div>
                        <div className="text-xs text-slate-400">{engineer.email}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 font-medium whitespace-nowrap">
                        {formatDateTime(engineer.lastCheckOut)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-700 font-medium">
                        {formatTime(engineer.activeTime || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic">
                      All engineers are currently active!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
