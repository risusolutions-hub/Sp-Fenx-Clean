import React, { useMemo } from 'react';
import { Activity, User, Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ActivityFeed({ complaints = [], users = [] }) {
  // Generate activity log from complaints
  const activities = useMemo(() => {
    const events = [];

    complaints.forEach(complaint => {
      // Complaint created
      if (complaint.createdAt) {
        events.push({
          type: 'complaint_created',
          timestamp: complaint.createdAt,
          icon: Ticket,
          color: 'blue',
          user: 'System',
          description: `Complaint #${complaint.displayId || complaint.id} created`,
          details: complaint.problem?.substring(0, 80),
          severity: 'info'
        });
      }

      // Complaint assigned
      if (complaint.assignedAt && complaint.engineer) {
        events.push({
          type: 'complaint_assigned',
          timestamp: complaint.assignedAt,
          icon: User,
          color: 'purple',
          user: 'System',
          description: `Assigned to ${complaint.engineer.name}`,
          details: `Complaint #${complaint.displayId || complaint.id}`,
          severity: 'info'
        });
      }

      // Work started
      if (complaint.checkInTime && complaint.status === 'in_progress') {
        events.push({
          type: 'work_started',
          timestamp: complaint.checkInTime,
          icon: Clock,
          color: 'amber',
          user: complaint.engineer?.name || 'Engineer',
          description: 'Started working on complaint',
          details: `Complaint #${complaint.displayId || complaint.id}`,
          severity: 'info'
        });
      }

      // Complaint resolved
      if (complaint.resolvedAt && (complaint.status === 'resolved' || complaint.status === 'closed')) {
        events.push({
          type: 'complaint_resolved',
          timestamp: complaint.resolvedAt,
          icon: CheckCircle,
          color: 'emerald',
          user: complaint.engineer?.name || 'Engineer',
          description: 'Complaint resolved',
          details: `${complaint.solutionNotes?.substring(0, 60) || 'Service completed'}`,
          severity: 'success'
        });
      }
    });

    // Sort by most recent first
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [complaints]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getColorClasses = (color, severity) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      amber: 'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700'
    };

    const borderMap = {
      info: 'border-l-4 border-slate-300',
      success: 'border-l-4 border-emerald-300',
      warning: 'border-l-4 border-amber-300',
      error: 'border-l-4 border-rose-300'
    };

    return `${colorMap[color] || colorMap.blue} ${borderMap[severity] || borderMap.info}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Timeline
        </h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
          {activities.length} events
        </span>
      </div>

      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.slice(0, 50).map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg bg-white border ${getColorClasses(
                  activity.color,
                  activity.severity
                )} transition-all hover:shadow-sm`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`p-2 rounded-lg ${getColorClasses(activity.color, activity.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {activity.description}
                        </p>
                        {activity.details && (
                          <p className="text-xs text-slate-600 mt-1">{activity.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {activity.user}
                      </span>
                      <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-50 rounded">
                        {activity.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
            <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No activities recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
