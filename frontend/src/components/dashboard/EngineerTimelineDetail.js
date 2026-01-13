import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, Briefcase, MapPin, User, Calendar,
  Zap, ChevronDown, ChevronUp, Phone, Mail, Award, TrendingUp
} from 'lucide-react';
import api from '../../api';

/**
 * EngineerTimelineDetail - Professional engineer work timeline and details
 * Displays comprehensive work history, current assignments, and detailed analytics
 */
export default function EngineerTimelineDetail({ engineer, onClose, showToast }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTickets, setExpandedTickets] = useState({});
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    loadEngineerDetails();
  }, [engineer.id]);

  const loadEngineerDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/engineers/${engineer.id}`);
      setDetails(res.data);
    } catch (err) {
      console.error('Error loading engineer details:', err);
      showToast?.('Failed to load engineer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'Ongoing';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const minutes = Math.floor((end - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const calculateWorkHours = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status) => {
    const colors = {
      free: 'bg-green-50 border-green-200 text-green-700',
      busy: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      checked_in: 'bg-blue-50 border-blue-200 text-blue-700',
      offline: 'bg-gray-50 border-gray-200 text-gray-700'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      free: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      busy: <Clock className="w-5 h-5 text-yellow-600" />,
      checked_in: <Zap className="w-5 h-5 text-blue-600" />,
      offline: <AlertCircle className="w-5 h-5 text-gray-600" />
    };
    return icons[status] || <AlertCircle className="w-5 h-5" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTicketStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-300',
      pending: 'bg-orange-100 text-orange-800 border-orange-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const toggleTicket = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const filterTickets = (tickets) => {
    if (!tickets) return [];
    if (filter === 'active') return tickets.filter(t => ['assigned', 'in_progress'].includes(t.status));
    if (filter === 'completed') return tickets.filter(t => ['resolved', 'closed'].includes(t.status));
    return tickets;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading engineer timeline...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-slate-600">Failed to load engineer details</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eng = details.engineer;
  const allTickets = [...(details.activeTickets || []), ...(details.completedTickets || [])];
  const filteredTickets = filterTickets(allTickets);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6 md:px-8 flex items-start justify-between sticky top-0 z-40">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur">
                {eng.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold">{eng.name}</h2>
                <p className="text-blue-100 mt-1">{eng.email}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(eng.status || 'offline')}`}>
                    {getStatusIcon(eng.status || 'offline')}
                    <span className="text-sm font-medium capitalize">{eng.status || 'Offline'}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${eng.isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {eng.isCheckedIn ? '✓ Checked In' : '✗ Checked Out'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition flex-shrink-0"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase">Total Work Time</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {calculateWorkHours(eng.dailyTotalWorkTime)}
                </p>
                <p className="text-xs text-blue-700 mt-1">Today</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-600 uppercase">Active Tickets</span>
                  <Briefcase className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{details.activeTicketsCount}</p>
                <p className="text-xs text-green-700 mt-1">Currently assigned</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-600 uppercase">Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">{details.completedTicketsCount}</p>
                <p className="text-xs text-purple-700 mt-1">All time</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-orange-600 uppercase">Skills</span>
                  <Award className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-900">{eng.skills?.length || 0}</p>
                <p className="text-xs text-orange-700 mt-1">Proficiencies</p>
              </div>
            </div>

            {/* Work Status Timeline */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Today's Work Timeline
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">First Check-in</p>
                    <p className="text-sm font-bold text-slate-900">
                      {eng.dailyFirstCheckIn ? formatTime(eng.dailyFirstCheckIn) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {eng.dailyFirstCheckIn ? formatDate(eng.dailyFirstCheckIn) : 'Not checked in'}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Last Check-out</p>
                    <p className="text-sm font-bold text-slate-900">
                      {eng.dailyLastCheckOut ? formatTime(eng.dailyLastCheckOut) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {eng.dailyLastCheckOut ? formatDate(eng.dailyLastCheckOut) : 'Not checked out'}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Current Duration</p>
                    <p className="text-sm font-bold text-slate-900">
                      {eng.isCheckedIn && eng.lastCheckIn ? calculateDuration(eng.lastCheckIn) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {eng.isCheckedIn ? 'Since ' + formatTime(eng.lastCheckIn) : 'Not currently working'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Assignments Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  Work Assignments
                </h3>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        filter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No {filter !== 'all' ? filter : ''} tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket, idx) => (
                    <div
                      key={ticket.id}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
                    >
                      {/* Ticket Header - Always Visible */}
                      <div
                        onClick={() => toggleTicket(ticket.id)}
                        className="p-4 cursor-pointer flex items-start justify-between"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {/* Timeline Connector */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              ['resolved', 'closed'].includes(ticket.status)
                                ? 'bg-green-500 border-green-300'
                                : 'bg-blue-500 border-blue-300'
                            }`} />
                            {idx < filteredTickets.length - 1 && (
                              <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                            )}
                          </div>

                          {/* Ticket Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg">{ticket.complaintId}</h4>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-1">{ticket.problem}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority?.toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getTicketStatusColor(ticket.status)}`}>
                                  {ticket.status?.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3">
                              {ticket.customer && (
                                <div className="text-slate-600">
                                  <span className="font-semibold">Customer:</span> {ticket.customer.name}
                                </div>
                              )}
                              {ticket.machine && (
                                <div className="text-slate-600">
                                  <span className="font-semibold">Machine:</span> {ticket.machine.model}
                                </div>
                              )}
                              <div className="text-slate-600">
                                <span className="font-semibold">Assigned:</span> {formatDate(ticket.createdAt)}
                              </div>
                              {ticket.checkInTime && (
                                <div className="text-slate-600">
                                  <span className="font-semibold">Work Time:</span> {calculateDuration(ticket.checkInTime, ticket.checkOutTime)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expand Icon */}
                          <button className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-1">
                            {expandedTickets[ticket.id] ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedTickets[ticket.id] && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                          {/* Description */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Issue Description</p>
                            <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded p-3">
                              {ticket.problem}
                            </p>
                          </div>

                          {/* Timeline Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded p-3">
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Created</p>
                              <p className="text-sm font-medium text-slate-900">{formatDateTime(ticket.createdAt)}</p>
                            </div>

                            {ticket.checkInTime && (
                              <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Work Started</p>
                                <p className="text-sm font-medium text-slate-900">{formatDateTime(ticket.checkInTime)}</p>
                              </div>
                            )}

                            {ticket.checkOutTime && (
                              <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Work Completed</p>
                                <p className="text-sm font-medium text-slate-900">{formatDateTime(ticket.checkOutTime)}</p>
                              </div>
                            )}

                            {ticket.checkInTime && (
                              <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Total Work Time</p>
                                <p className="text-sm font-medium text-slate-900">{calculateDuration(ticket.checkInTime, ticket.checkOutTime)}</p>
                              </div>
                            )}
                          </div>

                          {/* Customer & Machine Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ticket.customer && (
                              <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-2">
                                  <User className="w-4 h-4" /> Customer
                                </p>
                                <p className="text-sm font-medium text-slate-900">{ticket.customer.name}</p>
                                <p className="text-xs text-slate-600 mt-1">{ticket.customer.phone || 'N/A'}</p>
                              </div>
                            )}

                            {ticket.machine && (
                              <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4" /> Machine
                                </p>
                                <p className="text-sm font-medium text-slate-900">{ticket.machine.model}</p>
                                <p className="text-xs text-slate-600 mt-1">{ticket.machine.serialNumber || 'N/A'}</p>
                              </div>
                            )}
                          </div>

                          {/* Notes/Remarks */}
                          {ticket.remarks && (
                            <div className="bg-white border border-slate-200 rounded p-3">
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Notes</p>
                              <p className="text-sm text-slate-700">{ticket.remarks}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Section */}
            {eng.skills && eng.skills.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-slate-600" />
                  Skills & Proficiencies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {eng.skills.map((skill) => (
                    <div key={skill.id} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{skill.skillName}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                          skill.proficiencyLevel === 'expert' ? 'bg-purple-100 text-purple-700' :
                          skill.proficiencyLevel === 'advanced' ? 'bg-green-100 text-green-700' :
                          skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.proficiencyLevel?.toUpperCase()}
                        </span>
                      </div>
                      {skill.yearsOfExperience && (
                        <p className="text-xs text-slate-600 mb-2">
                          {skill.yearsOfExperience} year{skill.yearsOfExperience > 1 ? 's' : ''} experience
                        </p>
                      )}
                      {skill.verifiedAt && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 md:px-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
