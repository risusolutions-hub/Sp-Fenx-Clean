import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, CheckCircle, Phone, Mail, Award, Briefcase } from 'lucide-react';
import api from '../../api';
import EngineerTimelineDetail from './EngineerTimelineDetail';

export default function EngineerDashboardView({ user, setModal }) {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [engineerDetails, setEngineerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all engineers on mount
  useEffect(() => {
    loadEngineers();
  }, []);

  const loadEngineers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users/engineers/all');
      setEngineers(res.data.engineers || []);
    } catch (err) {
      console.error('Error loading engineers:', err);
      setError('Failed to load engineers');
    } finally {
      setLoading(false);
    }
  };

  const loadEngineerDetails = async (engineerId) => {
    try {
      setDetailsLoading(true);
      const res = await api.get(`/users/engineers/${engineerId}`);
      setEngineerDetails(res.data);
    } catch (err) {
      console.error('Error loading engineer details:', err);
      setError('Failed to load engineer details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEngineerClick = (engineer) => {
    console.log('Engineer clicked:', engineer);
    setSelectedEngineer(engineer);
    loadEngineerDetails(engineer.id);
  };

  const closeDetails = () => {
    setSelectedEngineer(null);
    setEngineerDetails(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'checked_in':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'free':
        return <CheckCircle className="w-4 h-4" />;
      case 'busy':
        return <Clock className="w-4 h-4" />;
      case 'checked_in':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateWorkHours = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading engineers...</p>
        </div>
      </div>
    );
  }

  if (error && !engineers.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-red-900 font-semibold mb-2">{error}</h3>
        <button
          onClick={loadEngineers}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Engineers
          </h1>
          <p className="text-slate-600 mt-1">{engineers.length} active engineers</p>
        </div>
        <button
          onClick={loadEngineers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Engineers Grid */}
      {engineers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No active engineers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {engineers.map((engineer) => (
            <div
              key={engineer.id}
              onClick={() => handleEngineerClick(engineer)}
              className="text-left bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition p-4 cursor-pointer"
            >
              {/* Engineer Avatar & Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {engineer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{engineer.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{engineer.email}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium mb-3 ${getStatusColor(engineer.status)}`}>
                {getStatusIcon(engineer.status)}
                <span className="capitalize">{engineer.status || 'unknown'}</span>
              </div>

              {/* Active Tickets Count */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{engineer.activeTicketsCount} active</span>
              </div>

              {/* Check-in Status */}
              <div className="space-y-2 text-xs text-slate-600 mb-3 pb-3 border-t border-slate-200">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Check-in:</span>
                  <span className={engineer.isCheckedIn ? 'text-green-600 font-medium' : 'text-slate-600'}>
                    {engineer.isCheckedIn ? 'Active' : 'Offline'}
                  </span>
                </div>
                {engineer.lastCheckIn && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last:</span>
                    <span className="font-medium">{formatTime(engineer.lastCheckIn)}</span>
                  </div>
                )}
              </div>

              {/* Current Work Badge */}
              {engineer.currentTicket && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                  <p className="font-semibold text-blue-900 mb-1">Currently Working</p>
                  <p className="text-blue-700 line-clamp-2">{engineer.currentTicket.complaintId}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Engineer Details Modal/Panel */}
      {selectedEngineer && (
        <EngineerTimelineDetail
          engineer={selectedEngineer}
          onClose={closeDetails}
        />
      )}
    </div>
  );
}
