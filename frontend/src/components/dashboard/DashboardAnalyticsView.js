import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Plus } from 'lucide-react';

// Simple Chart Components (no external dependencies needed for MVP)
const PieChartSimple = ({ data, colors }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    return (
      <path
        key={idx}
        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={colors[idx % colors.length]}
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {slices}
    </svg>
  );
};

const BarChartSimple = ({ data, colors }) => {
  const max = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;

  return (
    <svg viewBox="0 0 400 200" className="w-full h-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((v, idx) => (
        <line
          key={`grid-${idx}`}
          x1="30"
          y1={200 - v * 150 - 20}
          x2="390"
          y2={200 - v * 150 - 20}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}

      {/* Bars */}
      {data.map((item, idx) => {
        const height = (item.value / max) * 150;
        const x = 35 + idx * ((360 / data.length) + 5);
        const y = 200 - height - 20;

        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={360 / data.length - 5}
              height={height}
              fill={colors[idx % colors.length]}
              rx="4"
            />
            <text
              x={x + (360 / data.length - 5) / 2}
              y="195"
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default function DashboardAnalytics({ complaints = [], users = [], setModal, user }) {
  // Helper function must be defined before useMemo
  const calculateAvgResolutionTime = (data) => {
    const resolved = data.filter(c => c.resolvedAt && c.createdAt);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, c) => {
      const diff = new Date(c.resolvedAt) - new Date(c.createdAt);
      return sum + diff;
    }, 0);
    const hours = Math.round(total / resolved.length / (1000 * 60 * 60));
    return hours;
  };

  const analytics = useMemo(() => {
    // Status breakdown
    const statusCounts = complaints.reduce((acc, c) => {
      const status = c.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Priority breakdown
    const priorityCounts = complaints.reduce((acc, c) => {
      const priority = c.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Engineer performance
    const engineerStats = users
      .filter(u => u.role === 'engineer')
      .map(engineer => {
        const resolvedCount = complaints.filter(
          c => c.assignedTo === String(engineer.id) && (c.status === 'resolved' || c.status === 'closed')
        ).length;
        return {
          name: engineer.name,
          resolved: resolvedCount,
          id: engineer.id
        };
      })
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 8);

    // Daily resolution rate (simulated last 7 days)
    const dailyResolutions = Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 6 - i;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = complaints.filter(c => {
        if (!c.resolvedAt) return false;
        const resolvedDate = new Date(c.resolvedAt).toLocaleDateString();
        const checkDate = date.toLocaleDateString();
        return resolvedDate === checkDate && (c.status === 'resolved' || c.status === 'closed');
      }).length;

      return { date: dayStr, value: count };
    });

    // SLA compliance (simulated: complaints resolved within 24 hours)
    const slaCompliant = complaints.filter(c => {
      if (!c.resolvedAt || !c.createdAt) return false;
      const diff = new Date(c.resolvedAt) - new Date(c.createdAt);
      return diff <= 24 * 60 * 60 * 1000; // 24 hours
    }).length;
    const slaCompliance = complaints.length > 0 ? ((slaCompliant / complaints.length) * 100).toFixed(1) : 0;

    return {
      statusCounts,
      priorityCounts,
      engineerStats,
      dailyResolutions,
      slaCompliance,
      totalComplaints: complaints.length,
      avgResolutionTime: calculateAvgResolutionTime(complaints)
    };
  }, [complaints, users]);

  const statusColors = {
    pending: '#f59e0b',
    assigned: '#3b82f6',
    in_progress: '#8b5cf6',
    resolved: '#10b981',
    closed: '#6b7280'
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444'
  };

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const statusData = Object.entries(analytics.statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: statusColors[status]
  }));

  const priorityData = Object.entries(analytics.priorityCounts).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: priorityColors[priority]
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Analytics & Insights</h2>
          <p className="text-sm text-neutral-600">Real-time service metrics and performance tracking</p>
        </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-neutral-600 uppercase mb-2">Total Tickets</p>
          <p className="text-3xl font-bold text-neutral-900">{analytics.totalComplaints}</p>
          <p className="text-xs text-neutral-600 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-neutral-600 uppercase mb-2">SLA Compliance</p>
          <p className="text-3xl font-bold text-emerald-600">{analytics.slaCompliance}%</p>
          <p className="text-xs text-neutral-600 mt-2">Within 24 hours</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-neutral-600 uppercase mb-2">Avg Resolution</p>
          <p className="text-3xl font-bold text-neutral-900">{analytics.avgResolutionTime}h</p>
          <p className="text-xs text-neutral-600 mt-2">Average hours</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-neutral-600 uppercase mb-2">Open Tickets</p>
          <p className="text-3xl font-bold text-amber-600">
            {(analytics.statusCounts.pending || 0) + (analytics.statusCounts.assigned || 0) + (analytics.statusCounts.in_progress || 0)}
          </p>
          <p className="text-xs text-neutral-600 mt-2">Awaiting resolution</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Ticket Status Distribution
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <PieChartSimple
                data={statusData}
                colors={statusData.map(d => d.color)}
              />
            </div>
            <div className="space-y-2 flex-1">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-neutral-800">{item.name}</span>
                  </div>
                  <span className="font-bold text-neutral-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Priority Breakdown
          </h3>
          <div className="h-40">
            <BarChartSimple
              data={priorityData}
              colors={priorityData.map(d => d.color)}
            />
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            {priorityData.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="font-bold text-neutral-900">{item.value}</div>
                <div className="text-neutral-600">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Resolution Trend */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Resolution Trend (Last 7 Days)
        </h3>
        <div className="h-40 flex items-end gap-2">
          {analytics.dailyResolutions.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-600 rounded-t" style={{ height: `${Math.max(day.value * 20, 10)}px` }}></div>
              <span className="text-xs text-neutral-600 mt-2">{day.value}</span>
              <span className="text-xs font-medium text-neutral-800">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Engineers */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-900 mb-4">Top Performing Engineers</h3>
        <div className="space-y-2">
          {analytics.engineerStats.map((eng, idx) => (
            <div key={eng.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 text-sm">#{idx + 1}</span>
                <span className="font-medium text-slate-900">{eng.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-6 bg-slate-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
                    style={{
                      width: `${(eng.resolved / Math.max(...analytics.engineerStats.map(e => e.resolved), 1)) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="font-bold text-slate-900 text-sm min-w-10 text-right">{eng.resolved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
