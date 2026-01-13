import React, { useState, useEffect } from 'react';
import { Calendar, Wrench, AlertCircle, TrendingDown, DollarSign, Clock, User, ChevronRight, Activity } from 'lucide-react';
import api from '../../api';

export default function MachineServiceHistory({ machineId }) {
  const [history, setHistory] = useState([]);
  const [frequentFailures, setFrequentFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (machineId) loadServiceHistory();
  }, [machineId]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/service-history/machines/${machineId}`);
      if (res.data.success) {
        setHistory(res.data.history || []);
        setFrequentFailures(res.data.frequentFailures || []);
      }
    } catch (error) {
      console.error('Error loading service history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(h => h.serviceType === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Retrieving Logbooks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Service Chronicle</h2>
          <p className="text-sm text-neutral-500 font-medium">Lifecycle telemetry and component replacement logs</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 border-neutral-100 bg-neutral-50/50">
             <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Events</p>
             <p className="text-lg font-black text-neutral-800">{history.length}</p>
          </div>
          <div className="glass-card px-4 py-2 border-neutral-100 bg-neutral-50/50">
             <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">MTBF Index</p>
             <p className="text-lg font-black text-primary-600">High</p>
          </div>
        </div>
      </div>

      {/* Frequent Failures Alert */}
      {frequentFailures.length > 0 && (
        <div className="glass-card border-error-100 bg-error-50/20 p-6 flex items-start gap-5 animate-pulse-slow">
          <div className="p-3 bg-error-500 rounded-2xl text-white shadow-lg shadow-error-200">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="font-black text-error-900 text-sm uppercase tracking-tight">Critical Component Fatigue</h3>
            <p className="text-xs text-error-700/80 mt-1 font-medium italic">
              Recurring failures detected in the following subsystems:
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {frequentFailures.map((failure, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/50 border border-error-100 text-error-700 text-[10px] font-black rounded-lg uppercase">
                  {failure.partName} ({failure.failureCount}x)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="flex items-center gap-2 p-1.5 glass-card bg-neutral-50/50 inline-flex overflow-x-auto max-w-full">
        {['all', 'corrective', 'preventive', 'maintenance', 'inspection'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === type
                ? 'bg-white text-primary-600 shadow-sm border border-primary-50'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-white/50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Modernized Timeline */}
      <div className="relative">
        {filteredHistory.length === 0 ? (
          <div className="glass-card border-dashed border-neutral-200 bg-neutral-50/30 p-20 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Activity size={32} className="text-neutral-300" />
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No matching logs found in registry</p>
          </div>
        ) : (
          <div className="space-y-10 pl-4 border-l-2 border-neutral-100 ml-4 py-4">
            {filteredHistory.map((service, idx) => (
              <div key={service.id} className="relative group">
                {/* Connector Dot */}
                <div className={`absolute -left-[29px] top-4 w-6 h-6 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 z-10 ${
                  service.serviceType === 'corrective' ? 'bg-error-500' :
                  service.serviceType === 'preventive' ? 'bg-success-500' :
                  'bg-primary-500'
                }`} />

                <div className="glass-card p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-2xl hover:shadow-neutral-200/50">
                   {/* Meta Sidebar */}
                   <div className="md:w-48 flex-shrink-0 space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Timeline</p>
                        <div className="flex items-center gap-2 text-xs font-black text-neutral-800">
                          <Calendar size={14} className="text-primary-500" />
                          {new Date(service.serviceDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Technician</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                          <User size={14} className="text-neutral-400" />
                          {service.engineer?.name || 'Automated System'}
                        </div>
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        service.serviceType === 'corrective' ? 'bg-error-50 text-error-600' :
                        service.serviceType === 'preventive' ? 'bg-success-50 text-success-600' :
                        'bg-primary-50 text-primary-600'
                      }`}>
                        {service.serviceType}
                      </div>
                   </div>

                   {/* Vertical Separator */}
                   <div className="hidden md:block w-px bg-neutral-100" />

                   {/* Main Log Entry */}
                   <div className="flex-1 space-y-5">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {service.issueDescription && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Symptom/Incident</h4>
                            <p className="text-sm text-neutral-800 font-medium leading-relaxed">{service.issueDescription}</p>
                          </div>
                        )}
                        {service.resolutionDescription && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Corrective Action</h4>
                            <p className="text-sm text-neutral-800 font-medium leading-relaxed">{service.resolutionDescription}</p>
                          </div>
                        )}
                      </div>

                      {/* Hardware Inventory Replacements */}
                      {service.partsReplaced && service.partsReplaced.length > 0 && (
                        <div className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-4">
                           <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Wrench size={12} /> Hardware Lifecycle Updates
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {service.partsReplaced.map((part, pidx) => (
                                <div key={pidx} className="bg-white border border-neutral-100 rounded-xl p-3 flex justify-between items-center group/part">
                                  <div>
                                    <p className="text-xs font-black text-neutral-800">{part.partName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">QTY: {part.quantity}</p>
                                  </div>
                                  <ChevronRight size={14} className="text-neutral-200 group-hover/part:text-primary-400 transition-colors" />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Metric Ribbon */}
                      <div className="flex flex-wrap gap-6 pt-4 border-t border-neutral-50">
                        {service.downtime && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-amber-500" />
                            <span className="text-xs font-black text-neutral-800 uppercase tracking-tighter">MTTR: {service.downtime}m</span>
                          </div>
                        )}
                        {service.cost && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-success-500" />
                            <span className="text-xs font-black text-neutral-800 uppercase tracking-tighter">Opex Impact: ${service.cost}</span>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
