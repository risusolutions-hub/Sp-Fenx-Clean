import React from 'react';
import { Plus, Building2, Phone, Hash, Box, ArrowUpRight } from 'lucide-react';

export default function CustomersView({ customers, machines, user, setModal }) {
  return (
    <div className="fade-in space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Client Portfolio</h2>
          <p className="text-neutral-500 font-medium mt-1">Strategic account management and asset distribution</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-primary-100 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{customers.length} Active Accounts</span>
          </div>
          {(user?.role !== 'engineer') && (
            <button 
              onClick={() => setModal('complaint')} 
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-200/50 transition-all active:scale-95 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
              title="Create New Ticket"
            >
              <Plus className="w-5 h-5" />
              <span>Log Incident</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden border-primary-50/50">
        <div className="p-6 border-b border-primary-50/50 bg-neutral-50/30 flex items-center gap-3">
          <div className="w-2 h-8 bg-primary-500 rounded-full" />
          <h3 className="font-extrabold text-neutral-800 tracking-tight text-lg">Account Directory</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Company Profile</th>
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Service Protocol</th>
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Communications</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Asset Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/30">
              {customers.map(c => {
                const machineCount = machines.filter(m => m.customerId === c.id).length;
                return (
                  <tr key={c.id} className="group hover:bg-primary-50/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 border border-primary-200 shadow-sm group-hover:scale-110 transition-transform">
                          <Building2 size={24} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-neutral-800 leading-tight">{c.company || c.name}</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{c.city || 'Global Account'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-primary-400" />
                        <span className="font-mono text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                          {c.serviceNo || c.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Phone size={12} className="opacity-50" />
                          <span className="text-xs font-bold">{c.contact || c.phone || 'N/A'}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium lowercase italic">{c.email || 'no-email-recorded'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-neutral-800 leading-none">{machineCount}</span>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Hardwares</span>
                        </div>
                        <div className="p-2 rounded-xl bg-neutral-50 text-neutral-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-inner">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
