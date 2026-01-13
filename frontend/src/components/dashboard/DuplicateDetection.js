import React, { useState, useEffect } from 'react';
import { AlertTriangle, Link2, Copy, Trash2, Search, CheckCircle2, History, X } from 'lucide-react';
import api from '../../api';

export default function DuplicateDetection({ complaintId, customerId, description, title, showToast }) {
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasDuplicates, setHasDuplicates] = useState(null);
  const [linkedDuplicates, setLinkedDuplicates] = useState([]);

  useEffect(() => {
    if (complaintId) {
      loadLinkedDuplicates();
    }
  }, [complaintId]);

  const detectDuplicates = async () => {
    try {
      setLoading(true);
      const res = await api.post('/duplicates/detect', { customerId, description, title });
      if (res.data.success) {
        setPotentialDuplicates(res.data.potentialDuplicates || []);
        setHasDuplicates(res.data.hasDuplicates);
      }
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      showToast?.('Error analyzing duplicates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedDuplicates = async () => {
    try {
      const res = await api.get(`/duplicates/complaints/${complaintId}`);
      if (res.data.success) {
        setLinkedDuplicates(res.data.duplicates || []);
      }
    } catch (error) {
      console.error('Error loading duplicates:', error);
    }
  };

  const handleLinkDuplicate = async (duplicateId) => {
    try {
      const res = await api.post('/duplicates/link', {
        primaryComplaintId: complaintId,
        duplicateComplaintId: duplicateId,
        linkReason: 'Auto-detected similar complaint'
      });

      if (res.data.success) {
        setPotentialDuplicates(potentialDuplicates.filter(d => d.id !== duplicateId));
        loadLinkedDuplicates();
        showToast?.('Tickets linked successfully', 'success');
      }
    } catch (error) {
      showToast?.('Failed to link tickets', 'error');
    }
  };

  const handleUnlinkDuplicate = async (linkId) => {
    try {
      const res = await api.delete(`/duplicates/link/${linkId}`);
      if (res.data.success) {
        loadLinkedDuplicates();
        showToast?.('Link removed', 'info');
      }
    } catch (error) {
      showToast?.('Failed to remove link', 'error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Linked Duplicates Section */}
      {linkedDuplicates.length > 0 && (
        <div className="glass-card border-primary-100 bg-primary-50/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500 rounded-lg text-white shadow-sm">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">Active Relationships</h3>
              <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Cross-referenced incidents</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {linkedDuplicates.map(link => (
              <div key={link.id} className="bg-white/80 backdrop-blur-sm border border-white rounded-xl p-3 flex items-center justify-between group hover:shadow-lg hover:shadow-primary-100/50 transition-all">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-500">
                     #{link.duplicateComplaintId}
                   </div>
                   <div>
                     <p className="text-xs font-black text-neutral-800">Linked Incident</p>
                     <p className="text-[10px] text-neutral-400 font-medium italic">{link.linkReason}</p>
                   </div>
                </div>
                <button
                  onClick={() => handleUnlinkDuplicate(link.id)}
                  className="p-2 text-neutral-300 hover:text-error-500 hover:bg-error-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Check Trigger */}
      <div className="glass-card p-2 bg-neutral-50/50 group">
        <button
          onClick={detectDuplicates}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
            loading 
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
              : 'bg-white text-neutral-800 border border-neutral-100 hover:border-amber-200 hover:text-amber-600 shadow-sm group-hover:shadow-md'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {loading ? 'Analyzing Neural Patterns...' : 'Run Similarity Analysis'}
        </button>
      </div>

      {/* Detection Results */}
      {potentialDuplicates.length > 0 && (
        <div className="glass-card border-amber-100 bg-amber-50/30 p-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">Potential Collisions</h3>
              <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">{potentialDuplicates.length} matches detected</p>
            </div>
          </div>

          <div className="space-y-3">
            {potentialDuplicates.map(complaint => (
              <div key={complaint.id} className="bg-white/90 border border-amber-100 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-amber-100/50 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-neutral-400 uppercase">INCIDENT #{complaint.id}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase tracking-tighter">
                      {complaint.similarityScore}% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-neutral-800 truncate mb-1">{complaint.title}</h4>
                  <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{complaint.description}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                     <span className={`px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-black rounded uppercase`}>
                       Status: {complaint.status}
                     </span>
                  </div>
                </div>
                <button
                  onClick={() => handleLinkDuplicate(complaint.id)}
                  className="mt-1 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Copy size={12} /> Link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negative Response */}
      {hasDuplicates === false && potentialDuplicates.length === 0 && !loading && (
        <div className="glass-card border-success-100 bg-success-50/10 p-8 text-center animate-pulse-slow">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-success-50 rounded-full text-success-500 mb-4 border border-success-100">
               <CheckCircle2 size={32} />
            </div>
            <p className="text-xs font-black text-neutral-800 uppercase tracking-widest mb-1">Uniqueness Verified</p>
            <p className="text-[10px] text-neutral-400 font-medium">No similar incidents detected in current cluster.</p>
          </div>
        </div>
      )}
    </div>
  );
}
