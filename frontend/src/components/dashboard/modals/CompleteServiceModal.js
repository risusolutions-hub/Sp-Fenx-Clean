import React from 'react';
import { X, Check } from 'lucide-react';

export default function CompleteServiceModal({ complaint, onSubmit, onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const solution = e.target.solution.value;
    const spares = e.target.spares.value;
    onSubmit(complaint.id, solution, spares);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex z-50 items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Close Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">Reference: {complaint.displayId || complaint.id}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Work Performed <span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-500 mb-2">Describe the technical solution and steps taken.</p>
            <textarea
              name="solution"
              placeholder="e.g. Replaced faulty power supply, callibrated X-axis..."
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parts & Materials</label>
            <input
              name="spares"
              type="text"
              placeholder="Enter parts used..."
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
