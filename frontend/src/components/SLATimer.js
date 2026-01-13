import React, { useMemo, useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function SLATimer({ complaint = null, slaDurationHours = 24 }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const slaStatus = useMemo(() => {
    if (!complaint || !complaint.createdAt) {
      return { status: 'invalid', percentComplete: 0, timeRemaining: '-' };
    }

    const createdTime = new Date(complaint.createdAt);
    const slaDuration = slaDurationHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const slaDeadline = new Date(createdTime.getTime() + slaDuration);
    const elapsedTime = currentTime - createdTime;
    const percentComplete = Math.min((elapsedTime / slaDuration) * 100, 100);
    const timeRemaining = slaDeadline - currentTime;

    let status = 'ok';
    let statusLabel = 'On Track';

    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      status = 'resolved';
      statusLabel = 'Resolved';
    } else if (timeRemaining <= 0) {
      status = 'overdue';
      statusLabel = 'SLA Breached';
    } else if (timeRemaining <= 60 * 60 * 1000) {
      // Less than 1 hour remaining
      status = 'critical';
      statusLabel = 'Critical';
    } else if (timeRemaining <= 4 * 60 * 60 * 1000) {
      // Less than 4 hours remaining
      status = 'warning';
      statusLabel = 'Warning';
    }

    const formatTime = (ms) => {
      if (ms < 0) return 'Overdue';
      const totalMinutes = Math.floor(ms / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0) return `${minutes}m`;
      return `${hours}h ${minutes}m`;
    };

    return {
      status,
      statusLabel,
      percentComplete,
      timeRemaining: formatTime(Math.abs(timeRemaining)),
      deadline: slaDeadline.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }, [complaint, currentTime, slaDurationHours]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'text-emerald-600';
      case 'warning':
        return 'text-amber-600';
      case 'critical':
        return 'text-rose-600';
      case 'overdue':
        return 'text-rose-700';
      case 'resolved':
        return 'text-slate-600';
      default:
        return 'text-slate-600';
    }
  };

  const getBgColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-emerald-50';
      case 'warning':
        return 'bg-amber-50';
      case 'critical':
        return 'bg-rose-50';
      case 'overdue':
        return 'bg-rose-100';
      case 'resolved':
        return 'bg-slate-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-emerald-600';
      case 'warning':
        return 'bg-amber-600';
      case 'critical':
        return 'bg-rose-600';
      case 'overdue':
        return 'bg-rose-700';
      case 'resolved':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!complaint) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-slate-200 p-4 ${getBgColor(slaStatus.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${getStatusColor(slaStatus.status)}`}>
            {getIcon(slaStatus.status)}
          </span>
          <span className={`text-sm font-bold ${getStatusColor(slaStatus.status)}`}>
            {slaStatus.statusLabel}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-600">
          {slaStatus.timeRemaining}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor(slaStatus.status)}`}
            style={{ width: `${slaStatus.percentComplete}%` }}
          ></div>
        </div>
      </div>

      {/* Deadline Info */}
      <div className="text-xs text-slate-600">
        <p>Deadline: <span className="font-medium">{slaStatus.deadline}</span></p>
        <p className="text-slate-500 mt-1">
          {slaStatus.percentComplete.toFixed(0)}% of SLA time used
        </p>
      </div>
    </div>
  );
}

// Enhanced table cell version for complaints list
export function SLABadge({ complaint = null, slaDurationHours = 24 }) {
  const slaStatus = useMemo(() => {
    if (!complaint || !complaint.createdAt) return { status: 'invalid' };

    const createdTime = new Date(complaint.createdAt);
    const slaDuration = slaDurationHours * 60 * 60 * 1000;
    const slaDeadline = new Date(createdTime.getTime() + slaDuration);
    const timeRemaining = slaDeadline - new Date();

    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      return { status: 'resolved' };
    } else if (timeRemaining <= 0) {
      return { status: 'overdue' };
    } else if (timeRemaining <= 60 * 60 * 1000) {
      return { status: 'critical' };
    } else if (timeRemaining <= 4 * 60 * 60 * 1000) {
      return { status: 'warning' };
    }

    return { status: 'ok' };
  }, [complaint, slaDurationHours]);

  const colors = {
    ok: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    critical: 'bg-rose-100 text-rose-700 border border-rose-200',
    overdue: 'bg-rose-200 text-rose-800 border border-rose-300',
    resolved: 'bg-slate-100 text-slate-700 border border-slate-200',
    invalid: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  const labels = {
    ok: 'On Track',
    warning: 'Warning',
    critical: 'Critical',
    overdue: 'Overdue',
    resolved: 'Resolved',
    invalid: 'N/A'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[slaStatus.status]}`}>
      {labels[slaStatus.status]}
    </span>
  );
}
