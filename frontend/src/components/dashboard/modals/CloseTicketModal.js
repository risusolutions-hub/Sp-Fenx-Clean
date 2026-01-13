import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function CloseTicketModal({ complaint, onSubmit, onClose }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const notes = e.target.notes.value;
    onClose(); // Close the modal immediately
    onSubmit(complaint.id, notes); // Submit the data asynchronously
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
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
             <p className="text-sm text-amber-800">
               You are closing this ticket <strong>without a resolution</strong>. This action cannot be undone easily.
             </p>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Closing <span className="text-red-500">*</span></label>
             <textarea
               name="notes"
               placeholder="Please explain why the ticket is being closed..."
               className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[120px]"
               required
               disabled={isLoading} // Disable input while loading
             />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isLoading} // Disable cancel button while loading
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isLoading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} text-white`}
              disabled={isLoading} // Disable confirm button while loading
            >
              {isLoading ? 'Closing...' : 'Confirm Close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
