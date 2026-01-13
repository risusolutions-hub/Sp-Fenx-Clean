import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, RefreshCw, AlertCircle, Trash2, Clock, MapPin, Monitor,
  Globe, Shield, CheckCircle2, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../api';

/**
 * SessionManagement - Professional session control panel
 * Shows all active sessions grouped by user with device details
 * @version 1.0.0
 */
export default function SessionManagement({ showToast }) {
  const [sessions, setSessionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, multi-device

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/sessions');
      if (res.data.success) {
        setSessionsData(res.data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast?.('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Delete a specific session
  const deleteSession = async (sessionId, userName) => {
    if (!window.confirm(`Delete this session for ${userName}?\nThis will log them out from this device.`)) {
      return;
    }

    setDeleting(sessionId);
    try {
      const res = await api.delete(`/system/session/${sessionId}`);
      if (res.data.success) {
        showToast?.('Session deleted successfully', 'success');
        fetchSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast?.('Failed to delete session', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // Delete all sessions for a user
  const deleteAllUserSessions = async (userId, userName) => {
    if (!window.confirm(`Delete ALL sessions for ${userName}?\nThis will log them out from all devices.`)) {
      return;
    }

    setDeleting(`user-${userId}`);
    try {
      const res = await api.delete(`/system/sessions/${userId}`);
      if (res.data.success) {
        showToast?.('All user sessions terminated', 'success');
        fetchSessions();
      }
    } catch (error) {
      console.error('Error deleting user sessions:', error);
      showToast?.('Failed to terminate sessions', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // Toggle user expansion
  const toggleUser = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Format date and time
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate time since last seen
  const getTimeSince = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Get status badge
  const getStatusBadge = (isActive, lastSeenAt) => {
    if (isActive) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Active Now</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
          {getTimeSince(lastSeenAt)}
        </span>
      </div>
    );
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-orange-100 text-orange-800',
      manager: 'bg-blue-100 text-blue-800',
      engineer: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Get user status badge
  const getUserStatusBadge = (status) => {
    return status === 'active' ? (
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="text-xs font-medium text-green-600">Active</span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="text-xs font-medium text-red-600">Blocked</span>
      </div>
    );
  };

  // Apply filters
  const filteredSessions = sessions.filter(user => {
    if (filter === 'active') {
      return user.sessions.some(s => s.isActive);
    }
    if (filter === 'multi-device') {
      return user.sessionCount > 1;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeCount = sessions.reduce((sum, user) => sum + user.sessions.filter(s => s.isActive).length, 0);
  const totalCount = sessions.reduce((sum, user) => sum + user.sessionCount, 0);
  const multiDeviceCount = sessions.filter(u => u.sessionCount > 1).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Active Now</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Multi-Device</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{multiDeviceCount}</p>
            </div>
            <Monitor className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 border rounded-xl p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Sessions', count: sessions.length },
            { id: 'active', label: 'Active', count: sessions.filter(u => u.sessions.some(s => s.isActive)).length },
            { id: 'multi-device', label: 'Multi-Device', count: multiDeviceCount }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {f.label} <span className="ml-1 font-semibold">({f.count})</span>
            </button>
          ))}
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No sessions found</p>
            <p className="text-sm text-gray-500 mt-1">All active users will appear here</p>
          </div>
        ) : (
          filteredSessions.map(user => (
            <div
              key={user.userId}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* User Header */}
              <div
                onClick={() => toggleUser(user.userId)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between border-b"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      {getUserStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {formatDateTime(user.lastLoginAt)}
                    </p>
                  </div>
                </div>

                {/* Session Count & Toggle */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{user.sessionCount}</div>
                    <div className="text-xs text-gray-500">
                      {user.sessionCount === 1 ? 'session' : 'sessions'}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                    {expandedUsers[user.userId] ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sessions Details - Expanded */}
              {expandedUsers[user.userId] && (
                <div className="divide-y bg-gray-50">
                  {user.sessions.map(session => (
                    <div key={session.id} className="p-4 hover:bg-white transition">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                        {/* Status and Time */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                            {getStatusBadge(session.isActive, session.lastSeenAt)}
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {formatDateTime(session.lastSeenAt || session.createdAt)}
                              </p>
                              <p className="text-xs text-gray-500">Last activity</p>
                            </div>
                          </div>
                        </div>

                        {/* Network Info */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 font-mono text-xs">
                                {session.ipAddress || 'N/A'}
                                {session.ipIsPrivate && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded inline">
                                    Private
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">IP Address</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Device Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-white rounded-lg p-3 border">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Device</p>
                          <p className="text-sm font-medium text-gray-900 break-words">{session.device || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Browser</p>
                          <p className="text-sm font-medium text-gray-900 break-words">{session.browser || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">OS</p>
                          <p className="text-sm font-medium text-gray-900 break-words">{session.os || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Session ID</p>
                          <p className="text-xs font-mono text-gray-600 truncate">{session.sessionId.substring(0, 8)}...</p>
                        </div>
                      </div>

                      {/* User Agent */}
                      {session.userAgent && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">User Agent</p>
                          <p className="text-xs text-gray-600 font-mono bg-gray-200 p-2 rounded break-all">
                            {session.userAgent}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => deleteSession(session.id, user.name)}
                        disabled={deleting === session.id}
                        className="w-full mt-3 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting === session.id ? 'Deleting...' : 'Delete This Session'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer with Bulk Action */}
              {expandedUsers[user.userId] && (
                <div className="bg-gray-100 border-t p-3 flex justify-end">
                  <button
                    onClick={() => deleteAllUserSessions(user.userId, user.name)}
                    disabled={deleting === `user-${user.userId}`}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting === `user-${user.userId}` ? 'Terminating...' : 'Terminate All Sessions'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Session Management</p>
          <p className="text-sm text-blue-800 mt-1">
            Delete individual sessions to log users out from specific devices. Use "Terminate All Sessions" to log them out from everywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
