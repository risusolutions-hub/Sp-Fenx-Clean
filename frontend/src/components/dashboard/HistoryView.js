import React from 'react';
import { Plus } from 'lucide-react';

export default function HistoryView({ machines, customers, complaints, user, setModal }) {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Machine Service History</h3>
            <p className="text-sm text-neutral-600 mt-1">{machines.length} assets tracked</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map(m => {
            const cust = customers.find(c => c.id === m.customerId);
            const machineComplaints = complaints.filter(c => c.machineId === m.id);
            const count = machineComplaints.length;
            const lastService = machineComplaints.length > 0 
                ? new Date(machineComplaints[machineComplaints.length - 1].dateString).toLocaleDateString() 
                : 'N/A';

            return (
            <div key={m.id} className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:border-primary-400 transition-colors flex flex-col">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-neutral-900">{m.model}</h4>
                            <p className="text-xs text-neutral-600 mt-1">SN: {m.serialNumber}</p>
                        </div>
                        <span className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs text-neutral-700 font-medium">
                            {count} Tickets
                        </span>
                    </div>
                </div>
                
                <div className="p-4 space-y-3 flex-1">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600">Customer</span>
                        <span className="font-medium text-neutral-900 truncate max-w-[150px]">{cust?.company || cust?.name || 'Unknown'}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600">Last Service</span>
                        <span className="font-medium text-neutral-900">{lastService}</span>
                    </div>
                </div>
                
                <div className="p-3 border-t border-neutral-100 mt-auto">
                    <button className="w-full py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors border border-transparent hover:border-primary-200">
                        View Service Logs
                    </button>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
}
