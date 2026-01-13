import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '../../api';

export default function WorkHistoryView({ user }) {
  const [workHistory, setWorkHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadWorkHistory();
  }, [timeRange]);

  const loadWorkHistory = async () => {
    try {
      setLoading(true);
      // Calculate date range
      const now = new Date();
      const days = parseInt(timeRange);
      const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      const [historyRes, statsRes] = await Promise.all([
        api.get('/work-time/history', { 
          params: { 
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: now.toISOString().split('T')[0]
          }
        }),
        api.get('/work-time/stats', {
          params: {
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: now.toISOString().split('T')[0]
          }
        })
      ]);

      setWorkHistory(historyRes.data.records || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Error loading work history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading work history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['7', '30', '90'].map(days => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === days
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Last {days} Days
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Days</p>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalDays}</p>
            <p className="text-xs text-slate-500 mt-1">Days worked this period</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Hours</p>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalHours}h</p>
            <p className="text-xs text-slate-500 mt-1">{stats.totalMins}m total duration</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily Avg</p>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.avgHoursPerDay}h</p>
            <p className="text-xs text-slate-500 mt-1">{stats.avgMinsPerDay}m avg per day</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Peak Day</p>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatTime(stats.maxMinutesDay)}</p>
            <p className="text-xs text-slate-500 mt-1">Longest work day</p>
          </div>
        </div>
      )}

      {/* Work History Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
           <Calendar className="w-5 h-5 text-slate-500" />
           <h3 className="font-semibold text-slate-900">Daily Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 tracking-wider">Date</th>
                <th className="px-6 py-3 tracking-wider">First In</th>
                <th className="px-6 py-3 tracking-wider">Last Out</th>
                <th className="px-6 py-3 tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workHistory.length > 0 ? (
                workHistory.map((record, idx) => (
                  <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50'}>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {formatDate(record.workDate)}
                    </td>
                    <td className="px-6 py-3 text-emerald-700 font-medium">
                      {formatDateTime(record.firstCheckIn)}
                    </td>
                    <td className="px-6 py-3 text-red-700 font-medium">
                      {formatDateTime(record.lastCheckOut)}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {formatTime(record.totalWorkTimeMinutes)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    No work records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
