import React from 'react';
import { AlertCircle, RefreshCcw, CheckCircle2, Cpu, ArrowRight, Zap, History, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import EngineersWidget from './EngineersWidget';

export default function DashboardOverview({ complaints, customers, machines, setCurrentView, setModal, user, engineers = [] }) {
  const counts = {
    new: complaints.filter(c => c.status === 'pending').length,
    active: complaints.filter(c => ['assigned', 'in_progress'].includes(c.status)).length,
    resolved: complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length,
    machines: machines.length
  };

  // Get recent tickets
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="fade-in space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full text-primary-300 text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary-500/30">
              <Zap size={12} />
              Operation Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, <span className="text-primary-400">{user?.name?.split(' ')[0] || 'User'}</span>.
            </h1>
            <p className="text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed">
              Your service network is currently operating at <span className="text-success-400 font-bold">98.4% efficiency</span>. 
              There are {counts.new} pending tickets requiring your attention today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setCurrentView('complaints')}
              className="bg-white text-neutral-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-100 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              View All Tickets
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              className="bg-neutral-800 text-white border border-neutral-700 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-700 transition-all active:scale-95"
            >
              <TrendingUp size={18} />
              Performance
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Open Tickets" 
          value={counts.new} 
          Icon={AlertCircle} 
          color="text-red-500" 
          bg="bg-red-50" 
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          label="Active Service" 
          value={counts.active} 
          Icon={RefreshCcw} 
          color="text-blue-500" 
          bg="bg-blue-50" 
          trend="down"
          trendValue="4%"
        />
        <StatCard 
          label="Resolved (30d)" 
          value={counts.resolved} 
          Icon={CheckCircle2} 
          color="text-emerald-500" 
          bg="bg-emerald-50" 
          trend="up"
          trendValue="24%"
        />
        <StatCard 
          label="Fleet Size" 
          value={counts.machines} 
          Icon={Cpu} 
          color="text-amber-500" 
          bg="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-primary-100/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
                <History size={20} />
              </div>
              <h3 className="font-bold text-neutral-800 tracking-tight">Recent Ticket Activity</h3>
            </div>
            <button 
              onClick={() => setCurrentView('complaints')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
            >
              View Full log
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Customer / Ticket</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {recentComplaints.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-800">{ticket.customerName || 'N/A'}</span>
                        <span className="text-[11px] text-neutral-500 font-medium">#{ticket.id} • {ticket.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-neutral-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engineers Side Widget */}
        <div className="space-y-6">
          <EngineersWidget 
            engineers={engineers} 
            setCurrentView={setCurrentView}
            compact={true}
          />

          {/* Productivity Mini-Card */}
          <div className="glass-card p-6 bg-gradient-to-br from-secondary-50 to-white overflow-hidden relative group">
            <TrendingUp size={100} className="absolute -bottom-4 -right-4 text-secondary-100 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-widest mb-1">Productivity Range</h4>
              <p className="text-2xl font-extrabold text-secondary-600 mb-4">+32% <span className="text-xs font-bold text-neutral-400 ml-1">THIS WEEK</span></p>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-500 w-[72%] rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
