import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, Plus } from 'lucide-react';
import api from '../../api';

export default function LeaveManagementView({ leaves, user, onApprove, onReject, onRefresh, setModal }) {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (leaveId) => {
    setLoadingId(leaveId);
    try {
      const response = await api.post(`/leaves/${leaveId}/approve`, { 
        approvalNotes: approvalNotes 
      });
      setApprovalNotes('');
      setSelectedLeave(null);
      // Server should return updated leave with approved status
      onApprove(response.data);
      onRefresh();
    } catch (err) {
      alert('Error approving leave: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (leaveId) => {
    setLoadingId(leaveId);
    try {
      const response = await api.post(`/leaves/${leaveId}/reject`, { 
        approvalNotes: approvalNotes 
      });
      setApprovalNotes('');
      setSelectedLeave(null);
      // Server should return updated leave with rejected status
      onReject(response.data);
      onRefresh();
    } catch (err) {
      alert('Error rejecting leave: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved');
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected');

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium uppercase tracking-wide">Pending</span>;
      case 'approved':
        return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium uppercase tracking-wide">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-medium uppercase tracking-wide">Rejected</span>;
      default:
        return null;
    }
  };

  const LeaveTable = ({ tableLeaves, showActions }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 font-semibold tracking-wider">Engineer</th>
            <th className="px-6 py-3 font-semibold tracking-wider">Type</th>
            <th className="px-6 py-3 font-semibold tracking-wider">Period</th>
            <th className="px-6 py-3 font-semibold tracking-wider">Days</th>
            <th className="px-6 py-3 font-semibold tracking-wider">Reason</th>
            <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
            {showActions && <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableLeaves.length > 0 ? (
            tableLeaves.map(leave => (
              <tr key={leave.id} className="hover:bg-slate-50">
                <td className="px-6 py-3">
                  <div className="font-semibold text-slate-900">{leave.engineer?.name || 'N/A'}</div>
                  <div className="text-xs text-slate-400">{leave.engineer?.email}</div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-semibold text-slate-600 capitalize">{leave.leaveType}</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-slate-700">{formatDate(leave.startDate)}</span>
                    <span className="text-slate-400">to {formatDate(leave.endDate)}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-bold text-slate-900">{leave.numDays}</span>
                  <span className="text-xs text-slate-500 ml-1">days</span>
                </td>
                <td className="px-6 py-3 max-w-xs">
                  <p className="text-slate-600 truncate text-xs" title={leave.reason}>{leave.reason}</p>
                </td>
                <td className="px-6 py-3">
                  {statusBadge(leave.status)}
                </td>
                {showActions && (
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => setSelectedLeave(leave)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                    >
                      Review
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="px-6 py-8 text-center text-slate-400 italic">
                No leave requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500">Review and manage engineer time-off requests</p>
        </div>
        {setModal && (user?.role !== 'engineer') && (
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

      {/* Pending Leaves */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Requests
          </h3>
          <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
             {pendingLeaves.length}
          </span>
        </div>
        <LeaveTable tableLeaves={pendingLeaves} showActions={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved Leaves */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50/30 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Approved History
            </h3>
            <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
               {approvedLeaves.length}
            </span>
          </div>
          <LeaveTable tableLeaves={approvedLeaves} showActions={false} />
        </div>

        {/* Rejected Leaves */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-rose-50/30 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              Rejected History
            </h3>
            <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
               {rejectedLeaves.length}
            </span>
          </div>
          <LeaveTable tableLeaves={rejectedLeaves} showActions={false} />
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Review Leave Request</h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Engineer</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedLeave.engineer?.name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Leave Type</p>
                  <p className="font-bold text-slate-900 text-sm capitalize">{selectedLeave.leaveType}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Requested Period</p>
                <div className="flex justify-between items-end">
                  <p className="font-bold text-slate-900 text-sm">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </p>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {selectedLeave.numDays} Days
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Reason provided</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 italic">
                  "{selectedLeave.reason}"
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs text-slate-500 uppercase font-bold mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Reason for rejection or approval note..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedLeave(null);
                    setApprovalNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedLeave.id)}
                  disabled={loadingId === selectedLeave.id}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-sm font-semibold rounded-md transition-all shadow-sm"
                >
                  {loadingId === selectedLeave.id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedLeave.id)}
                  disabled={loadingId === selectedLeave.id}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-md transition-all shadow-sm"
                >
                  {loadingId === selectedLeave.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
